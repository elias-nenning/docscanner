# DocScanner

Universeller KI-Dokumentenscanner als Next.js 14 Web-App.  
3-Spalten-Layout: Dokument hochladen, Schema definieren, Ergebnis ansehen und als XLS exportieren.

## Stack

- Next.js 14 (App Router), TypeScript strict
- Tailwind CSS
- react-dropzone (Datei-Upload)
- xlsx (Excel-Export)
- n8n Webhook (OCR + KI Pipeline)

## Setup

1. `cp .env.example .env.local`
2. `N8N_WEBHOOK_URL` in `.env.local` eintragen
3. `npm install`
4. `npm run dev`
5. Browser: http://localhost:3000

## Ablauf

1. Datei in die linke Spalte ziehen (PDF, JPG, PNG, TIFF, WEBP)
2. In der mittleren Spalte Felder auswaehlen oder eigene hinzufuegen
3. "Scan starten" klicken
4. Rechts erscheinen die extrahierten Felder mit Konfidenz-Balken
5. XLS-Download oder OCR-Rohtext kopieren

## n8n Workflow

Der n8n Webhook empfaengt:

```json
{
  "datei_name": "rechnung.pdf",
  "datei_typ": "application/pdf",
  "datei_base64": "...",
  "gesuchte_felder": ["Rechnungsnummer", "Betrag", "Datum"]
}
```

Und muss zurueckgeben:

```json
{
  "dokument_typ": "Rechnung",
  "kurzbeschreibung": "Rechnung von Telekom ueber 49,99 EUR",
  "felder": {
    "Rechnungsnummer": { "wert": "RE-2025-001234", "konfidenz": 0.98 },
    "Betrag": { "wert": "49,99 EUR", "konfidenz": 0.95 },
    "Datum": { "wert": "15.01.2025", "konfidenz": 0.97 }
  },
  "volltext": "Kompletter OCR Text...",
  "ocr_konfidenz": 0.94
}
```
