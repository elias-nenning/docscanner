/**
 * Member-side catalogue & ledger demo data. Replace with API payloads in production.
 */

export type MockProgram = {
  id: string;
  name: string;
  focus: string;
  sessions: number;
  priceEUR: number;
  start: string;
  difficulty: string;
  instructor: string;
  cadence: string;
  syllabus: string[];
  includes: string[];
  enrolled: number;
  capacity: number;
};

export const MOCK_PROGRAMS: MockProgram[] = [
  {
    id: "p1",
    name: "Foundations · Breath & alignment",
    focus: "Neutral spine, breath timing, and safe range, ideal after time off or if you are new to FlowFill partners.",
    sessions: 8,
    priceEUR: 89,
    start: "Apr 7",
    difficulty: "Beginner-friendly",
    instructor: "Anna Brück",
    cadence: "Tue & Thu · 07:30",
    syllabus: [
      "Weeks 1–2: diaphragmatic breath + standing posture clocks.",
      "Week 3: hip-hinge and forward fold mechanics with props.",
      "Week 4: short vinyasa stringing breath to movement.",
    ],
    includes: ["Pose map PDF", "Warmup recording", "1 buddy pass"],
    enrolled: 14,
    capacity: 18,
  },
  {
    id: "p2",
    name: "Power build · Strength runway",
    focus: "Athletic vinyasa with tempo work: wrist-safe planks, side bodies, and single-leg balance.",
    sessions: 12,
    priceEUR: 149,
    start: "Apr 14",
    difficulty: "Intermediate",
    instructor: "Marc Vogel",
    cadence: "Mon · Wed · Fri · 18:00",
    syllabus: [
      "Mesocycle A: isometric endurance Week 1–3.",
      "Mesocycle B: loaded rotations + plyo prep Week 4–6.",
      "Capstone: paced 45m athletic flow.",
    ],
    includes: ["Band kit on loan", "Office hours DM"],
    enrolled: 11,
    capacity: 14,
  },
  {
    id: "p3",
    name: "Rhythm & reset",
    focus: "Evening wind-down: yin holds, breath-led downshifts, legs-up closing track.",
    sessions: 6,
    priceEUR: 59,
    start: "May 5",
    difficulty: "All levels",
    instructor: "James Rivera",
    cadence: "Wed · 20:15",
    syllabus: ["3–5 minute holds", "Sleep-prep audio takeaway", "Tea in lobby"],
    includes: ["Bolster reserved"],
    enrolled: 16,
    capacity: 16,
  },
  {
    id: "p4",
    name: "Athlete yoga",
    focus: "Hip floss, thoracic rotation, and nasal breath for people who lift or run hard mid-week.",
    sessions: 16,
    priceEUR: 189,
    start: "Apr 21",
    difficulty: "Intermediate",
    instructor: "Leo Santos",
    cadence: "Sat · 09:00",
    syllabus: ["Pre-lift primer templates", "Post-long-run flush", "HRV-friendly breath ladders"],
    includes: ["Strap + block set"],
    enrolled: 10,
    capacity: 12,
  },
  {
    id: "p5",
    name: "Desk athlete · Lunch express",
    focus: "30 minutes: neck/T-spine, hip openers, standing reset; minimal sweat.",
    sessions: 6,
    priceEUR: 49,
    start: "Apr 28",
    difficulty: "All levels",
    instructor: "Sara Klein",
    cadence: "Fri · 12:15",
    syllabus: ["Screen-neck protocol", "Hip flexor ladders", "Box-breath finish"],
    includes: ["PDF stretch sheet"],
    enrolled: 9,
    capacity: 12,
  },
  {
    id: "p6",
    name: "Sound & stillness",
    focus: "Four restorative Fridays with bowls, SPL-capped for comfort.",
    sessions: 4,
    priceEUR: 72,
    start: "May 9",
    difficulty: "All levels",
    instructor: "Leo Santos",
    cadence: "Fri · 19:30",
    syllabus: ["Live instrument arc", "15m silent integration", "Chair option always open"],
    includes: ["Eye mask"],
    enrolled: 22,
    capacity: 24,
  },
];

export type MockSaved = {
  id: string;
  name: string;
  when: string;
  teacher: string;
  studioId: string;
  note: string;
  remind: string;
};

export const MOCK_SAVED: MockSaved[] = [
  {
    id: "s1",
    name: "Sound Bath · 75m",
    when: "Sat 10:00 · Lotus House",
    teacher: "Leo Santos",
    studioId: "lotus",
    note: "Arrive 10 minutes early; south wall mat lineup.",
    remind: "Thu 09:00",
  },
  {
    id: "s2",
    name: "Vinyasa Flow · 45m",
    when: "Tue 07:00 · Prana",
    teacher: "Maya Chen",
    studioId: "prana",
    note: "Watch for €3 fill tier on quiet Tuesdays.",
    remind: "Mon 20:00",
  },
  {
    id: "s3",
    name: "Yin Restore · 60m",
    when: "Thu 18:30 · Zenith",
    teacher: "James Rivera",
    studioId: "zenith",
    note: "Bring knee props; desk will have stack B.",
    remind: "Thu 12:00",
  },
  {
    id: "s4",
    name: "Power Lunch Flow · 45m",
    when: "Wed 12:00 · Zenith",
    teacher: "Sarah Kim",
    studioId: "zenith",
    note: "Room runs warm; light layers.",
    remind: "Wed 08:00",
  },
  {
    id: "s5",
    name: "Monday Fire Vinyasa",
    when: "Mon 07:00 · Prana",
    teacher: "Maya Chen",
    studioId: "prana",
    note: "Highest-rated slot on the network this quarter.",
    remind: "Sun 18:00",
  },
  {
    id: "s6",
    name: "Candlelight Yin · 75m",
    when: "Sat 18:00 · Lotus House",
    teacher: "James Rivera",
    studioId: "lotus",
    note: "Partner friendly; pair pricing at desk.",
    remind: "Fri 17:00",
  },
];

export type MockCompleted = {
  id: string;
  name: string;
  when: string;
  studio: string;
  teacher: string;
  attended: boolean;
  intensity: string;
  fillCredit: string | null;
  note: string;
};

export const MOCK_COMPLETED: MockCompleted[] = [
  {
    id: "c1",
    name: "Yin Yoga",
    when: "Mar 10, 2026 · 20:00",
    studio: "Zenith Yoga",
    teacher: "James Rivera",
    attended: true,
    intensity: "Low",
    fillCredit: "€5 fill credit",
    note: "3-week evening streak",
  },
  {
    id: "c2",
    name: "Breathwork",
    when: "Mar 5, 2026 · 12:00",
    studio: "Prana",
    teacher: "Tom Wu",
    attended: true,
    intensity: "Moderate",
    fillCredit: null,
    note: "First lunch session",
  },
  {
    id: "c3",
    name: "Morning Vinyasa",
    when: "Mar 2, 2026 · 07:00",
    studio: "Prana",
    teacher: "Maya Chen",
    attended: true,
    intensity: "Moderate",
    fillCredit: "€3 fill tier",
    note: "Member milestone · 25 classes",
  },
  {
    id: "c4",
    name: "Weekend Reset",
    when: "Feb 28, 2026 · 10:30",
    studio: "Pulse Studio",
    teacher: "Sarah Kim",
    attended: true,
    intensity: "Low",
    fillCredit: null,
    note: "Bring-a-friend credit pending",
  },
  {
    id: "c5",
    name: "Athletic Vinyasa",
    when: "Feb 22, 2026 · 08:00",
    studio: "Pulse Studio",
    teacher: "Leo Santos",
    attended: true,
    intensity: "High",
    fillCredit: null,
    note: "",
  },
  {
    id: "c6",
    name: "Sound Bath",
    when: "Feb 16, 2026 · 10:00",
    studio: "Lotus House",
    teacher: "Leo Santos",
    attended: true,
    intensity: "Low",
    fillCredit: null,
    note: "Acoustic cap 18 mats",
  },
  {
    id: "c7",
    name: "Power Core",
    when: "Feb 11, 2026 · 06:30",
    studio: "Pulse Studio",
    teacher: "Sarah Kim",
    attended: true,
    intensity: "High",
    fillCredit: null,
    note: "",
  },
];

export const MOCK_CREDIT_PACKS = [
  {
    id: "pack25",
    label: "Starter",
    eur: 25,
    /** Stored-value € credited to wallet after “purchase” (incl. small fill bonus in pilot). */
    walletCreditEUR: 27,
    bonus: "+€2 fill incentive",
    blurb: "Two shorter classes or one premium off-peak slot when fill rewards fire.",
    creditsEquiv: "~2 classes",
  },
  {
    id: "pack50",
    label: "Regular",
    eur: 50,
    walletCreditEUR: 55,
    bonus: "+€5 fill incentive",
    blurb: "Best blended rate for morning + lunch + weeknight mixers.",
    creditsEquiv: "~4 classes",
  },
  {
    id: "pack100",
    label: "Committed",
    eur: 100,
    walletCreditEUR: 112,
    bonus: "+€12 fill incentive",
    blurb: "Heavy weekly load across multiple partner studios.",
    creditsEquiv: "~8–9 classes",
  },
] as const;

export type MockCreditPack = (typeof MOCK_CREDIT_PACKS)[number];

export function getMockCreditPackById(id: string): MockCreditPack | null {
  return MOCK_CREDIT_PACKS.find((p) => p.id === id) ?? null;
}

export const MOCK_MEMBERSHIPS = [
  {
    id: "m-core",
    name: "Studio Core",
    priceEUR: 79,
    cadence: "month",
    blurb: "8 visits / month at any Berlin pilot location.",
    perks: ["1 buddy pass", "Retail 10%", "Pause once / quarter"],
  },
  {
    id: "m-plus",
    name: "FlowFill Plus",
    priceEUR: 109,
    cadence: "month",
    blurb: "12 visits + €40 wallet allowance for fill-credit stacking tests.",
    perks: ["Guest weeks", "Priority waitlist", "Workshops 15% off"],
  },
  {
    id: "m-desk",
    name: "Off-peak Desk",
    priceEUR: 59,
    cadence: "month",
    blurb: "Mon–Thu before 16:00 unlimited, built for empty mat hours.",
    perks: ["Peak hours blocked in app", "Auto-suggest eligible classes"],
  },
] as const;

export const MOCK_RETAIL = [
  { id: "r1", name: "Cork travel mat", priceEUR: 48, note: "Pickup Lotus House desk." },
  { id: "r2", name: "32oz insulated bottle", priceEUR: 22, note: "Studio mark, stainless." },
  { id: "r3", name: "Membership freeze (admin)", priceEUR: 15, note: "One-time processing." },
] as const;

export const MOCK_STORE_POLICY_LINES = [
  "Pilot credits do not expire; production tenants set their own policy windows.",
  "Fill bonuses credit after check-in; studios fund realized attendance only.",
  "Gift cards and corporate packs invoiced separately (FlowFill ops placeholder).",
] as const;

export const MOCK_WALLET_TRANSACTIONS: {
  id: string;
  label: string;
  date: string;
  amountEUR: number;
  type: "credit" | "debit";
}[] = [
  { id: "t1", label: "Pack purchase · Regular (+€5 bonus)", date: "Mar 12", amountEUR: 55, type: "credit" },
  { id: "t2", label: "Class · Breath & Stretch", date: "Mar 14", amountEUR: -12, type: "debit" },
  { id: "t3", label: "Fill credit · Morning Vinyasa", date: "Mar 16", amountEUR: -3, type: "debit" },
  { id: "t4", label: "Attendance cashback", date: "Mar 17", amountEUR: 3, type: "credit" },
  { id: "t5", label: "Class · Yin Restore", date: "Mar 18", amountEUR: -16, type: "debit" },
];

export const MOCK_SETTINGS_BLURBS = {
  privacy:
    "Pilot preferences live in this browser. Production FlowFill encrypts PII, surfaces GDPR exports, and signs device tokens.",
  support: "Pilot desk 08:00–21:00 CET · pilot@flowfill.demo · +49 30 555 0142 (illustrative).",
  billing: "Charges post to your PSP-hosted portal; we only show membership status and last four digits once wired.",
} as const;
