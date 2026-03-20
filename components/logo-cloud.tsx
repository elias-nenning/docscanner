"use client";

import { InfiniteSlider } from "@/components/ui/infinite-slider";

/** Fictional names for UI / narrative only; not real customers or endorsements. */
const ILLUSTRATIVE_STUDIOS = [
	"North Light Yoga",
	"Prana House",
	"Studio Lotus",
	"Zenith Flow",
	"Ember & Breath",
	"Coastline Wellness",
	"Midtown Mat",
	"Riverstone Pilates",
];

export function LogoCloud() {
	return (
		<div className="mask-[linear-gradient(to_right,transparent,black,transparent)] overflow-hidden py-4">
			<InfiniteSlider gap={48} reverse speed={72} speedOnHover={20}>
				{ILLUSTRATIVE_STUDIOS.map((name) => (
					<span
						key={name}
						className="pointer-events-none shrink-0 select-none text-sm font-medium text-muted-foreground"
					>
						{name}
					</span>
				))}
			</InfiniteSlider>
		</div>
	);
}
