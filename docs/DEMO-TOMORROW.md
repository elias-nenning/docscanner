# Tomorrow’s demo — 2-minute map

1. **`/dashboard`** — Desk overview: same API date slice; badge shows **built-in API** vs **external backend** vs **fallback**.
2. **`/yoga/schedule`** — show weak-slot fill credits; same class IDs flow into booking.
3. **Login** with any email — user is created/loaded via `/api/v1/users`; bookings + credits use that `user_id`.
4. **`/dashboard/credits`** — grid is sample/illustrative; real wallet is under Members → Wallet.
5. **`/dashboard/directory`** — studios on the same schedule members see.

Built-in mode: leave `NEXT_PUBLIC_YOGA_BACKEND_URL` unset — all calls hit this app’s `/api/v1/*` (works offline).

External mode: set the env var to your FastAPI origin; UI unchanged.
