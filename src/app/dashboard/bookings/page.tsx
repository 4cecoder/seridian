"use client";

import { useState, lazy, Suspense } from "react";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { Skeleton } from "@bytecats/ui-kit";

const BookingForm = lazy(() =>
  import("@/components/bookings/BookingForm").then((mod) => ({
    default: mod.BookingForm,
  }))
);

export default function BookingsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [formDate, setFormDate] = useState<string | undefined>();

  function handleDayClick(date: string) {
    setFormDate(date);
    setFormOpen(true);
  }

  return (
    <DashboardGuard>
      <BookingCalendar onDayClick={handleDayClick} />

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl border border-white/[0.08] bg-[#0c1222] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">New Booking</h2>
              <button
                type="button"
                onClick={() => { setFormOpen(false); setFormDate(undefined); }}
                className="text-slate-500 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <Suspense
              fallback={<div className="h-48 animate-pulse rounded-lg bg-white/[0.02]" />}
            >
              <BookingForm
                defaultDate={formDate}
                onSuccess={() => {
                  setFormOpen(false);
                  setFormDate(undefined);
                }}
              />
            </Suspense>
          </div>
        </div>
      )}
    </DashboardGuard>
  );
}
