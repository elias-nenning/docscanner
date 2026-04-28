"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellProps = {
  title: string;
  subtitle?: string;
  onTitleClick?: () => void;
  backHref?: string;
  backLabel?: string;
  onBackClick?: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
  maxWidthClassName?: string;
};

export function AppShell({
  title,
  subtitle,
  onTitleClick,
  backHref,
  backLabel = "Zurueck",
  onBackClick,
  action,
  children,
  maxWidthClassName = "max-w-6xl",
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className={cn("mx-auto flex h-14 items-center gap-4 px-4 lg:px-6", maxWidthClassName)}>
          {backHref ? (
            <Link
              href={backHref}
              onClick={onBackClick}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 text-xs")}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel}
            </Link>
          ) : null}

          <button
            type="button"
            onClick={onTitleClick}
            className="text-sm font-semibold tracking-tight transition-opacity hover:opacity-70"
          >
            {title}
          </button>

          {subtitle ? (
            <>
              <span className="text-border">|</span>
              <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{subtitle}</p>
            </>
          ) : (
            <div className="flex-1" />
          )}

          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </header>

      <main className={cn("mx-auto px-4 py-8 lg:px-6 lg:py-10", maxWidthClassName)}>{children}</main>
    </div>
  );
}

export function ShellActionButton(props: React.ComponentProps<typeof Button>) {
  return <Button size="sm" className="gap-1.5" {...props} />;
}
