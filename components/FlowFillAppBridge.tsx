"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type BridgeVariant = "light" | "dark" | "sidebar";

/**
 * Same product: **Members** (`/yoga/*`) and **Desk** (`/dashboard/*`) workspaces.
 */
export function FlowFillAppBridge({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: BridgeVariant;
}) {
  const pathname = usePathname() ?? "";
  const membersActive = pathname.startsWith("/yoga") || pathname === "/menu";
  const deskActive = pathname.startsWith("/dashboard") || pathname === "/credits";

  const shell =
    variant === "dark"
      ? {
          wrap: "border-white/15 bg-white/5",
          active: "bg-white text-slate-900 shadow-sm",
          idle: "text-slate-300 hover:bg-white/10 hover:text-white",
        }
      : variant === "sidebar"
        ? {
            wrap: "border-sidebar-border bg-sidebar-accent/30 w-full",
            active: "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm",
            idle: "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          }
        : {
            wrap: "border-border bg-muted/50",
            active: "bg-background text-foreground shadow-sm",
            idle: "text-muted-foreground hover:bg-background/80 hover:text-foreground",
          };

  const sm =
    variant === "sidebar" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-[11px] font-medium sm:text-xs";

  return (
    <div
      className={cn("inline-flex rounded-lg p-0.5", shell.wrap, className)}
      role="group"
      aria-label="Switch workspace: Members or Desk"
    >
      <Link
        href="/yoga/home"
        className={cn("rounded-md font-semibold transition", sm, membersActive ? shell.active : shell.idle)}
      >
        Members
      </Link>
      <Link
        href="/dashboard"
        className={cn("rounded-md font-semibold transition", sm, deskActive ? shell.active : shell.idle)}
      >
        Desk
      </Link>
    </div>
  );
}
