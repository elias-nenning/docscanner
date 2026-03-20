import { NextResponse } from "next/server";
import { builtinUserFromPost } from "@/lib/builtin-yoga-api";

export async function POST(req: Request) {
  let body: { name?: string; email?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.email?.trim() || !body.name?.trim()) {
    return NextResponse.json({ error: "name and email required" }, { status: 400 });
  }
  return NextResponse.json(
    builtinUserFromPost({
      name: body.name,
      email: body.email.trim().toLowerCase(),
      role: body.role,
    }),
    { status: 201 },
  );
}
