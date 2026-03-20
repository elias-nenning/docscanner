import { NextResponse } from "next/server";
import { builtinCredits } from "@/lib/builtin-yoga-api";

export async function GET(_req: Request, ctx: { params: Promise<{ userId: string }> }) {
  const { userId } = await ctx.params;
  const n = Number(userId);
  if (!Number.isFinite(n)) {
    return NextResponse.json({ error: "invalid user id" }, { status: 400 });
  }
  return NextResponse.json(builtinCredits(n));
}
