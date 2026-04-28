export interface SchemaFeld {
  name: string;
  aktiv: boolean;
  custom?: boolean;
}

export interface ExtrahiertesFeld {
  wert: string;
  konfidenz: number;
}

export interface ScanResult {
  dokument_typ: string;
  felder: Record<string, ExtrahiertesFeld>;
  rohtext: string;
  ocr_konfidenz: number;
  kurzbeschreibung?: string;
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
  "Bankname",
  "Kontoinhaber",
  "Steuernummer",
  "USt-IdNr",
  "Telefon",
  "Fax",
  "Email",
  "Website",
  "Zahlungsziel",
  "Lieferdatum",
];
