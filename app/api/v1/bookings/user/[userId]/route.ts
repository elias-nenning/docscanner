import { NextResponse } from "next/server";

/** No persisted server bookings in the built-in API; client merges from localStorage. */
export async function GET(_req: Request, ctx: { params: Promise<{ userId: string }> }) {
  const { userId } = await ctx.params;
  if (!userId || !/^\d+$/.test(userId)) {
    return NextResponse.json({ error: "invalid user id" }, { status: 400 });
  }
  return NextResponse.json([]);
}
