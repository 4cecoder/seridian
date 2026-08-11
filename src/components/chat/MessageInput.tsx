"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

interface MessageInputProps {
  channelId: Id<"channels">;
  currentUserId?: string;
  currentUserName?: string;
}

export function MessageInput({ channelId, currentUserId, currentUserName }: MessageInputProps) {
  const [content, setContent] = useState("");
  const sendMessage = useMutation(api.messages.send);

  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    try {
      await sendMessage({
        channelId,
        senderId: currentUserId ?? "anonymous",
        senderName: currentUserName ?? "Anonymous",
        content: trimmed,
        type: "text",
      });
      setContent("");
    } catch {
      // Silently fail — message will retry on next attempt
    }
  }, [content, channelId, sendMessage, currentUserId, currentUserName]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="border-t border-white/[0.08] bg-[#0c1222] p-3">
      <div className="flex items-end gap-2 rounded-lg border border-white/[0.08] bg-[#070b14] px-3 py-2 focus-within:border-seridian-500/30 transition-colors">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none leading-relaxed min-h-[24px] max-h-[120px]"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim()}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-seridian-500 text-[#070b14] transition-all hover:bg-seridian-400 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ↑
        </button>
      </div>
      <div className="mt-1.5 flex items-center gap-3 px-1">
        <span className="text-[11px] text-slate-600">
          Press Enter to send, Shift+Enter for new line
        </span>
      </div>
    </div>
  );
}
