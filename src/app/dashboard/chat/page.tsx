"use client";

import { ChatLayout } from "@/components/chat/ChatLayout";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function ChatPage() {
  return (
    <DashboardGuard>
      <PageHeader
        title="Chat"
        description="Team communication and messaging"
      />
      <div className="h-[calc(100vh-12rem)]">
        <ChatLayout />
      </div>
    </DashboardGuard>
  );
}
