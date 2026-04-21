export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocode(address: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `/api/geocode?q=${encodeURIComponent(address)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.result || null;
  } catch {
    return null;
  }
}
