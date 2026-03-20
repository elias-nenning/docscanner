"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import React from "react";
import { Portal, PortalBackdrop } from "@/components/ui/portal";
import { Button } from "@/components/ui/button";
import { FlowFillAppBridge } from "@/components/FlowFillAppBridge";
import { navLinks } from "@/components/header";
import { XIcon, MenuIcon } from "lucide-react";

export function MobileNav({ className }: { className?: string }) {
	const [open, setOpen] = React.useState(false);

	return (
		<div className={cn("md:hidden", className)}>
			<Button
				aria-controls="mobile-menu"
				aria-expanded={open}
				aria-label="Toggle menu"
				className="md:hidden"
				onClick={() => setOpen(!open)}
				size="icon"
				variant="outline"
			>
				{open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
			</Button>
			{open && (
				<Portal className="top-14" id="mobile-menu">
					<PortalBackdrop />
					<div
						className={cn(
							"data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
							"size-full p-4"
						)}
						data-slot={open ? "open" : "closed"}
					>
						<div className="mb-4 flex justify-center">
							<FlowFillAppBridge />
						</div>
						<p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
							Jump to
						</p>
						<div className="grid gap-y-2">
							{navLinks.map((link) => (
								<Button asChild className="justify-start" key={link.href} variant="ghost">
									<Link href={link.href} onClick={() => setOpen(false)}>
										{link.label}
									</Link>
								</Button>
							))}
						</div>
						<div className="mt-8 flex flex-col gap-2">
							<Button asChild className="w-full" variant="outline">
								<Link href="/login" onClick={() => setOpen(false)}>
									Sign in
								</Link>
							</Button>
							<Button asChild className="w-full">
								<Link href="/login?mode=register" onClick={() => setOpen(false)}>
									Get started
								</Link>
							</Button>
						</div>
					</div>
				</Portal>
			)}
		</div>
	);
}
