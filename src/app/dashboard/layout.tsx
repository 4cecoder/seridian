"use client";

import { ConvexClientProvider } from "../ConvexClientProvider";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ConvexClientProvider>
  );
}
