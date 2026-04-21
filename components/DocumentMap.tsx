"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { MapPin } from "lucide-react";
import { getHistory, type ScanHistoryEntry } from "@/lib/history";
import "leaflet/dist/leaflet.css";

function FitBounds({ entries }: { entries: ScanHistoryEntry[] }) {
  const map = useMap();

  useEffect(() => {
    const withLocation = entries.filter((e) => e.location);
    if (withLocation.length === 0) return;

    const lats = withLocation.map((e) => e.location!.lat);
    const lngs = withLocation.map((e) => e.location!.lng);

    map.fitBounds(
      [
        [Math.min(...lats) - 0.5, Math.min(...lngs) - 0.5],
        [Math.max(...lats) + 0.5, Math.max(...lngs) + 0.5],
      ],
      { maxZoom: 10, padding: [30, 30] }
    );
  }, [map, entries]);

  return null;
}

export default function DocumentMap() {
  const [entries, setEntries] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  const withLocation = entries.filter((e) => e.location);

  return (
    <div className="relative h-[300px] rounded-lg border bg-card overflow-hidden">
      <MapContainer
        center={[50.1, 10.4]}
        zoom={5}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        <FitBounds entries={entries} />

        {withLocation.map((entry) => (
          <CircleMarker
            key={entry.id}
            center={[entry.location!.lat, entry.location!.lng]}
            radius={5}
            pathOptions={{
              fillColor: "#fff",
              fillOpacity: 0.9,
              color: "#fff",
              weight: 6,
              opacity: 0.12,
            }}
          >
            <Popup>
              <div className="space-y-0.5">
                <p className="font-medium text-[13px]">{entry.fileName}</p>
                <p className="text-[11px] opacity-60">{entry.documentType}</p>
                <p className="text-[11px] opacity-60">
                  {entry.location!.address}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {withLocation.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 rounded-md border bg-background/80 backdrop-blur-sm px-3 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Document origins will appear here
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
