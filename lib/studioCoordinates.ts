import type { BackendStudio } from "@/components/api/backend";

/** City and region hints matched against studio name + address (API has no geo yet). */
const REGION_COORDS: { re: RegExp; lat: number; lon: number }[] = [
  { re: /\bberlin\b|charlottenburg|kreuzberg|neukölln|mitte/i, lat: 52.52, lon: 13.405 },
  { re: /\b(münchen|munich)\b/i, lat: 48.137, lon: 11.575 },
  { re: /\b(hamburg)\b/i, lat: 53.551, lon: 9.993 },
  { re: /\b(köln|cologne)\b/i, lat: 50.938, lon: 6.96 },
  { re: /\b(frankfurt)\b/i, lat: 50.11, lon: 8.682 },
  { re: /\b(amsterdam)\b/i, lat: 52.367, lon: 4.904 },
  { re: /\b(utrecht|rotterdam|den haag)\b/i, lat: 52.09, lon: 5.12 },
  { re: /\b(paris)\b/i, lat: 48.857, lon: 2.352 },
  { re: /\b(london)\b/i, lat: 51.507, lon: -0.128 },
  { re: /\b(dublin)\b/i, lat: 53.349, lon: -6.26 },
  { re: /\b(wien|vienna)\b/i, lat: 48.208, lon: 16.374 },
  { re: /\b(zürich|zurich)\b/i, lat: 47.376, lon: 8.541 },
  { re: /\b(milano|milan|roma|rome)\b/i, lat: 45.464, lon: 9.19 },
  { re: /\b(barcelona|madrid)\b/i, lat: 41.387, lon: 2.169 },
  { re: /\b(lisboa|lisbon|porto)\b/i, lat: 38.722, lon: -9.139 },
  { re: /\b(new york|nyc|brooklyn)\b/i, lat: 40.713, lon: -74.006 },
  { re: /\b(los angeles)\b/i, lat: 34.052, lon: -118.244 },
  { re: /\b(san francisco|sf\b)\b/i, lat: 37.774, lon: -122.419 },
  { re: /\b(seattle)\b/i, lat: 47.606, lon: -122.332 },
  { re: /\b(toronto|vancouver|montreal)\b/i, lat: 43.653, lon: -79.383 },
  { re: /\b(sydney|melbourne)\b/i, lat: -33.868, lon: 151.209 },
  { re: /\b(tel aviv)\b/i, lat: 32.085, lon: 34.782 },
  { re: /\b(dubai)\b/i, lat: 25.204, lon: 55.271 },
  { re: /\b(tokyo|osaka)\b/i, lat: 35.676, lon: 139.65 },
  { re: /\b(singapore)\b/i, lat: 1.352, lon: 103.82 },
];

function jitter(lat: number, lon: number, id: number, spread = 0.14) {
  const a = ((id * 9301 + 49297) % 233280) / 233280;
  const b = ((id * 7919 + 104729) % 233280) / 233280;
  return {
    lat: lat + (a - 0.5) * spread,
    lon: lon + (b - 0.5) * spread,
  };
}

export type StudioWithCoords = BackendStudio & { lat: number; lon: number };

export function studioWithCoordinates(studio: BackendStudio): StudioWithCoords {
  const latRaw = studio.latitude;
  const lonRaw = studio.longitude;
  if (latRaw != null && lonRaw != null && Number.isFinite(latRaw) && Number.isFinite(lonRaw)) {
    return { ...studio, lat: latRaw, lon: lonRaw };
  }
  const blob = `${studio.name} ${studio.address ?? ""}`;
  for (const { re, lat, lon } of REGION_COORDS) {
    if (re.test(blob)) {
      const j = jitter(lat, lon, studio.id);
      return { ...studio, lat: j.lat, lon: j.lon };
    }
  }
  const j = jitter(52.52, 13.405, studio.id, 0.35);
  return { ...studio, lat: j.lat, lon: j.lon };
}
