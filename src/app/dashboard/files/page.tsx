"use client";

import { FileManager } from "@/components/files/FileManager";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function FilesPage() {
  return (
    <DashboardGuard>
      <PageHeader
        title="Files"
        description="Manage project files and documents"
      />
      <FileManager />
    </DashboardGuard>
  );
}
