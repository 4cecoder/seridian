"use client";

import { BusinessOverview } from "@/components/business/BusinessOverview";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { CardGridSkeleton } from "@/components/dashboard/PageSkeleton";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <DashboardGuard>
      <Suspense fallback={<CardGridSkeleton />}>
        <BusinessOverview />
      </Suspense>
    </DashboardGuard>
  );
}
