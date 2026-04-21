import { NextResponse } from "next/server";
import path from "path";
import { writeFileSync, unlinkSync } from "fs";
import { randomUUID } from "crypto";
import os from "os";

interface ScanResult {
  dokument_typ: string;
  felder: Record<string, { wert: string; konfidenz: number }>;
  ocr_konfidenz: number;
  rohtext: string;
}

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

const workerPath = path.join(
  process.cwd(),
  "node_modules",
  "tesseract.js",
  "src",
  "worker-script",
  "node",
  "index.js",
);

async function bufferToTempFile(buffer: Buffer, ext: string): Promise<string> {
  const tmpPath = path.join(os.tmpdir(), `scandesk-${randomUUID()}.${ext}`);
  writeFileSync(tmpPath, buffer);
  return tmpPath;
}

async function pdfToImages(pdfBuffer: Buffer): Promise<Buffer[]> {
  const { pdf } = await import("pdf-to-img");
  const images: Buffer[] = [];
  const doc = await pdf(pdfBuffer, { scale: 2 });
  for await (const page of doc) {
    images.push(Buffer.from(page));
  }
  return images;
}

async function ocrBuffer(imageBuffer: Buffer): Promise<{ text: string; confidence: number }> {
  const Tesseract = await import("tesseract.js");
  const tmpFile = await bufferToTempFile(imageBuffer, "png");
  try {
    const worker = await Tesseract.createWorker("deu+eng", undefined, {
      workerPath,
      logger: () => {},
    });
    const { data } = await worker.recognize(tmpFile);
    await worker.terminate();
    return { text: data.text, confidence: data.confidence / 100 };
  } finally {
    try { unlinkSync(tmpFile); } catch {}
  }
}

async function ocrFile(
  buffer: Buffer,
  mimeType: string,
): Promise<{ text: string; confidence: number }> {
  if (mimeType === "application/pdf") {
    const pages = await pdfToImages(buffer);
    if (pages.length === 0) throw new Error("PDF enthält keine Seiten.");
    let allText = "";
    let totalConf = 0;
    for (const page of pages) {
      const { text, confidence } = await ocrBuffer(page);
      allText += text + "\n";
      totalConf += confidence;
    }
    return { text: allText.trim(), confidence: totalConf / pages.length };
  }
  return ocrBuffer(buffer);
}

async function tryOllamaExtract(
  ocrText: string,
  fields: string[],
): Promise<{ dokument_typ: string; felder: Record<string, { wert: string; konfidenz: number }> } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama3.2",
        stream: false,
        prompt: `Extract structured data from this OCR text.\n\nFields: ${JSON.stringify(fields)}\n\nText:\n${ocrText.substring(0, 6000)}\n\nRespond ONLY with JSON:\n{"dokument_typ":"<type in German>","felder":{"<field>":{"wert":"<value>","konfidenz":<0-1>}}}`,
      }),
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const match = (data.response || "").match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function detectDocumentType(text: string): string {
  const t = text.toLowerCase();
  const types: [string[], string][] = [
    [["rechnung", "invoice", "rechnungsnr"], "Rechnung"],
    [["angebot", "quotation", "quote"], "Angebot"],
    [["vertrag", "contract", "vereinbarung"], "Vertrag"],
    [["lieferschein", "delivery note", "packing"], "Lieferschein"],
    [["mahnung", "zahlungserinnerung", "reminder"], "Mahnung"],
    [["gutschrift", "credit note"], "Gutschrift"],
    [["bestellung", "purchase order", "order"], "Bestellung"],
    [["quittung", "receipt", "kassenbon"], "Quittung"],
    [["kündigung", "cancellation", "termination"], "Kündigung"],
    [["zeugnis", "certificate", "bescheinigung"], "Zeugnis"],
    [["lebenslauf", "curriculum", "resume", "cv"], "Lebenslauf"],
    [["brief", "schreiben", "letter"], "Brief"],
  ];
  for (const [keywords, label] of types) {
    if (keywords.some((k) => t.includes(k))) return label;
  }
  return "Dokument";
}

function extractFields(
  text: string,
  requestedFields: string[],
): Record<string, { wert: string; konfidenz: number }> {
  const result: Record<string, { wert: string; konfidenz: number }> = {};

  const patterns: Record<string, { regexes: RegExp[]; conf: number }> = {
    Datum: {
      regexes: [
        /(?:Datum|Date|Rechnungsdatum|Belegdatum)\s*:?\s*(\d{1,2}[./]\d{1,2}[./]\d{2,4})/i,
        /(\d{1,2}\.\s*(?:Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s*\d{4})/i,
        /(\d{4}-\d{2}-\d{2})/,
        /(\d{1,2}[./]\d{1,2}[./]\d{2,4})/,
      ],
      conf: 0.75,
    },
    Rechnungsnummer: {
      regexes: [
        /(?:Rechnungs?[-\s]?(?:Nr|Nummer|no)\.?\s*:?\s*)([\w\d/-]+)/i,
        /(?:Invoice\s*(?:No|Number|#)\.?\s*:?\s*)([\w\d/-]+)/i,
        /(?:Belegnr\.?\s*:?\s*)([\w\d/-]+)/i,
        /(RE[-\s]?\d[\w-]*)/i,
        /(INV[-\s]?\d[\w-]*)/i,
      ],
      conf: 0.8,
    },
    Kundennummer: {
      regexes: [
        /(?:Kunden?[-\s]?(?:Nr|Nummer|no|ID)\.?\s*:?\s*)([\w\d/-]+)/i,
        /(?:Customer\s*(?:No|Number|ID)\.?\s*:?\s*)([\w\d/-]+)/i,
        /(?:Kd\.?\s*Nr\.?\s*:?\s*)([\w\d/-]+)/i,
      ],
      conf: 0.8,
    },
    Betreff: {
      regexes: [
        /(?:Betreff|Betr|Subject|Regarding)\s*\.?\s*:\s*(.+)/i,
      ],
      conf: 0.8,
    },
    Firma: {
      regexes: [
        /(?:Firma|Company|Unternehmen)\s*:?\s*(.+)/i,
        /^([A-ZÄÖÜ][\w\s&.,'-]+(?:GmbH|AG|KG|OHG|e\.?\s*K\.?|UG|Ltd\.?|Inc\.?|SE|mbH|Co\.?\s*KG|& Co)\.?)/im,
      ],
      conf: 0.7,
    },
    Absender: {
      regexes: [
        /(?:Absender|Von|From|Sender)\s*:?\s*(.+)/i,
      ],
      conf: 0.7,
    },
    Empfänger: {
      regexes: [
        /(?:Empf(?:ä|ae?)nger|Kunde|Customer|Recipient|Bill\s*to|Rechnung\s*an|Invoice\s*to)\s*:?\s*(.+)/i,
      ],
      conf: 0.7,
    },
    Adresse: {
      regexes: [
        /(?:Adresse|Address|Anschrift)\s*:?\s*(.+)/i,
        /([A-ZÄÖÜ][a-zäöüß]*(?:str|straße|weg|platz|gasse|allee|ring|damm|ufer)\.?\s*\d+[a-z]?(?:\s*,?\s*\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+)?)/i,
      ],
      conf: 0.65,
    },
    Standort: {
      regexes: [
        /(\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+(?:\s+[a-zäöüß]+)?)/,
      ],
      conf: 0.7,
    },
    Nettobetrag: {
      regexes: [
        /(?:Netto(?:betrag)?|Net(?:\s*amount)?|Zwischensumme|Subtotal)\s*:?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:€|EUR)?/i,
      ],
      conf: 0.8,
    },
    MwSt: {
      regexes: [
        /(?:MwSt|USt|Mehrwertsteuer|VAT|Umsatzsteuer)\.?\s*(?:\d{1,2}\s*%\s*)?:?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:€|EUR)?/i,
        /(\d{1,2}\s*%)\s*(?:MwSt|USt|Mehrwertsteuer|VAT)/i,
      ],
      conf: 0.8,
    },
    Betrag: {
      regexes: [
        /(?:Gesamt(?:betrag)?|Total|Summe|Endbetrag|Brutto(?:betrag)?|Rechnungsbetrag|Amount\s*due|Zahlbetrag)\s*:?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:€|EUR)?/i,
        /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*€/,
        /€\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/,
      ],
      conf: 0.75,
    },
    Währung: {
      regexes: [/(EUR|USD|CHF|GBP)/i, /(€|\$|£|Fr\.)/],
      conf: 0.9,
    },
    IBAN: {
      regexes: [
        /(?:IBAN\s*:?\s*)?([A-Z]{2}\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{0,2})/,
      ],
      conf: 0.9,
    },
    BIC: {
      regexes: [
        /(?:BIC|SWIFT)[-\s]?(?:Code)?\s*:?\s*([A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)/i,
      ],
      conf: 0.9,
    },
    Steuernummer: {
      regexes: [
        /(?:Steuer[-\s]?(?:Nr|Nummer)\.?|Tax\s*(?:No|ID|Number)\.?|St\.?-?Nr\.?)\s*:?\s*([\d\s/]{6,})/i,
      ],
      conf: 0.8,
    },
    "USt-IdNr": {
      regexes: [
        /(?:USt\.?-?\s*Id\.?-?\s*Nr\.?|VAT\s*ID|VAT\s*Reg|Ust\.?\s*Id)\s*:?\s*([A-Z]{2}\s*\d{6,})/i,
      ],
      conf: 0.9,
    },
    Telefon: {
      regexes: [
        /(?:Tel(?:efon)?|Phone|Fon|Mobil|Mobile|Handy)\.?\s*:?\s*([\d\s/+()-]{7,})/i,
      ],
      conf: 0.8,
    },
    Fax: {
      regexes: [
        /(?:Fax)\.?\s*:?\s*([\d\s/+()-]{7,})/i,
      ],
      conf: 0.8,
    },
    Email: {
      regexes: [
        /(?:E-?\s*Mail|Email)\s*:?\s*([\w.+-]+@[\w.-]+\.\w{2,})/i,
        /([\w.+-]+@[\w.-]+\.\w{2,})/,
      ],
      conf: 0.9,
    },
    Website: {
      regexes: [
        /(?:Web(?:site)?|Homepage|URL|Internet)\s*:?\s*((?:https?:\/\/|www\.)[\w.-]+\.\w{2,}[\w/.-]*)/i,
        /((?:www\.)[\w.-]+\.\w{2,}[\w/.-]*)/i,
      ],
      conf: 0.9,
    },
    Zahlungsziel: {
      regexes: [
        /(?:Zahlungs?[-\s]?(?:ziel|frist|bedingung(?:en)?)|Payment\s*(?:due|terms?|deadline)|Fällig(?:keit)?(?:sdatum)?|Due\s*date)\s*:?\s*(.+)/i,
      ],
      conf: 0.7,
    },
    Lieferdatum: {
      regexes: [
        /(?:Liefer[-\s]?(?:datum|termin)|Delivery\s*date|Versanddatum|Ship\s*date)\s*:?\s*(\d{1,2}[./]\d{1,2}[./]\d{2,4})/i,
      ],
      conf: 0.8,
    },
    Bankname: {
      regexes: [
        /(?:Bank|Kreditinstitut)\s*:?\s*(.+)/i,
      ],
      conf: 0.7,
    },
    Kontoinhaber: {
      regexes: [
        /(?:Kontoinhaber|Account\s*holder|Inhaber)\s*:?\s*(.+)/i,
      ],
      conf: 0.7,
    },
  };

  // Phase 1: Apply known patterns to requested fields
  for (const field of requestedFields) {
    const p = patterns[field];
    if (!p) continue;
    for (const regex of p.regexes) {
      const match = text.match(regex);
      if (match) {
        result[field] = { wert: (match[1] || match[0]).trim(), konfidenz: p.conf };
        break;
      }
    }
  }

  // Phase 2: Line-by-line scan for "Label: Value" pairs not yet captured
  const lines = text.split("\n");
  for (const line of lines) {
    const kvMatch = line.match(/^([A-ZÄÖÜa-zäöüß][\w\s./-]{1,30}?)\s*:\s*(.{2,})$/);
    if (!kvMatch) continue;
    const label = kvMatch[1].trim();
    const value = kvMatch[2].trim();
    if (value.length > 200) continue;

    for (const field of requestedFields) {
      if (result[field]) continue;
      const fieldLower = field.toLowerCase();
      const labelLower = label.toLowerCase();
      if (
        labelLower.includes(fieldLower) ||
        fieldLower.includes(labelLower) ||
        labelLower.replace(/[-\s.]/g, "").includes(fieldLower.replace(/[-\s.]/g, ""))
      ) {
        result[field] = { wert: value, konfidenz: 0.6 };
        break;
      }
    }
  }

  // Phase 3: Auto-discover additional key-value pairs from the document
  const existingLower = new Set(Object.keys(result).map((k) => k.toLowerCase().replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[c] || c)));
  for (const line of lines) {
    const kvMatch = line.match(/^([A-ZÄÖÜa-zäöüß][\w\s./-]{1,30}?)\s*:\s*(.{2,})$/);
    if (!kvMatch) continue;
    const label = kvMatch[1].trim();
    const value = kvMatch[2].trim();
    if (value.length > 200) continue;
    if (result[label]) continue;
    const normalized = label.toLowerCase().replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[c] || c);
    if (existingLower.has(normalized)) continue;
    const skipLabels = ["http", "https", "www"];
    if (skipLabels.some((s) => normalized.startsWith(s))) continue;
    result[label] = { wert: value, konfidenz: 0.55 };
    existingLower.add(normalized);
  }

  // Fill missing requested fields with empty
  for (const field of requestedFields) {
    if (!result[field]) {
      result[field] = { wert: "", konfidenz: 0 };
    }
  }

  return result;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const schemaRaw = formData.get("schema");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Keine Datei empfangen." }, { status: 400 });
    }
    if (typeof schemaRaw !== "string") {
      return NextResponse.json({ error: "Schema fehlt." }, { status: 400 });
    }

    const schema = JSON.parse(schemaRaw) as string[];
    if (schema.length === 0) {
      return NextResponse.json(
        { error: "Mindestens ein Feld muss ausgewählt sein." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { text: ocrText, confidence: ocrConfidence } = await ocrFile(buffer, file.type);

    if (!ocrText.trim()) {
      return NextResponse.json(
        { error: "Kein Text erkannt. Bitte stelle sicher, dass das Dokument lesbar ist." },
        { status: 422 },
      );
    }

    const llmResult = await tryOllamaExtract(ocrText, schema);

    let felder: Record<string, { wert: string; konfidenz: number }>;
    let dokumentTyp: string;

    if (llmResult?.felder) {
      felder = llmResult.felder;
      dokumentTyp = llmResult.dokument_typ || detectDocumentType(ocrText);
      for (const field of schema) {
        if (!felder[field]) felder[field] = { wert: "", konfidenz: 0 };
      }
    } else {
      felder = extractFields(ocrText, schema);
      dokumentTyp = detectDocumentType(ocrText);
    }

    return NextResponse.json({
      dokument_typ: dokumentTyp,
      felder,
      ocr_konfidenz: ocrConfidence,
      rohtext: ocrText,
    } satisfies ScanResult);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
