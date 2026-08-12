"use client";

import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { LightBeamsBackground } from "@/components/three/backgrounds";

export default function BookingsPage() {
  return (
    <DashboardGuard>
      <LightBeamsBackground />
      <div className="p-4 md:p-6 space-y-6">
        <BookingCalendar />
      </div>
    </DashboardGuard>
  );
}
