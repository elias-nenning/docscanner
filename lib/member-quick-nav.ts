import { Calendar, CalendarCheck2, Coins, Home, Settings, type LucideIcon } from "lucide-react";

/** Members app sidebar: primary journeys. */
export const memberBookNav: readonly { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/yoga/home", label: "Home", icon: Home },
  { href: "/yoga/schedule", label: "Schedule", icon: Calendar },
  { href: "/yoga/my-calendar", label: "Calendar", icon: CalendarCheck2 },
];

export const memberAccountNav: readonly { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/yoga/credits", label: "Wallet", icon: Coins },
  { href: "/yoga/settings", label: "Settings", icon: Settings },
];

/** Footer strip on member surfaces (order: discover → account → desk). */
export const memberFooterStrip = [
  { href: "/yoga/home", label: "Home" },
  { href: "/yoga/schedule", label: "Schedule" },
  { href: "/yoga/my-calendar", label: "Calendar" },
  { href: "/yoga/credits", label: "Wallet" },
  { href: "/dashboard", label: "Desk" },
] as const;

/** One-line hint under the Members top bar (matches Desk subtitle pattern). */
export function memberSubtitleForPath(pathnameKey: string): string {
  switch (pathnameKey) {
    case "/yoga/home":
      return "Choose a studio · same locations as the desk";
    case "/yoga/schedule":
      return "Classes and small perks on slower slots";
    case "/yoga/my-calendar":
      return "Your week, bookings, and check-ins";
    case "/yoga/credits":
      return "Balance, packs, and recent moves";
    case "/yoga/settings":
      return "Account, plan, and preferences";
    case "/yoga/booking":
      return "Review class details and pay";
    default:
      return "Book classes · same studios the desk uses";
  }
}
