import { Coins, LayoutDashboard, MapPin, type LucideIcon } from "lucide-react";

/** Single source for Desk sidebar, top-bar titles, and footer shortcuts. */
export const deskPrimaryNav: readonly { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/directory", label: "Directory", icon: MapPin },
  { href: "/dashboard/credits", label: "Credits", icon: Coins },
];

/** Appended after `deskPrimaryNav` in the bottom shortcut strip only. */
export const deskFooterExtras: readonly { href: string; label: string }[] = [
  { href: "/yoga/schedule", label: "Schedule" },
];

export function deskTitleForPath(pathname: string): string {
  if (pathname.startsWith("/dashboard/directory")) return "Directory";
  if (pathname.startsWith("/dashboard/credits")) return "Credits";
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard?")) return "Overview";
  if (pathname.startsWith("/dashboard")) return "Desk";
  return "Desk";
}

export function deskSubtitleForPath(pathname: string): string {
  if (pathname.startsWith("/dashboard/directory")) {
    return "Tap a studio to see the same schedule members see";
  }
  if (pathname.startsWith("/dashboard/credits")) {
    return "Fake spreadsheet for the room — real balances live under Wallet in the member app";
  }
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard?")) {
    return "Utilization, fill offers, and today’s class load";
  }
  return "Desk";
}
