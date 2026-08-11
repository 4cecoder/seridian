"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type Message = Doc<"messages">;

interface MessageListProps {
  channelId: Id<"channels">;
  currentUserId?: string;
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

function MessageBubble({
  message,
  isOwn,
  showSender,
  replyToMessage,
}: {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
  replyToMessage?: Message;
}) {
  return (
    <div
      className={cn(
        "group px-4 py-1 hover:bg-white/[0.02] transition-colors",
        showSender && "pt-2"
      )}
    >
      {showSender && (
        <div className="flex items-center gap-2 mb-0.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-seridian-500/10 text-xs font-semibold text-seridian-400">
            {getInitial(message.senderName)}
          </div>
          <span className="text-sm font-medium text-slate-200">
            {message.senderName}
          </span>
          <span className="text-[11px] text-slate-600">
            {formatTime(message.createdAt)}
          </span>
        </div>
      )}

      {replyToMessage && (
        <div className="ml-9 mb-1 flex items-center gap-1.5 text-[11px] text-slate-600">
          <span className="text-slate-500">↩</span>
          <span className="truncate">
            {replyToMessage.senderName}: {replyToMessage.content}
          </span>
        </div>
      )}

      <div
        className={cn(
          "text-sm text-slate-300 leading-relaxed",
          showSender ? "ml-9" : "ml-9"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="text-[11px] font-medium text-slate-600">{date}</span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}

export function MessageList({ channelId, currentUserId }: MessageListProps) {
  const messages = useQuery(api.messages.listByChannel, { channelId });
  const allMessages = useQuery(api.messages.listAll, {});

  const messageMap = new Map<string, Message>();
  if (allMessages) {
    for (const msg of allMessages) {
      messageMap.set(msg._id, msg);
    }
  }

  const messagesByDate = new Map<string, Message[]>();
  if (messages) {
    for (const msg of messages) {
      const dateKey = new Date(msg.createdAt).toDateString();
      const group = messagesByDate.get(dateKey) ?? [];
      group.push(msg);
      messagesByDate.set(dateKey, group);
    }
  }

  const sortedDates = Array.from(messagesByDate.keys()).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {messages === undefined ? (
        <div className="flex h-full items-center justify-center">
          <div className="space-y-3 w-full max-w-md px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-white/[0.03]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 animate-pulse rounded bg-white/[0.03]" />
                  <div className="h-4 w-full animate-pulse rounded bg-white/[0.02]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-600">
          No messages yet. Start the conversation.
        </div>
      ) : (
        <div className="pb-4">
          {sortedDates.map((dateKey) => {
            const group = messagesByDate.get(dateKey) ?? [];
            return (
              <div key={dateKey}>
                <DateDivider date={formatDate(group[0].createdAt)} />
                {group.map((msg, idx) => {
                  const prev = group[idx - 1];
                  const showSender =
                    !prev ||
                    prev.senderId !== msg.senderId ||
                    msg.createdAt - prev.createdAt > 300000;
                  const replyToMsg = msg.replyTo
                    ? messageMap.get(msg.replyTo)
                    : undefined;

                  return (
                    <MessageBubble
                      key={msg._id}
                      message={msg}
                      isOwn={msg.senderId === currentUserId}
                      showSender={showSender}
                      replyToMessage={replyToMsg}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
