import { ConvexClientProvider } from "../ConvexClientProvider";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { QueryProvider } from "../QueryProvider";

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <ConvexClientProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </ConvexClientProvider>
    </QueryProvider>
  );
}
