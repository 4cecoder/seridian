"use client";

import { BusinessOverview } from "@/components/business/BusinessOverview";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { CardGridSkeleton } from "@/components/dashboard/PageSkeleton";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <DashboardGuard>
      <div className="space-y-6">
        <Suspense fallback={<CardGridSkeleton />}>
          <BusinessOverview />
        </Suspense>

        <Suspense fallback={<CardGridSkeleton />}>
          <ActivityFeed />
        </Suspense>
      </div>
    </DashboardGuard>
  );
}
