"use client";

import { useEffect } from "react";
import { ThemeMode } from "@/components/theme/useTheme";

const STORAGE_KEY = "flowfill.theme.mode.v1";

export default function ThemeInit() {
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const mode: ThemeMode = raw === "dark" ? "dark" : "light";
      const root = document.documentElement;
      if (mode === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
    } catch {
      // ignore
    }
  }, []);

  return null;
}

