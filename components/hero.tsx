import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CalendarIcon, LayoutDashboard } from "lucide-react";

export function HeroSection() {
	return (
		<section className="relative mx-auto w-full max-w-6xl px-4 md:px-6">
			<div
				aria-hidden="true"
				className="absolute inset-0 isolate hidden overflow-hidden contain-strict lg:block"
			>
				<div className="absolute inset-0 -top-14 isolate -z-10 bg-[radial-gradient(35%_80%_at_49%_0%,--theme(--color-foreground/.08),transparent)] contain-strict" />
			</div>

			<div className="relative flex flex-col items-center justify-center gap-4 pt-16 pb-14 md:pt-20 md:pb-16">
				<div
					aria-hidden="true"
					className="absolute inset-0 -z-10 size-full overflow-hidden"
				>
					<div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-border md:left-8" />
					<div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-border md:right-8" />
				</div>

				<Link
					className={cn(
						"group mx-auto flex w-fit max-w-[95vw] items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 shadow-sm",
						"fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out"
					)}
					href="/yoga/schedule"
				>
					<CalendarIcon className="size-3 shrink-0 text-muted-foreground" aria-hidden />
					<span className="truncate text-[11px] font-medium text-foreground/90 sm:text-xs">
						Utilization-aware scheduling
					</span>
					<span className="hidden h-4 border-l border-border sm:block" aria-hidden />
					<ArrowRightIcon className="hidden size-3 shrink-0 text-muted-foreground transition duration-150 ease-out group-hover:translate-x-0.5 sm:block" aria-hidden />
				</Link>

				<h1
					className={cn(
						"fade-in slide-in-from-bottom-10 animate-in text-balance fill-mode-backwards text-center text-3xl font-semibold tracking-tight delay-100 duration-500 ease-out md:text-4xl lg:text-5xl",
						"text-shadow-[0_0px_50px_theme(--color-foreground/.2)]"
					)}
				>
					Fill under-used capacity.
					<br />
					Measure it precisely.
				</h1>

				<p className="fade-in slide-in-from-bottom-10 mx-auto max-w-lg animate-in text-pretty fill-mode-backwards text-center text-sm text-muted-foreground delay-200 duration-500 ease-out md:text-base">
					One product, two surfaces: Members book with transparent, rule-based fill credits; Desk leaders see fill, liability, and show-up in the same clock cycle. Built for boutiques that can&apos;t afford another opaque promo stack.
				</p>

				<div className="fade-in slide-in-from-bottom-10 flex animate-in flex-row flex-wrap items-center justify-center gap-2 fill-mode-backwards pt-1 delay-300 duration-500 ease-out">
					<Button className="h-9 rounded-full px-4 text-sm" variant="secondary" asChild>
						<Link href="/yoga/schedule">
							<CalendarIcon className="size-3.5" aria-hidden />
							Members
						</Link>
					</Button>
					<Button className="h-9 rounded-full px-4 text-sm" variant="outline" asChild>
						<Link href="/dashboard">
							<LayoutDashboard className="size-3.5" aria-hidden />
							Desk
						</Link>
					</Button>
					<Button className="h-9 rounded-full px-4 text-sm" asChild>
						<Link href="/login?mode=register">
							Sign up
							<ArrowRightIcon className="size-3.5" aria-hidden />
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
