import { NextResponse } from "next/server";
import { getBuiltinStudio } from "@/lib/builtin-yoga-api";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const n = Number(id);
  if (!Number.isFinite(n)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  const studio = getBuiltinStudio(n);
  if (!studio) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ...studio, class_schedules: [] });
}
