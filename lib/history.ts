export interface ScanHistoryEntry {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  fieldCount: number;
  confidence: number;
  scannedAt: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

const STORAGE_KEY = "scandesk-history";
const MAX_ENTRIES = 50;

export function getHistory(): ScanHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(
  entry: Omit<ScanHistoryEntry, "id" | "scannedAt">
): void {
  const history = getHistory();
  const newEntry: ScanHistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    scannedAt: new Date().toISOString(),
  };
  const updated = [newEntry, ...history].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  if (hours < 24) return `vor ${hours} Std.`;
  if (days === 1) return "Gestern";
  return `vor ${days} Tagen`;
}
