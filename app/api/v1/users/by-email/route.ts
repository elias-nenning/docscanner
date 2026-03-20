import { NextResponse } from "next/server";
import { builtinUserFromEmail } from "@/lib/builtin-yoga-api";

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email?.trim()) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }
  return NextResponse.json(builtinUserFromEmail(email));
}
