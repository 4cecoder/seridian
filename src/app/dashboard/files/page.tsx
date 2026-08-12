"use client";

import { FileManager } from "@/components/files/FileManager";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { AuroraBackground } from "@/components/three/backgrounds";

export default function FilesPage() {
  return (
    <DashboardGuard>
      <AuroraBackground />
      <FileManager />
    </DashboardGuard>
  );
}
