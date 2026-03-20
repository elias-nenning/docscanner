"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { FlowFillAppBridge } from "@/components/FlowFillAppBridge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MobileNav } from "@/components/mobile-nav";

/** Deep links next to the Members | Desk switcher on marketing pages. */
export const navLinks = [
	{ label: "Schedule", href: "/yoga/schedule" },
	{ label: "Studios", href: "/dashboard/directory" },
] as const;

/** Same sticky chrome as Desk / Members (`ff-shell-top`), used on every marketing & auth surface. */
export function Header() {
	return (
		<header className="ff-shell-top z-50 w-full">
			<nav className="ff-shell-top-pad mx-auto flex w-full max-w-6xl items-center gap-1 md:gap-1.5">
				<Link className="shrink-0 rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50" href="/">
					<Logo className="text-sm font-semibold tracking-tight" />
				</Link>
				<div className="hidden min-w-0 flex-1 items-center justify-center gap-1.5 md:flex">
					<FlowFillAppBridge />
					<Separator orientation="vertical" className="hidden h-5 sm:block" />
					{navLinks.map((link) => (
						<Button asChild key={link.href} size="sm" variant="ghost">
							<Link href={link.href}>{link.label}</Link>
						</Button>
					))}
				</div>
				<div className="hidden shrink-0 items-center gap-1 md:flex">
					<Button asChild size="sm" variant="outline">
						<Link href="/login">Sign in</Link>
					</Button>
					<Button asChild size="sm">
						<Link href="/login?mode=register">Get started</Link>
					</Button>
				</div>
				<MobileNav className="ml-auto md:ml-0" />
			</nav>
		</header>
	);
}
