// eslint-disable-next-line @typescript-eslint/no-require-imports
import XLSX from "xlsx";
import type { ExtrahiertesFeld } from "./types";

export function exportToXlsx(
  felder: Record<string, ExtrahiertesFeld>,
  dateiName = "scan-ergebnis",
) {
  const rows = Object.entries(felder).map(([name, feld]) => ({
    Feldname: name,
    Wert: feld.wert,
    "Konfidenz (%)": Math.round(feld.konfidenz * 100),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ergebnis");

  ws["!cols"] = [{ wch: 25 }, { wch: 40 }, { wch: 15 }];

  XLSX.writeFile(wb, `${dateiName}.xlsx`);
}
