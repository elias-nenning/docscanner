import { NextResponse } from "next/server";
import { BUILTIN_STUDIOS } from "@/lib/builtin-yoga-api";

export async function GET() {
  return NextResponse.json(BUILTIN_STUDIOS);
}
