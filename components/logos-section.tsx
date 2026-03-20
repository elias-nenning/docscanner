import { LogoCloud } from "@/components/logo-cloud";

export function LogosSection() {
	return (
		<section className="relative space-y-2 border-t pt-6 pb-8">
			<div className="mx-auto max-w-lg space-y-1 text-center">
				<h2 className="text-sm font-semibold tracking-tight text-foreground md:text-base">Pilot network</h2>
				<p className="text-[11px] leading-snug text-muted-foreground md:text-xs">
					Representative Berlin-area labels for walkthrough. Production uses your actual tenant roster.
				</p>
			</div>
			<div className="relative z-10 mx-auto max-w-4xl">
				<LogoCloud />
			</div>
		</section>
	);
}
