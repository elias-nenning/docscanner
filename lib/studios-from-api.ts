import type { BackendStudio } from "@/components/api/backend";
import type { StudioSearchRow } from "@/lib/search-content";

export function parseCityFromAddress(address?: string | null): string {
  if (!address?.trim()) return "Berlin";
  const parts = address
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts[parts.length - 1] ?? address.trim();
}

export function backendStudioToSearchRow(s: BackendStudio): StudioSearchRow {
  const city = parseCityFromAddress(s.address);
  const style = s.style?.trim();
  const tags = style
    ? [...new Set(style.split(/[/,]/).map((t) => t.trim()).filter(Boolean))].slice(0, 4)
    : [];
  const tagList = tags.length ? tags : ["Multi-style"];
  return {
    id: String(s.id),
    name: s.name,
    city,
    distance: "-",
    rating: s.rating ?? 4.5,
    blurb:
      s.description?.trim() ||
      (style ? `${style} at this FlowFill partner studio.` : "FlowFill partner studio."),
    tags: tagList,
  };
}
