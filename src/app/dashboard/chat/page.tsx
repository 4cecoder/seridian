"use client";

import { ChatLayout } from "@/components/chat/ChatLayout";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";

export default function ChatPage() {
  return (
    <DashboardGuard>
      <div className="h-[calc(100vh-12rem)]">
        <ChatLayout />
      </div>
    </DashboardGuard>
  );
}
