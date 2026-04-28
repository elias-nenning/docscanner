import { scanConfig } from "@/lib/server/scan/config";
import type { ScanFieldValue } from "@/lib/server/scan/types";

type LlmExtractResult = {
  dokument_typ: string;
  felder: Record<string, ScanFieldValue>;
};

export function normalizeOcrForExtraction(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[\u00A0\t]+/g, " ")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function detectDocumentType(text: string): string {
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
    [["kündigung", "kuendigung", "cancellation", "termination"], "Kuendigung"],
    [["zeugnis", "certificate", "bescheinigung"], "Zeugnis"],
    [["lebenslauf", "curriculum", "resume", "cv"], "Lebenslauf"],
    [["brief", "schreiben", "letter"], "Brief"],
  ];
  for (const [keywords, label] of types) {
    if (keywords.some((keyword) => t.includes(keyword))) return label;
  }
  return "Dokument";
}

export async function tryOllamaExtract(
  ocrText: string,
  fields: string[],
): Promise<LlmExtractResult | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), scanConfig.ollamaTimeoutMs);
    try {
      const res = await fetch(`${scanConfig.ollamaUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || "llama3.2",
          stream: false,
          prompt: `Extract structured data from this OCR text.\n\nFields: ${JSON.stringify(fields)}\n\nText:\n${ocrText.substring(0, 6000)}\n\nRespond ONLY with JSON:\n{"dokument_typ":"<type in German>","felder":{"<field>":{"wert":"<value>","konfidenz":<0-1>}}}`,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const match = (data.response || "").match(/\{[\s\S]*\}/);
      if (!match) return null;
      return JSON.parse(match[0]);
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    return null;
  }
}

export function sanitizeLlmFields(
  schema: string[],
  llmFields: Record<string, { wert?: unknown; konfidenz?: unknown }> | undefined,
): Record<string, ScanFieldValue> {
  const fields: Record<string, ScanFieldValue> = {};
  for (const field of schema) {
    const raw = llmFields?.[field];
    if (
      raw &&
      (typeof raw.wert === "string" || typeof raw.wert === "number")
    ) {
      const confidence =
        typeof raw.konfidenz === "number" && Number.isFinite(raw.konfidenz)
          ? Math.min(1, Math.max(0, raw.konfidenz))
          : 0.75;
      fields[field] = { wert: String(raw.wert), konfidenz: confidence };
    } else {
      fields[field] = { wert: "", konfidenz: 0 };
    }
  }
  return fields;
}

export function extractFields(
  text: string,
  requestedFields: string[],
): Record<string, ScanFieldValue> {
  const result: Record<string, ScanFieldValue> = {};
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
      regexes: [/(?:Betreff|Betr|Subject|Regarding)\s*\.?\s*:\s*(.+)/i],
      conf: 0.8,
    },
    Firma: {
      regexes: [
        /(?:Firma|Company|Unternehmen)\s*:?\s*(.+)/i,
        /^([A-ZÄÖÜ][\w\s&.,'-]+(?:GmbH|AG|KG|OHG|e\.?\s*K\.?|UG|Ltd\.?|Inc\.?|SE|mbH|Co\.?\s*KG|& Co)\.?)/im,
      ],
      conf: 0.7,
    },
    Absender: { regexes: [/(?:Absender|Von|From|Sender)\s*:?\s*(.+)/i], conf: 0.7 },
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
      regexes: [/(\d{5}\s+[A-ZÄÖÜ][a-zäöüß]+(?:\s+[a-zäöüß]+)?)/],
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
        /(?:Gesamt(?:betrag)?|Total|Summe|Endbetrag|Brutto(?:betrag)?|Rechnungsbetrag|Amount\s*due|Zahlbetrag|Balance\s*due)\s*:?\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*(?:€|EUR)?/i,
        /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*€/,
        /€\s*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/,
        /\$\s*(\d{1,3}(?:,\d{3})*\.\d{2})/,
      ],
      conf: 0.75,
    },
    Währung: { regexes: [/(EUR|USD|CHF|GBP)/i, /(€|\$|£|Fr\.)/], conf: 0.9 },
    IBAN: {
      regexes: [/(?:IBAN\s*:?\s*)?([A-Z]{2}\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{0,2})/],
      conf: 0.9,
    },
    BIC: {
      regexes: [/(?:BIC|SWIFT)[-\s]?(?:Code)?\s*:?\s*([A-Z]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)/i],
      conf: 0.9,
    },
    Steuernummer: {
      regexes: [/(?:Steuer[-\s]?(?:Nr|Nummer)\.?|Tax\s*(?:No|ID|Number)\.?|St\.?-?Nr\.?)\s*:?\s*([\d\s/]{6,})/i],
      conf: 0.8,
    },
    "USt-IdNr": {
      regexes: [/(?:USt\.?-?\s*Id\.?-?\s*Nr\.?|VAT\s*ID|VAT\s*Reg|Ust\.?\s*Id)\s*:?\s*([A-Z]{2}\s*\d{6,})/i],
      conf: 0.9,
    },
    Telefon: {
      regexes: [/(?:Tel(?:efon)?|Phone|Fon|Mobil|Mobile|Handy)\.?\s*:?\s*([\d\s/+()-]{7,})/i],
      conf: 0.8,
    },
    Fax: { regexes: [/(?:Fax)\.?\s*:?\s*([\d\s/+()-]{7,})/i], conf: 0.8 },
    Email: {
      regexes: [/(?:E-?\s*Mail|Email)\s*:?\s*([\w.+-]+@[\w.-]+\.\w{2,})/i, /([\w.+-]+@[\w.-]+\.\w{2,})/],
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
      regexes: [/(?:Zahlungs?[-\s]?(?:ziel|frist|bedingung(?:en)?)|Payment\s*(?:due|terms?|deadline)|Fällig(?:keit)?(?:sdatum)?|Due\s*date)\s*:?\s*(.+)/i],
      conf: 0.7,
    },
    Lieferdatum: {
      regexes: [/(?:Liefer[-\s]?(?:datum|termin)|Delivery\s*date|Versanddatum|Ship\s*date)\s*:?\s*(\d{1,2}[./]\d{1,2}[./]\d{2,4})/i],
      conf: 0.8,
    },
    Bankname: {
      regexes: [/(?:Bank|Kreditinstitut)\s*:?\s*(.+)/i],
      conf: 0.7,
    },
    Kontoinhaber: {
      regexes: [/(?:Kontoinhaber|Account\s*holder|Inhaber)\s*:?\s*(.+)/i],
      conf: 0.7,
    },
  };

  for (const field of requestedFields) {
    const pattern = patterns[field];
    if (!pattern) continue;
    for (const regex of pattern.regexes) {
      const match = text.match(regex);
      if (match) {
        result[field] = { wert: (match[1] || match[0]).trim(), konfidenz: pattern.conf };
        break;
      }
    }
  }

  for (const line of text.split("\n")) {
    const kvMatch = line.match(/^([A-ZÄÖÜa-zäöüß][\w\s./-]{1,30}?)\s*:\s*(.{2,})$/);
    if (!kvMatch) continue;
    const label = kvMatch[1].trim();
    const value = kvMatch[2].trim();
    if (value.length > 200 || label.length < 4) continue;

    for (const field of requestedFields) {
      if (result[field]) continue;
      const fieldLower = field.toLowerCase();
      const labelLower = label.toLowerCase();
      const labelNorm = labelLower.replace(/[-\s.]/g, "");
      const fieldNorm = fieldLower.replace(/[-\s.]/g, "");
      const longEnough = labelNorm.length >= 4;
      if (
        labelLower.includes(fieldLower) ||
        (longEnough && fieldLower.includes(labelLower)) ||
        (longEnough && labelNorm.includes(fieldNorm))
      ) {
        result[field] = { wert: value, konfidenz: 0.6 };
        break;
      }
    }
  }

  const out: Record<string, ScanFieldValue> = {};
  for (const field of requestedFields) {
    out[field] = result[field] ?? { wert: "", konfidenz: 0 };
  }
  return out;
}
