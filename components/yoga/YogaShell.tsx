"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useMemo } from "react";
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
} from "@/components/ui/sidebar";

type YogaLink = { href: string; label: string };

const primary: YogaLink[] = [
  { href: "/yoga/home", label: "Home" },
  { href: "/yoga/search", label: "Search" },
  { href: "/yoga/today", label: "Today's Classes" },
  { href: "/yoga/schedule", label: "My Schedule" },
  { href: "/yoga/my-calendar", label: "My Calendar" },
  { href: "/yoga/community", label: "Community" },
  { href: "/yoga/store", label: "Store" },
];

const library: YogaLink[] = [
  { href: "/yoga/upcoming", label: "Upcoming" },
  { href: "/yoga/completed", label: "Completed" },
  { href: "/yoga/saved", label: "Saved" },
  { href: "/yoga/programs", label: "Programs" },
];

const footer: YogaLink[] = [{ href: "/yoga/settings", label: "Settings" }];

function AppHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-6">
      <SidebarTrigger />
      <h1 className="text-lg font-semibold text-zinc-900">Yoga Schedule</h1>
    </header>
  );
}

export default function YogaShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
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
        className="border-r border-zinc-200 bg-white shadow-sm"
      >
        <SidebarHeader className="border-b border-zinc-200 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-base font-bold text-zinc-900">Yoga</div>
              <div className="text-xs text-zinc-500 mt-0.5">Client app</div>
            </div>
            <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
              Light
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              Main
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu className="gap-1">
                {primary.map((l) => (
                  <SidebarMenuItem key={l.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeHref === l.href}
                      className="rounded-lg px-3 py-2.5 text-sm data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-800 data-[active=true]:font-semibold data-[active=true]:border data-[active=true]:border-indigo-200"
                    >
                      <Link href={l.href}>{l.label}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
              Library
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu className="gap-1">
                {library.map((l) => (
                  <SidebarMenuItem key={l.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeHref === l.href}
                      className="rounded-lg px-3 py-2.5 text-sm data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-800 data-[active=true]:font-semibold data-[active=true]:border data-[active=true]:border-indigo-200"
                    >
                      <Link href={l.href}>{l.label}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="mt-auto pt-6">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                Account
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-2">
                <SidebarMenu className="gap-1">
                  {footer.map((l) => (
                    <SidebarMenuItem key={l.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={activeHref === l.href}
                        className="rounded-lg px-3 py-2.5 text-sm data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-800 data-[active=true]:font-semibold data-[active=true]:border data-[active=true]:border-indigo-200"
                      >
                        <Link href={l.href}>{l.label}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="min-w-0 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto bg-zinc-50 p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
