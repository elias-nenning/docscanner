/**
 * Where yoga API traffic goes. `NEXT_PUBLIC_YOGA_BACKEND_URL` unset ⇒ same-origin `/api/v1/*`
 * (implemented in this repo with deterministic demo data). Set ⇒ browser calls that origin instead.
 */
export function usesExternalYogaBackend(): boolean {
  if (typeof process === "undefined") return false;
  return Boolean(process.env.NEXT_PUBLIC_YOGA_BACKEND_URL?.trim());
}

export type YogaApiMode = "next_builtin" | "external" | "mock";

/** `live` from dashboard/booking hooks: API succeeded with studios + classes. */
export function yogaApiModeFromLive(live: boolean): YogaApiMode {
  if (!live) return "mock";
  return usesExternalYogaBackend() ? "external" : "next_builtin";
}

export function yogaApiModeLabel(mode: YogaApiMode): string {
  switch (mode) {
    case "next_builtin":
      return "Live";
    case "external":
      return "Connected";
    case "mock":
      return "Sample data";
  }
}

export function yogaApiModeDetail(mode: YogaApiMode): string {
  switch (mode) {
    case "next_builtin":
      return "Classes and studios come from this app’s /api/v1 routes (synthetic but consistent — safe to demo offline).";
    case "external":
      return "The UI calls your FastAPI (or other) server via NEXT_PUBLIC_YOGA_BACKEND_URL.";
    case "mock":
      return "The yoga API did not return usable rows — seeded numbers keep the UI readable.";
  }
}
