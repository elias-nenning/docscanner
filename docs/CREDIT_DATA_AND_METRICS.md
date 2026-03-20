# Credit data & metrics — scope for a credible operator story

**Product surface:** desk credits at **`/dashboard/credits`** use a static sample table in the page; member balances live under **`/yoga/credits`** (Wallet) after sign-in.

FlowFill’s wedge is **off-peak fill** via **time-tiered credits** and **transparent studio economics**. To feel “legit” fast, prioritize **credit-related** data that operators and finance actually reconcile—not a full gym ERP.

This note is **product/research guidance**: definitions fit boutique fitness / class-based studios. It is **not** accounting or legal advice (revenue recognition, escheatment, and tax depend on jurisdiction and your accountants).

---

## 1. Two different “credits” (keep them separate)

Confusing these makes dashboards untrustworthy.

| Concept | What it is | Economic role | Typical operator question |
|--------|-------------|---------------|---------------------------|
| **Stored value** | Money‑backed balances: packs, top-ups, membership allowance shown as € or “credits” in a wallet | **Deferred revenue / liability** until redeemed or expired | “How much do we owe members in unused value?” |
| **Fill / promo credits** | Session discounts to move weak slots (your €5 / €3 style); may be time-boxed or capped | **Promotional cost** / contra-revenue attribution, not always a member wallet balance | “What did we spend to fill seats, and what revenue did those seats yield?” |

**Minimum rule for the product:** persist **type** on every ledger movement (`purchase` | `redemption` | `fill_credit_applied` | `expiry` | `adjustment` | `clawback`) and whether it hits **liability** vs **promo spend**.

Code today already points this way: member wallet vs fill labels in UI; `lib/incentive-earnings-model.ts` models grants, clawbacks, and attribution.

---

## 2. Minimum entities (simple, enough for real metrics)

To support **credit metrics** without boiling the ocean:

1. **Member wallet** — `user_id`, `currency`, `balance_eur` (or credit points with fixed EUR conversion).
2. **Ledger line** — `id`, `user_id`, `ts`, `amount_eur` (signed), `type` (above), `source_ref` (booking_id, pack_purchase_id, class_instance_id), `program` (pack name / promo campaign), `expires_at` optional.
3. **Booking** — links redemption to **class instance** and **list price**; status for attendance / cancel (drives clawback and show-up).
4. **Class instance** — capacity, bookings count, **list price**; optional **fill_credit_eligible** / tier (you already infer incentives from fill in the operator dashboard).

Your API shapes (`BackendCreditBalance`, `BackendCreditTxn`, `BackendBooking`, `BackendClassInstance` in `components/api/backend.ts`) are close—**richer txn `type` and expiry** are the main gaps for a credible ledger.

---

## 3. Credit metrics that matter (restrained set)

Pick **8 core KPIs** for v1; everything else is noise for “by tomorrow.”

### Liability & liquidity

1. **Outstanding stored-value balance (EUR)**  
   Sum of positive wallet balances (or liability bucket only). *What you implicitly “owe” as unused packs.*

2. **Weighted average age of liability (days)**  
   Average days since **purchase** for unredeemed balance (by EUR weight). *Staging risk and redemption velocity.*

3. **Redemption rate (30/90d)**  
   € redeemed ÷ € of opening liability (or simpler: sessions redeemed ÷ sessions sold in window). *Are packs actually being used?*

### Promo / fill credits (your topic focus)

4. **Fill-credit exposure (EUR, period)**  
   Sum of **face value** of fill credits **applied** at booking (not necessarily issued liability). *Direct cost of the incentive program.*

5. **Fill-credit utilization**  
   Issued or surfaced ÷ applied (if you separate “offer” vs “redeemed”), or **sessions with fill** ÷ off-peak sessions. *Are members taking the offer?*

6. **Attributed mat hours (or revenue) from filled slots**  
   List-price equivalent of bookings that **would likely not have filled** without incentive—your model already tracks “attributed” style rollups in `StudioPeriodSummary` / demand curves. Keep a **simple** proxy first: revenue from sessions where `fill_credit_applied > 0`.

### Quality of revenue

7. **Show-up / honourable-cancel rate for credit bookings**  
   Attended (or policy-compliant late cancel) ÷ booked, **split by payment type** (stored value vs card vs fill). *Credits attract no-shows?*

8. **Breakage estimate (optional, keep dumb)**  
   Historical % of sold pack value unredeemed after N months—**label as estimate**, don’t automate accounting. Industry treats **breakage** carefully (recognition rules, escheatment). For a prototype: **“estimated unredeemed % (trailing)”** is enough to sound serious.

---

## 4. What honest studios expect you *not* to claim yet

- Full **ASC 606 / IFRS** revenue schedules, multi-element arrangements, gift-card escheatment—out of scope until you have a payments partner and counsel.
- **Per-seat marginal cost** — only if you add payroll + rent allocation; omit for MVP.
- **Network-wide benchmarks** — unless you have real anonymized cohorts; use **per-studio trend** only.

---

## 5. Mapping to this repo (next implementation steps)

| Area | Today | To look “legit” on credits |
|------|--------|------------------------------|
| Built-in API `GET /api/v1/credits/user/:id` | Balance + empty `transactions` | Return **5–10 synthetic txns** with `type`, `reason`, dates, signed amounts |
| Operator `/dashboard/credits` | Mock customer rows | Add columns or tiles: **liability vs promo spend**, **expiring soon**, **redemption rate** |
| Member `/yoga/credits` | Mix of mock + API | Same txn types; clarify copy in UI: **wallet** vs **fill applied this month** |
| `useCreditsWallet` / booking | Balance from API when authed | After booking, **append redemption** txn in API or refetch |

---

## 6. Sources (conceptual, not endorsements)

- Deferred revenue / class packs as liability until delivery is standard in gym SaaS education (e.g. industry articles on **prepaid / deferred revenue** for fitness).
- **Breakage** is a defined concept in prepaid value programs; recognition is policy-heavy—treat as **estimated KPI**, not auto-revenue in v1.
- Operator tools (e.g. Zenoti **packages liability** style reports) frame the same problem: **outstanding package value** and redemption.

---

## 7. One-sentence product pitch alignment

> FlowFill shows **how much stored-value liability a studio carries**, **how fill credits move off-peak utilization**, and **whether credit-backed bookings actually show up**—without pretending to be a full general ledger.

That is enough to be **on-topic, simple, and defensible** for a deadline build.
