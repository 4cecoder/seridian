"use client";

import { BusinessOverview } from "@/components/business/BusinessOverview";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { StarryBackground } from "@/components/three/backgrounds";

export default function DashboardPage() {
  return (
    <DashboardGuard>
      <StarryBackground />
      <BusinessOverview />
    </DashboardGuard>
  );
}
