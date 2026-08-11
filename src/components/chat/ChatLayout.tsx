"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChannelList } from "./ChannelList";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { UserPanel } from "./UserPanel";
import { ChannelForm } from "./ChannelForm";
import { Id } from "convex/_generated/dataModel";

interface ChatLayoutProps {
  currentUserId?: string;
  currentUserName?: string;
}

export function ChatLayout({ currentUserId, currentUserName }: ChatLayoutProps) {
  const [activeChannelId, setActiveChannelId] = useState<Id<"channels"> | undefined>();
  const [mobilePanel, setMobilePanel] = useState<"channels" | "messages">("channels");
  const [channelFormOpen, setChannelFormOpen] = useState(false);

  function handleChannelSelect(channelId: Id<"channels">) {
    setActiveChannelId(channelId);
    setMobilePanel("messages");
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden rounded-lg border border-white/[0.08] bg-[#070b14]">
      {/* Sidebar — channels */}
      <div
        className={cn(
          "flex h-full flex-col border-r border-white/[0.08] bg-[#0c1222] transition-all duration-200",
          "w-full md:w-[280px] md:min-w-[280px]",
          mobilePanel !== "channels" && "hidden md:flex"
        )}
      >
        <ChannelList
          activeChannelId={activeChannelId}
          onChannelSelect={handleChannelSelect}
          onCreateChannel={() => setChannelFormOpen(true)}
          currentUserId={currentUserId}
        />
      </div>

      {/* Main — messages */}
      <div
        className={cn(
          "flex h-full flex-1 flex-col min-w-0",
          mobilePanel !== "messages" && "hidden md:flex"
        )}
      >
        {activeChannelId ? (
          <>
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3 md:hidden">
              <button
                type="button"
                onClick={() => setMobilePanel("channels")}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                ←
              </button>
              <span className="text-sm font-medium text-slate-200 truncate">
                Channel
              </span>
            </div>
            <MessageList
              channelId={activeChannelId}
              currentUserId={currentUserId}
            />
            <MessageInput
              channelId={activeChannelId}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-600 text-sm">
            Select a channel to start chatting
          </div>
        )}
      </div>

      {/* Sidebar — users (desktop only) */}
      <div className="hidden md:flex h-full w-[240px] min-w-[240px] flex-col border-l border-white/[0.08] bg-[#0c1222]">
        <UserPanel currentUserId={currentUserId} />
      </div>

      {/* Channel creation modal */}
      <ChannelForm
        open={channelFormOpen}
        onOpenChange={setChannelFormOpen}
        currentUserId={currentUserId}
        onSuccess={(channelId) => {
          setChannelFormOpen(false);
          handleChannelSelect(channelId);
        }}
      />
    </div>
  );
}
