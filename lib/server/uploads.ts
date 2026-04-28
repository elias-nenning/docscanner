import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import path from "path";

export const UPLOAD_DIR = path.join(process.cwd(), ".tmp-uploads");
const DEFAULT_TTL_MS = 1000 * 60 * 30;

type UploadMeta = {
  name: string;
  safeName: string;
  type: string;
  size: number;
  ext: string;
  createdAt: number;
  expiresAt: number;
};

export function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export function getUploadTtlMs(): number {
  const parsed = Number.parseInt(process.env.QUICK_UPLOAD_TTL_MS || "", 10);
  if (!Number.isFinite(parsed)) return DEFAULT_TTL_MS;
  return Math.min(1000 * 60 * 60 * 24, Math.max(1000 * 60, parsed));
}

export function writeUploadMeta(token: string, meta: Omit<UploadMeta, "expiresAt">) {
  ensureUploadDir();
  const metaPath = path.join(UPLOAD_DIR, `${token}.json`);
  const fullMeta: UploadMeta = {
    ...meta,
    expiresAt: meta.createdAt + getUploadTtlMs(),
  };
  writeFileSync(metaPath, JSON.stringify(fullMeta));
}

export function readUploadMeta(token: string): UploadMeta | null {
  const metaPath = path.join(UPLOAD_DIR, `${token}.json`);
  if (!existsSync(metaPath)) return null;
  return JSON.parse(readFileSync(metaPath, "utf-8")) as UploadMeta;
}

export function cleanupUpload(token: string, ext?: string) {
  const metaPath = path.join(UPLOAD_DIR, `${token}.json`);
  const filePath = ext ? path.join(UPLOAD_DIR, `${token}${ext}`) : null;
  try {
    if (filePath && existsSync(filePath)) unlinkSync(filePath);
  } catch {
    /* ignore */
  }
  try {
    if (existsSync(metaPath)) unlinkSync(metaPath);
  } catch {
    /* ignore */
  }
}

export function cleanupExpiredUploads(now = Date.now()) {
  ensureUploadDir();
  for (const entry of readdirSync(UPLOAD_DIR)) {
    if (!entry.endsWith(".json")) continue;
    const token = entry.replace(/\.json$/, "");
    try {
      const meta = readUploadMeta(token);
      if (!meta) continue;
      if (meta.expiresAt <= now) {
        cleanupUpload(token, meta.ext);
      }
    } catch {
      cleanupUpload(token);
    }
  }
}
