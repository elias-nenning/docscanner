import { NextResponse } from "next/server";
import { runScan } from "@/lib/server/scan/service";
import type { ScanResultPayload } from "@/lib/server/scan/types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const schemaRaw = formData.get("schema");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Keine Datei empfangen." }, { status: 400 });
    }
    if (typeof schemaRaw !== "string") {
      return NextResponse.json({ error: "Schema fehlt." }, { status: 400 });
    }

    const schema = JSON.parse(schemaRaw) as string[];
    if (schema.length === 0) {
      return NextResponse.json(
        { error: "Mindestens ein Feld muss ausgewählt sein." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await runScan({
      buffer,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      schema,
    });
    return NextResponse.json(result satisfies ScanResultPayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Fehler";
    const status =
      message.includes("Kein Text erkannt") || message.includes("enthaelt keine Seiten")
        ? 422
        : message.includes("Schema") || message.includes("Datei")
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
