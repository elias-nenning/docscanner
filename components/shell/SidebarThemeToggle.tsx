"use client";

import { useTheme } from "@/components/theme/useTheme";
import { cn } from "@/lib/utils";

/** Shared light/dark control for app sidebars (Studio + Desk). */
export function SidebarThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent/20 p-0.5">
      <button
        type="button"
        onClick={() => setMode("light")}
        className={cn(
          "flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition",
          mode === "light"
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
        )}
      >
        Light
      </button>
      <button
        type="button"
        onClick={() => setMode("dark")}
        className={cn(
          "flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition",
          mode === "dark"
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
        )}
      >
        Dark
      </button>
    </div>
  );
}
