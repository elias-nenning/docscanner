import type { ScanResult } from "@/lib/types";

export type DocumentQuality = "strong" | "review" | "weak" | "empty";

export function getFilledFieldCount(result: ScanResult): number {
  return Object.values(result.felder).filter((field) => field.wert?.trim()).length;
}

export function getTotalFieldCount(result: ScanResult): number {
  return Object.keys(result.felder).length;
}

export function getAverageFieldConfidence(result: ScanResult): number {
  const filled = Object.values(result.felder).filter((field) => field.wert?.trim());
  if (filled.length === 0) return 0;
  const total = filled.reduce((sum, field) => sum + field.konfidenz, 0);
  return total / filled.length;
}

export function getDocumentQuality(result: ScanResult): DocumentQuality {
  const filledCount = getFilledFieldCount(result);
  if (filledCount === 0) return "empty";
  const ocr = result.ocr_konfidenz;
  const avgField = getAverageFieldConfidence(result);

  if (ocr >= 0.8 && avgField >= 0.78) return "strong";
  if (ocr >= 0.55 && avgField >= 0.45) return "review";
  return "weak";
}

export function getDocumentQualityLabel(result: ScanResult): string {
  const quality = getDocumentQuality(result);
  if (quality === "strong") return "Sicher";
  if (quality === "review") return "Pruefen";
  if (quality === "weak") return "Unsicher";
  return "Leer";
}

export function getDocumentQualityDescription(result: ScanResult): string {
  const quality = getDocumentQuality(result);
  if (quality === "strong") {
    return "OCR und Feldtreffer sind stark. Das Dokument wirkt gut ausgelesen.";
  }
  if (quality === "review") {
    return "Die meisten Inhalte wurden erkannt. Einzelne Felder sollten geprueft werden.";
  }
  if (quality === "weak") {
    return "Mehrere Felder sind unsicher. Vorschau und Rohtext bitte gegenpruefen.";
  }
  return "Kein verwertbarer Inhalt erkannt. Dokument oder Qualitaet pruefen.";
}
