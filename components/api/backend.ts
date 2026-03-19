export type BackendUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  studio_id?: number | null;
  credits_balance: number;
  membership_type?: string | null;
  age?: number | null;
  joined_date?: string | null;
};

export type BackendStudio = {
  id: number;
  name: string;
  style?: string | null;
  address?: string | null;
  description?: string | null;
  price_per_class_eur?: number | null;
  default_capacity?: number | null;
  rating?: number | null;
  owner_user_id?: number | null;
};

export type BackendClassInstance = {
  id: number;
  schedule_id?: number | null;
  studio_id: number;
  date: string; // YYYY-MM-DD
  day_of_week: number;
  time?: string | null; // HH:MM
  class_type?: string | null;
  instructor?: string | null;
  capacity?: number | null;
  bookings_count?: number | null;
  waitlist_count?: number | null;
  occupancy_rate?: number | null;
  price_eur?: number | null;
  status: string;
};

export type BackendBooking = {
  id: number;
  user_id: number;
  instance_id: number;
  studio_id: number;
  class_type?: string | null;
  class_date: string; // YYYY-MM-DD
  class_time?: string | null; // HH:MM
  day_of_week?: number | null;
  status: "confirmed" | "waitlist" | "cancelled" | string;
  attended?: boolean | null;
  credits_used: number;
  price_paid_eur?: number | null;
  booked_at: string;
};

export type BackendCreditTxn = {
  id: number;
  user_id: number;
  type: string;
  amount: number;
  reason?: string | null;
  source_instance_id?: number | null;
  dest_instance_id?: number | null;
  created_at: string; // YYYY-MM-DD
};

export type BackendCreditBalance = {
  user_id: number;
  balance: number;
  transactions: BackendCreditTxn[];
};

function baseUrl() {
  const url = process.env.NEXT_PUBLIC_YOGA_BACKEND_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_YOGA_BACKEND_URL (e.g. http://localhost:8000)");
  }
  return url.replace(/\/+$/, "");
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }
  return (await res.json()) as T;
}

export const backend = {
  // --- Users ---
  getUserById: (userId: number) => apiFetch<BackendUser>(`/api/v1/users/${userId}`),
  getUserByEmail: (email: string) =>
    apiFetch<BackendUser>(`/api/v1/users/by-email?email=${encodeURIComponent(email.trim().toLowerCase())}`),
  createUser: (body: { name: string; email: string; role?: string }) =>
    apiFetch<BackendUser>(`/api/v1/users`, { method: "POST", body: JSON.stringify(body) }),

  // --- Studios ---
  listStudios: () => apiFetch<BackendStudio[]>(`/api/v1/studios`),
  getStudio: (studioId: number) => apiFetch<BackendStudio & { class_schedules?: unknown[] }>(`/api/v1/studios/${studioId}`),

  // --- Classes ---
  listClasses: (params?: { studio_id?: number; date?: string; class_type?: string }) => {
    const sp = new URLSearchParams();
    if (params?.studio_id != null) sp.set("studio_id", String(params.studio_id));
    if (params?.date) sp.set("date", params.date);
    if (params?.class_type) sp.set("class_type", params.class_type);
    const qs = sp.toString();
    return apiFetch<BackendClassInstance[]>(`/api/v1/classes${qs ? `?${qs}` : ""}`);
  },
  getClass: (instanceId: number) => apiFetch<BackendClassInstance>(`/api/v1/classes/${instanceId}`),

  // --- Bookings ---
  createBooking: (body: { user_id: number; instance_id: number }) =>
    apiFetch<BackendBooking>(`/api/v1/bookings`, { method: "POST", body: JSON.stringify(body) }),
  listUserBookings: (userId: number) => apiFetch<BackendBooking[]>(`/api/v1/bookings/user/${userId}`),
  cancelBooking: (bookingId: number) => apiFetch<{ status: string; booking_id: number }>(`/api/v1/bookings/${bookingId}/cancel`, { method: "PATCH" }),

  // --- Credits ---
  getCredits: (userId: number) => apiFetch<BackendCreditBalance>(`/api/v1/credits/user/${userId}`),
};

