import { NextResponse } from "next/server";
import { writeFileSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  UPLOAD_DIR,
  cleanupExpiredUploads,
  ensureUploadDir,
  writeUploadMeta,
} from "@/lib/server/uploads";

export async function POST(request: Request) {
  try {
    cleanupExpiredUploads();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Keine Datei uebermittelt" }, { status: 400 });
    }

    ensureUploadDir();

    const token = randomUUID();
    const ext = path.extname(file.name) || ".bin";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = path.join(UPLOAD_DIR, `${token}${ext}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(filePath, buffer);
    writeUploadMeta(token, {
      name: file.name,
      safeName,
      type: file.type,
      size: file.size,
      ext,
      createdAt: Date.now(),
    });

    return NextResponse.json({ token, url: `/scan/${token}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
