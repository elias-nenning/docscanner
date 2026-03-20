"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { Calendar, Home } from "lucide-react";
import { FlowFillAppBridge } from "@/components/FlowFillAppBridge";
import { FlowFillJourneyStripApp } from "@/components/FlowFillJourneyStripApp";
import { Logo } from "@/components/logo";
import { deskPrimaryNav, deskSubtitleForPath, deskTitleForPath } from "@/lib/desk-nav";
import { SidebarThemeToggle } from "@/components/shell/SidebarThemeToggle";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

function routeActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const deskMenuBtn =
  "rounded-lg px-2 py-2 text-sm font-medium transition-colors text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold group-data-[collapsible=icon]:justify-center";

export function OperatorAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const title = deskTitleForPath(pathname);
  const subtitle = deskSubtitleForPath(pathname);

  return (
    <SidebarProvider
      defaultOpen
      className="min-h-screen flex min-w-0 flex-1"
      style={
        {
          "--sidebar-width": "15.5rem",
          "--sidebar-width-mobile": "18rem",
        } as CSSProperties
      }
    >
      <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="ff-shell-sidebar-header">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 rounded-md outline-none ring-sidebar-ring focus-visible:ring-2"
          >
            <Logo className="h-6 w-auto shrink-0 text-sidebar-foreground" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">FlowFill</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/55">Desk</p>
            </div>
          </Link>
          <FlowFillAppBridge variant="sidebar" className="w-full" />
        </SidebarHeader>

        <SidebarContent className="gap-0 px-2 py-3">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
              Desk
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {deskPrimaryNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={routeActive(pathname, item.href)}
                      className={deskMenuBtn}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4 opacity-90" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-3 bg-sidebar-border" />

          <SidebarGroup className="p-0">
            <SidebarGroupLabel className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
              Members
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className={deskMenuBtn} tooltip="Home">
                    <Link href="/yoga/home">
                      <Home className="size-4 opacity-90" />
                      <span className="group-data-[collapsible=icon]:hidden">Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className={deskMenuBtn} tooltip="Schedule">
                    <Link href="/yoga/schedule">
                      <Calendar className="size-4 opacity-90" />
                      <span className="group-data-[collapsible=icon]:hidden">Schedule</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-3">
          <SidebarThemeToggle />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex min-h-svh min-w-0 flex-col bg-muted/30 dark:bg-muted/20">
        <header className="ff-shell-top">
          <div className="ff-shell-top-pad flex items-start gap-3">
            <SidebarTrigger className="ff-shell-top-trigger" />
            <Separator orientation="vertical" className="hidden h-6 sm:block" />
            <div className="ff-shell-top-heading">
              <p className="ff-shell-top-kicker">Desk</p>
              <h1 className="ff-shell-top-title">{title}</h1>
              <p className="ff-shell-top-desc">{subtitle}</p>
            </div>
          </div>
        </header>
        <div className="flex-1 ff-main-padding">
          <div className="ff-page-frame">{children}</div>
        </div>
        <FlowFillJourneyStripApp />
      </SidebarInset>
    </SidebarProvider>
  );
}
