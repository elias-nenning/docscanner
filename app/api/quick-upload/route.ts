import { NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), ".tmp-uploads");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const token = randomUUID();
    const ext = path.extname(file.name) || ".bin";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = path.join(UPLOAD_DIR, `${token}${ext}`);
    const metaPath = path.join(UPLOAD_DIR, `${token}.json`);

    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(filePath, buffer);
    writeFileSync(
      metaPath,
      JSON.stringify({
        name: file.name,
        safeName,
        type: file.type,
        size: file.size,
        ext,
        createdAt: Date.now(),
      }),
    );

    return NextResponse.json({ token, url: `/scan/${token}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
