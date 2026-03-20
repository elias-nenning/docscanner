import { NextResponse } from "next/server";
import {
  builtinBooking,
  getBuiltinClassById,
  incrementBuiltinClassBookings,
  recordBuiltinBookingCreditDebit,
  recordBuiltinFillCredit,
} from "@/lib/builtin-yoga-api";
import { fillCreditEUR } from "@/lib/fill-credit-tiers";

export async function POST(req: Request) {
  let body: { user_id?: number; instance_id?: number; pay_with?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const user_id = body.user_id;
  const instance_id = body.instance_id;
  const pay_with = String(body.pay_with ?? "credits").toLowerCase();
  if (!Number.isFinite(user_id) || !Number.isFinite(instance_id)) {
    return NextResponse.json({ error: "user_id and instance_id required" }, { status: 400 });
  }
  const inst = getBuiltinClassById(instance_id as number);
  if (!inst) {
    return NextResponse.json({ error: "class instance not found" }, { status: 404 });
  }
  const booking = builtinBooking(user_id as number, inst);
  if (pay_with === "credits") {
    recordBuiltinBookingCreditDebit(user_id as number, {
      amount: booking.credits_used,
      instanceId: instance_id as number,
      bookingId: booking.id,
    });
    // Grant fill credit based on occupancy + time proximity (before this booking)
    const capacity = inst.capacity ?? 20;
    const booked = inst.bookings_count ?? 0;
    const sessionDate = inst.date ? `${inst.date}T12:00:00` : undefined;
    const fillEur = fillCreditEUR(booked, capacity, sessionDate);
    if (fillEur > 0) {
      const classLabel = inst.class_type?.trim() || "Class";
      recordBuiltinFillCredit(
        user_id as number,
        fillEur,
        instance_id as number,
        `Fill incentive · ${classLabel} (${Math.round((booked / capacity) * 100)}% full)`,
      );
    }
    try {
      incrementBuiltinClassBookings(instance_id as number);
    } catch {
      // Non-fatal: schedule may not reflect updated occupancy until refresh
    }
  } else {
    try {
      incrementBuiltinClassBookings(instance_id as number);
    } catch {
      // Non-fatal
    }
  }
  return NextResponse.json(booking, { status: 201 });
}
