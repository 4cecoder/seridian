"use client";

import { BusinessOverview } from "@/components/business/BusinessOverview";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CardGridSkeleton } from "@/components/dashboard/PageSkeleton";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <DashboardGuard>
      <PageHeader
        title="Overview"
        description="Key metrics at a glance"
      />
      <Suspense fallback={<CardGridSkeleton />}>
        <BusinessOverview />
      </Suspense>
    </DashboardGuard>
  );
}
