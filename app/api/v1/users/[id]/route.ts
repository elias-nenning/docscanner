import { NextResponse } from "next/server";
import { builtinUserById } from "@/lib/builtin-yoga-api";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const n = Number(id);
  if (!Number.isFinite(n)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  return NextResponse.json(builtinUserById(n));
}
