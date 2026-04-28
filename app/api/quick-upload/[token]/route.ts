import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";
import {
  UPLOAD_DIR,
  cleanupExpiredUploads,
  cleanupUpload,
  readUploadMeta,
} from "@/lib/server/uploads";

export async function GET(
  _request: Request,
  { params }: { params: { token: string } },
) {
  const { token } = params;
  cleanupExpiredUploads();

  if (!/^[a-f0-9-]{36}$/.test(token)) {
    return NextResponse.json({ error: "Ungueltiger Token" }, { status: 400 });
  }

  const meta = readUploadMeta(token);
  if (!meta) {
    return NextResponse.json({ error: "Datei nicht gefunden oder abgelaufen" }, { status: 404 });
  }

  if (meta.expiresAt <= Date.now()) {
    cleanupUpload(token, meta.ext);
    return NextResponse.json({ error: "Datei ist abgelaufen" }, { status: 410 });
  }

  const filePath = path.join(UPLOAD_DIR, `${token}${meta.ext}`);

  if (!existsSync(filePath)) {
    cleanupUpload(token, meta.ext);
    return NextResponse.json({ error: "Dateidaten fehlen" }, { status: 404 });
  }

  const buffer = readFileSync(filePath);

  // Clean up after serving
  cleanupUpload(token, meta.ext);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": meta.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${meta.name}"`,
      "X-File-Name": encodeURIComponent(meta.name),
      "X-File-Type": meta.type,
      "X-File-Size": String(meta.size),
    },
  });
}
