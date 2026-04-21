import { NextResponse } from "next/server";
import { readFileSync, existsSync, unlinkSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), ".tmp-uploads");

export async function GET(
  _request: Request,
  { params }: { params: { token: string } },
) {
  const { token } = params;

  if (!/^[a-f0-9-]{36}$/.test(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const metaPath = path.join(UPLOAD_DIR, `${token}.json`);
  if (!existsSync(metaPath)) {
    return NextResponse.json({ error: "File not found or expired" }, { status: 404 });
  }

  const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
  const filePath = path.join(UPLOAD_DIR, `${token}${meta.ext}`);

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "File data missing" }, { status: 404 });
  }

  const buffer = readFileSync(filePath);

  // Clean up after serving
  try {
    unlinkSync(filePath);
    unlinkSync(metaPath);
  } catch {}

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
