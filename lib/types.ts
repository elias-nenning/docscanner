export interface ExtrahiertesFeld {
  wert: string;
  konfidenz: number;
}

export interface ScanResult {
  dokument_typ: string;
  felder: Record<string, ExtrahiertesFeld>;
  rohtext: string;
  ocr_konfidenz: number;
}

export const ALL_SCAN_FIELDS = [
  "Datum",
  "Rechnungsnummer",
  "Kundennummer",
  "Betreff",
  "Firma",
  "Absender",
  "Empfänger",
  "Adresse",
  "Standort",
  "Nettobetrag",
  "MwSt",
  "Betrag",
  "Währung",
  "IBAN",
  "BIC",
  "Steuernummer",
  "USt-IdNr",
  "Telefon",
  "Email",
  "Website",
  "Zahlungsziel",
  "Lieferdatum",
];
