import Link from "next/link";
import { cn } from "@/lib/utils";

/** Consumer studio app: one panel treatment site-wide. */
export function StudioPanel({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("ff-panel", className)} {...props} />;
}

type StudioScaffoldProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function StudioScaffold({ eyebrow, title, description, action, children, className }: StudioScaffoldProps) {
  return (
    <div className={cn("space-y-4 md:space-y-5", className)}>
      <header
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
          children ? "ff-header-rule" : null,
        )}
      >
        <div className="min-w-0 space-y-1">
          {eyebrow ? <p className="ff-eyebrow">{eyebrow}</p> : null}
          <h1 className="ff-page-title">{title}</h1>
          {description ? <p className="ff-page-desc max-w-2xl text-pretty">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0 sm:pt-0.5">{action}</div> : null}
      </header>
      {children}
    </div>
  );
}

type PlaceholderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primary?: { href: string; label: string };
};

/** Thin routes: one purpose, one exit; no fake chrome. */
export function StudioPlaceholder({ eyebrow, title, description, primary }: PlaceholderProps) {
  return (
    <StudioPanel className="p-5">
      <div className="max-w-md">
        {eyebrow ? <p className="ff-eyebrow">{eyebrow}</p> : null}
        <h1 className={cn("ff-page-title", eyebrow && "mt-0.5")}>{title}</h1>
        <p className="ff-page-desc mt-2">{description}</p>
        {primary ? (
          <Link
            href={primary.href}
            className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {primary.label}
          </Link>
        ) : null}
      </div>
    </StudioPanel>
  );
}
