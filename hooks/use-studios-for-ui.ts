"use client";

import { useEffect, useState } from "react";
import { backend, isBackendConfigured } from "@/components/api/backend";
import { getStudiosForSearch, type StudioSearchRow } from "@/lib/search-content";
import { backendStudioToSearchRow } from "@/lib/studios-from-api";

export function useStudiosForUi() {
  const [studios, setStudios] = useState<StudioSearchRow[]>(() => getStudiosForSearch());
  const [source, setSource] = useState<"api" | "local">("local");
  const [loading, setLoading] = useState(() => isBackendConfigured());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isBackendConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    backend
      .listStudios()
      .then((list) => {
        if (cancelled) return;
        if (!list.length) {
          setStudios(getStudiosForSearch());
          setSource("local");
          return;
        }
        setStudios(list.map(backendStudioToSearchRow));
        setSource("api");
      })
      .catch(() => {
        if (cancelled) return;
        setError("Studios API unreachable. Showing curated pilot directory.");
        setStudios(getStudiosForSearch());
        setSource("local");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { studios, source, loading, error };
}
