import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json(
      { error: "Missing query parameter" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "ScanDesk/2.0 (document-scanner)",
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Geocoding service unavailable" },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (data.length === 0) {
      return NextResponse.json({ result: null });
    }

    return NextResponse.json({
      result: {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Geocoding request failed" },
      { status: 500 }
    );
  }
}
