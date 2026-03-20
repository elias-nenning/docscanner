import { YOGA_STUDIOS, type YogaStudio } from "@/lib/yoga-studios";

export type StudioSearchRow = YogaStudio & {
	blurb: string;
	tags: string[];
};

const BLURBS: Record<string, { blurb: string; tags: string[] }> = {
	prana: {
		blurb: "Bright loft near the canal. Known for precise vinyasa progressions and breath-led cool-downs.",
		tags: ["Vinyasa", "Breathwork", "Beginner-friendly"],
	},
	zenith: {
		blurb: "Industrial space with infrared heaters. Peak slots earn transparent fill credits when the room has space.",
		tags: ["Power", "Hot-adjacent", "Lunch express"],
	},
	lotus: {
		blurb: "Small-room acoustics for sound and restorative series. Limited mats per session: book early.",
		tags: ["Sound", "Yin", "Intimate"],
	},
	pulse: {
		blurb: "Athletic programming for people who already train. Expect tempo, load awareness, and deep hip work.",
		tags: ["Strength", "Mobility", "Weekend"],
	},
	soma: {
		blurb: "Clinic-adjacent studio focused on nervous-system regulation and sustainable intensity.",
		tags: ["Reset", "Therapeutic", "Clinical partners"],
	},
	bindu: {
		blurb: "Lab-style timetable: short experiments alongside classic 60s. Great if you like variety in one membership.",
		tags: ["Hybrid formats", "Creative", "Central"],
	},
};

export function getStudiosForSearch(): StudioSearchRow[] {
	return YOGA_STUDIOS.map((s) => {
		const extra = BLURBS[s.id] ?? { blurb: "Independent FlowFill partner studio.", tags: ["Multi-style"] };
		return { ...s, blurb: extra.blurb, tags: extra.tags };
	});
}
