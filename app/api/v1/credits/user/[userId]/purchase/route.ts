import { NextResponse } from "next/server";
import { builtinCredits, recordBuiltinCreditPurchase } from "@/lib/builtin-yoga-api";
import { getMockCreditPackById } from "@/lib/mock-consumer-content";

export async function POST(req: Request, ctx: { params: Promise<{ userId: string }> }) {
  const { userId } = await ctx.params;
  const n = Number(userId);
  if (!Number.isFinite(n)) {
    return NextResponse.json({ error: "invalid user id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const packId = typeof body === "object" && body && "pack_id" in body ? String((body as { pack_id: unknown }).pack_id) : "";
  const pack = getMockCreditPackById(packId);
  if (!pack) {
    return NextResponse.json({ error: "unknown pack" }, { status: 400 });
  }

  recordBuiltinCreditPurchase(n, pack.walletCreditEUR, `${pack.label} · €${pack.eur} paid`);
  return NextResponse.json(builtinCredits(n));
}
