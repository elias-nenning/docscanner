/**
 * Member-facing class templates for “Today” and marketing surfaces.
 * Booking uses the user’s calendar date; times stay consistent week-over-week.
 */

export type YogaEventType =
	| "vinyasa"
	| "yin"
	| "power"
	| "meditation"
	| "sound"
	| "prenatal"
	| "breath"
	| "reset";

export type CalEvent = {
	time: string;
	name: string;
	type: YogaEventType;
	dur: string;
	teacher: string;
	spots: number | null;
};

export const EVENT_TYPE_STYLES: Record<
	YogaEventType,
	{ bg: string; border: string; text: string; label: string }
> = {
	vinyasa: { bg: "#fef9ec", border: "#fde68a", text: "#854d0e", label: "Vinyasa" },
	yin: { bg: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6", label: "Yin" },
	power: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", label: "Power" },
	meditation: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", label: "Meditation" },
	sound: { bg: "#eef2ff", border: "#c7d2fe", text: "#4338ca", label: "Sound" },
	prenatal: { bg: "#fdf2f8", border: "#f5d0e8", text: "#9d174d", label: "Prenatal" },
	breath: { bg: "#f0fdfa", border: "#99f6e4", text: "#115e59", label: "Breathwork" },
	reset: { bg: "#f8fafc", border: "#e2e8f0", text: "#475569", label: "Reset" },
};

/** Sunday = 0 … Saturday = 6 */
const WEEKLY: Record<number, CalEvent[]> = {
	0: [
		{ time: "10:00 AM", name: "Sunday Sound Bath", type: "sound", dur: "75m", teacher: "Leo Santos", spots: 12 },
		{ time: "5:00 PM", name: "Restorative Yin", type: "yin", dur: "60m", teacher: "James Rivera", spots: 8 },
	],
	1: [
		{ time: "7:00 AM", name: "Monday Fire Vinyasa", type: "vinyasa", dur: "45m", teacher: "Maya Chen", spots: 4 },
		{ time: "12:15 PM", name: "Desk-Reset Flow", type: "reset", dur: "35m", teacher: "Tom Wu", spots: null },
		{ time: "6:30 PM", name: "Athletic Power", type: "power", dur: "50m", teacher: "Sarah Kim", spots: 2 },
	],
	2: [
		{ time: "7:00 AM", name: "Sunrise Vinyasa", type: "vinyasa", dur: "45m", teacher: "Maya Chen", spots: 6 },
		{ time: "12:00 PM", name: "Lunch Breathwork", type: "breath", dur: "30m", teacher: "Tom Wu", spots: 10 },
		{ time: "7:30 PM", name: "Slow Flow & Stretch", type: "yin", dur: "60m", teacher: "Priya Nair", spots: 7 },
	],
	3: [
		{ time: "6:30 AM", name: "Early Power Core", type: "power", dur: "45m", teacher: "Sarah Kim", spots: 5 },
		{ time: "9:30 AM", name: "Prenatal Gentle", type: "prenatal", dur: "50m", teacher: "Elena Vogt", spots: 4 },
		{ time: "6:00 PM", name: "Evening Vinyasa", type: "vinyasa", dur: "60m", teacher: "Maya Chen", spots: 0 },
	],
	4: [
		{ time: "7:15 AM", name: "Alignment Vinyasa", type: "vinyasa", dur: "50m", teacher: "Maya Chen", spots: 3 },
		{ time: "12:00 PM", name: "Midday Nervous-System Reset", type: "reset", dur: "30m", teacher: "Tom Wu", spots: null },
		{ time: "8:15 PM", name: "Yoga Nidra", type: "meditation", dur: "45m", teacher: "James Rivera", spots: 15 },
	],
	5: [
		{ time: "8:00 AM", name: "Friday Flow", type: "vinyasa", dur: "45m", teacher: "Maya Chen", spots: 6 },
		{ time: "5:30 PM", name: "Happy Hour Power", type: "power", dur: "40m", teacher: "Sarah Kim", spots: 4 },
	],
	6: [
		{ time: "9:00 AM", name: "Weekend Warrior", type: "power", dur: "55m", teacher: "Sarah Kim", spots: 5 },
		{ time: "11:00 AM", name: "Community Vinyasa", type: "vinyasa", dur: "60m", teacher: "Priya Nair", spots: 9 },
		{ time: "4:00 PM", name: "Candlelight Yin", type: "yin", dur: "75m", teacher: "James Rivera", spots: 6 },
	],
};

export function getClassesForToday(date = new Date()): CalEvent[] {
	return WEEKLY[date.getDay()] ?? [];
}

/** Sunday = 0 … Saturday = 6; used by the built-in yoga API to synthesize timetables. */
export function getClassesForWeekday(dow: number): CalEvent[] {
	return WEEKLY[dow] ?? [];
}
