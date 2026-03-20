import { NextResponse } from "next/server";
import { filterBuiltinClasses } from "@/lib/builtin-yoga-api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studioRaw = searchParams.get("studio_id");
  const studio_id = studioRaw != null && studioRaw !== "" ? Number(studioRaw) : undefined;
  const date = searchParams.get("date") ?? undefined;
  const class_type = searchParams.get("class_type") ?? undefined;

  if (studio_id != null && !Number.isFinite(studio_id)) {
    return NextResponse.json({ error: "invalid studio_id" }, { status: 400 });
  }

  const list = filterBuiltinClasses({
    ...(studio_id != null && Number.isFinite(studio_id) ? { studio_id } : {}),
    ...(date ? { date } : {}),
    ...(class_type ? { class_type } : {}),
  });

  return NextResponse.json(list);
}
