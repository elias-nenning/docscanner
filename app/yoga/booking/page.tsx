"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getYogaStudioById } from "@/components/yoga/useYogaStudio";
import { useYogaBookings } from "@/components/yoga/useYogaBookings";

type PaymentMethod = "credits" | "card" | "membership";

export default function YogaBookingPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { addBooking } = useYogaBookings();

  const studioId = sp.get("studio") || "prana";
  const studio = getYogaStudioById(studioId);

  const month = sp.get("month") || "2026-03";
  const day = sp.get("day") || "16";
  const time = sp.get("time") || "";
  const name = sp.get("name") || "Class";
  const teacher = sp.get("teacher") || "";
  const dur = sp.get("dur") || "";

  const price = useMemo(() => {
    if (name.toLowerCase().includes("sound")) return 18;
    if (name.toLowerCase().includes("power")) return 16;
    return 14;
  }, [name]);

  const [method, setMethod] = useState<PaymentMethod>("credits");
  const [creditsBalance, setCreditsBalance] = useState(12);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canPayWithCredits = creditsBalance >= price;

  async function confirm() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    if (method === "credits") {
      if (!canPayWithCredits) {
        setLoading(false);
        return;
      }
      setCreditsBalance((c) => c - price);
    }

    addBooking({
      studioId,
      month,
      day: Number(day),
      time,
      name,
      teacher,
      dur,
      priceEUR: price,
      paidWith: method,
    });

    setLoading(false);
    setSuccess(true);
    window.setTimeout(() => {
      router.push("/yoga/my-calendar");
    }, 900);
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Payment</h1>
          <p className="text-sm text-zinc-600 mt-1">Choose how you want to pay, then confirm.</p>
        </div>
        <button onClick={() => router.back()} className="text-sm font-semibold text-zinc-700 hover:text-zinc-900">
          ← Back
        </button>
      </div>

      <div className="mt-5 grid lg:grid-cols-2 gap-4">
        <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Session</div>
          <div className="mt-2 text-lg font-bold text-zinc-900">{name}</div>
          <div className="text-sm text-zinc-600 mt-1">
            {month}-{String(day).padStart(2, "0")} · {time} {dur ? `· ${dur}` : ""}
          </div>
          {teacher ? <div className="text-sm text-zinc-600 mt-1">Instructor: {teacher}</div> : null}
          <div className="text-sm text-zinc-600 mt-1">Studio: {studio?.name ?? studioId}</div>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
            <div className="text-sm text-zinc-600">Price</div>
            <div className="text-lg font-extrabold text-zinc-900">€{price}</div>
          </div>
        </div>

        <div className="border border-zinc-200 rounded-2xl p-5 bg-white">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Payment options</div>

          <div className="mt-3 space-y-2">
            <button
              onClick={() => setMethod("credits")}
              className={`w-full text-left border rounded-2xl px-4 py-3 transition ${
                method === "credits" ? "border-indigo-300 bg-indigo-50" : "border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-zinc-900">Credits</div>
                  <div className="text-sm text-zinc-600 mt-1">
                    Balance: {creditsBalance} · Needs {price}
                  </div>
                </div>
                <div
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    canPayWithCredits ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"
                  }`}
                >
                  {canPayWithCredits ? "OK" : "Not enough"}
                </div>
              </div>
            </button>

            <button
              onClick={() => setMethod("card")}
              className={`w-full text-left border rounded-2xl px-4 py-3 transition ${
                method === "card" ? "border-indigo-300 bg-indigo-50" : "border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              <div className="font-semibold text-zinc-900">Card</div>
              <div className="text-sm text-zinc-600 mt-1">Pay with your card (demo).</div>
            </button>

            <button
              onClick={() => setMethod("membership")}
              className={`w-full text-left border rounded-2xl px-4 py-3 transition ${
                method === "membership" ? "border-indigo-300 bg-indigo-50" : "border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              <div className="font-semibold text-zinc-900">Membership</div>
              <div className="text-sm text-zinc-600 mt-1">Use membership access (demo).</div>
            </button>
          </div>

          <div className="mt-4">
            <button
              disabled={loading || (method === "credits" && !canPayWithCredits)}
              onClick={confirm}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                loading || (method === "credits" && !canPayWithCredits) ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {success ? "Booked!" : loading ? "Processing…" : "Confirm & book"}
            </button>
            {method === "credits" && !canPayWithCredits ? (
              <div className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">Not enough credits. Choose Card or Membership.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

