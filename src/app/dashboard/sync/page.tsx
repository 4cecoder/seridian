"use client";

import { SyncDashboard } from "@/components/sync/SyncDashboard";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";

export default function SyncPage() {
  return (
    <DashboardGuard>
      <SyncDashboard />
    </DashboardGuard>
  );
}
