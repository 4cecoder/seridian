"use client";

import { ChatLayout } from "@/components/chat/ChatLayout";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";

export default function ChatPage() {
  return (
    <DashboardGuard>
      <div className="h-full w-full flex flex-col overflow-hidden bg-[#070b14]">
        <ChatLayout />
      </div>
    </DashboardGuard>
  );
}

