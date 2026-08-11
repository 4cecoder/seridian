"use client";

import { ChatLayout } from "@/components/chat/ChatLayout";
import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <DashboardGuard>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-slate-400" />
          <span className="text-sm text-slate-400">Real-time team chat</span>
        </div>
        <div className="h-[calc(100vh-16rem)] overflow-hidden rounded-lg border border-white/[0.06] bg-[#070b14]">
          <ChatLayout />
        </div>
      </div>
    </DashboardGuard>
  );
}
