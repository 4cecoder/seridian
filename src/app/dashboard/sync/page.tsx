"use client";

import { SyncDashboard } from "@/components/sync/SyncDashboard";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function SyncPage() {
  return (
    <DashboardGuard>
      <PageHeader
        title="Sync"
        description="Synchronize data from external services"
      />
      <SyncDashboard />
    </DashboardGuard>
  );
}
