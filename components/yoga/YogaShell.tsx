"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import { type ComponentType, PropsWithChildren, useMemo } from "react";
import {
  Calendar,
  CalendarCheck2,
  Clock3,
  Home,
  Layers3,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "@/components/theme/useTheme";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

type YogaLink = { href: string; label: string; icon: ComponentType<{ className?: string }> };

const primary: YogaLink[] = [
  { href: "/yoga/home", label: "Home", icon: Home },
  { href: "/yoga/search", label: "Search", icon: Search },
  { href: "/yoga/today", label: "Today's Classes", icon: Clock3 },
  { href: "/yoga/schedule", label: "Schedule", icon: Calendar },
  { href: "/yoga/my-calendar", label: "My Calendar", icon: CalendarCheck2 },
  { href: "/yoga/community", label: "Community", icon: Users },
  { href: "/yoga/store", label: "Store", icon: ShoppingBag },
];

const library: YogaLink[] = [
  { href: "/yoga/upcoming", label: "Upcoming", icon: Sparkles },
  { href: "/yoga/completed", label: "Completed", icon: CheckCircle2 },
  { href: "/yoga/saved", label: "Saved", icon: Bookmark },
  { href: "/yoga/programs", label: "Programs", icon: Layers3 },
];

const footer: YogaLink[] = [{ href: "/yoga/settings", label: "Settings", icon: Settings }];

function AppHeader() {
  const { open, openMobile, isMobile } = useSidebar();
  const showRestoreButton = isMobile ? !openMobile : !open;

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 px-4 lg:px-6">
      {showRestoreButton ? (
        <SidebarTrigger className="h-9 w-9 shrink-0 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800" />
      ) : null}
      <div className="flex-1 min-w-0">
        <Nav embedded />
      </div>
      <h1 className="text-lg font-semibold shrink-0 text-zinc-900 dark:text-white">Yoga Schedule</h1>
    </header>
  );
}

export default function YogaShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { mode, setMode } = useTheme();
  const activeHref = useMemo(() => {
    const root = pathname.startsWith("/yoga/")
      ? `/${pathname.split("/").slice(1, 3).join("/")}`
      : "/yoga/schedule";
    return root;
  }, [pathname]);

  return (
    <SidebarProvider
      defaultOpen={true}
      className="flex flex-1 min-w-0"
      style={
        {
          "--sidebar-width": "280px",
          "--sidebar-width-mobile": "320px",
        } as React.CSSProperties
      }
    >
      <Sidebar
        collapsible="offcanvas"
        className="border-r border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 shadow-sm"
      >
        <SidebarHeader className="h-16 border-b border-zinc-200 dark:border-zinc-800 px-6 py-0 flex-row items-center justify-between gap-3">
          <div className="text-base font-bold text-zinc-900 dark:text-white">Yoga</div>
          <SidebarTrigger className="h-9 w-9 rounded-md border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20" />
        </SidebarHeader>
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
              Main
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu className="gap-1">
                {primary.map((l) => (
                  <SidebarMenuItem key={l.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={l.label}
                      isActive={activeHref === l.href}
                      className="rounded-lg px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-800 data-[active=true]:font-semibold data-[active=true]:border data-[active=true]:border-indigo-200 dark:data-[active=true]:bg-indigo-500/10 dark:data-[active=true]:text-indigo-200 dark:data-[active=true]:border-indigo-500/20 group-data-[collapsible=icon]:justify-center"
                    >
                      <Link href={l.href}>
                        <l.icon className="h-4 w-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">{l.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
              Library
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu className="gap-1">
                {library.map((l) => (
                  <SidebarMenuItem key={l.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={l.label}
                      isActive={activeHref === l.href}
                      className="rounded-lg px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-800 data-[active=true]:font-semibold data-[active=true]:border data-[active=true]:border-indigo-200 dark:data-[active=true]:bg-indigo-500/10 dark:data-[active=true]:text-indigo-200 dark:data-[active=true]:border-indigo-500/20 group-data-[collapsible=icon]:justify-center"
                    >
                      <Link href={l.href}>
                        <l.icon className="h-4 w-4 shrink-0" />
                        <span className="group-data-[collapsible=icon]:hidden">{l.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="mt-auto pt-6">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">
                Account
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-2">
                <SidebarMenu className="gap-1">
                  {footer.map((l) => (
                    <SidebarMenuItem key={l.href}>
                      <SidebarMenuButton
                        asChild
                        tooltip={l.label}
                        isActive={activeHref === l.href}
                        className="rounded-lg px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-800 data-[active=true]:font-semibold data-[active=true]:border data-[active=true]:border-indigo-200 dark:data-[active=true]:bg-indigo-500/10 dark:data-[active=true]:text-indigo-200 dark:data-[active=true]:border-indigo-500/20 group-data-[collapsible=icon]:justify-center"
                      >
                        <Link href={l.href}>
                          <l.icon className="h-4 w-4 shrink-0" />
                          <span className="group-data-[collapsible=icon]:hidden">{l.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <div className="mt-4 px-3 flex justify-end group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
              <div className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1">
                <button
                  type="button"
                  onClick={() => setMode("light")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    mode === "light" ? "bg-indigo-600 text-white" : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setMode("dark")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                    mode === "dark" ? "bg-indigo-600 text-white" : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="min-w-0 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-950 p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
