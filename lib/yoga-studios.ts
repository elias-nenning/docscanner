export type YogaStudio = {
	id: string;
	name: string;
	city: string;
	distance: string;
	rating: number;
};

export const YOGA_STUDIOS: YogaStudio[] = [
	{ id: "prana", name: "Prana", city: "Berlin", distance: "0.8km", rating: 4.8 },
	{ id: "zenith", name: "Zenith", city: "Berlin", distance: "1.7km", rating: 4.6 },
	{ id: "lotus", name: "Lotus House", city: "Berlin", distance: "2.5km", rating: 4.7 },
	{ id: "pulse", name: "Pulse Studio", city: "Berlin", distance: "3.1km", rating: 4.5 },
	{ id: "soma", name: "Soma Space", city: "Berlin", distance: "2.2km", rating: 4.7 },
	{ id: "bindu", name: "Bindu Yoga Lab", city: "Berlin", distance: "2.9km", rating: 4.4 },
];

export function getYogaStudioById(id: string | null | undefined): YogaStudio | null {
	if (!id) return null;
	const fromList = YOGA_STUDIOS.find((s) => s.id === id);
	if (fromList) return fromList;
	if (/^\d+$/.test(id)) {
		return { id, name: `Studio ${id}`, city: "", distance: "", rating: 0 };
	}
	return null;
}

/** Map `?studio=prana` or `?studio=3` to numeric API studio id (built-in backend). */
export function studioQueryToApiId(raw: string | null): number | null {
	if (!raw) return null;
	if (/^\d+$/.test(raw)) return Number(raw);
	const idx = YOGA_STUDIOS.findIndex((s) => s.id === raw);
	return idx >= 0 ? idx + 1 : null;
}
