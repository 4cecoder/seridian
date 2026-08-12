"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  Hash,
  Lock,
  MessageSquare,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  BarChart3,
  Search,
  Bot,
  Users,
  Radio
} from "lucide-react";

type Channel = Doc<"channels">;

interface ChannelListProps {
  activeChannelId?: Id<"channels">;
  onChannelSelect: (channelId: Id<"channels">) => void;
  onCreateChannel: () => void;
  currentUserId?: string;
}

const AI_STUDIO_BOTS = [
  {
    id: "bot-seridian",
    name: "Seridian AI",
    tag: "@SeridianAI",
    role: "Architect Agent",
    icon: Sparkles,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    status: "online",
  },
  {
    id: "bot-linearsync",
    name: "LinearSyncBot",
    tag: "@LinearSyncBot",
    role: "Sprint Orchestrator",
    icon: Zap,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    status: "online",
  },
  {
    id: "bot-datapulse",
    name: "DataPulse",
    tag: "@DataPulse",
    role: "Analytics Bot",
    icon: BarChart3,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    status: "online",
  },
];

function ChannelItem({
  channel,
  isActive,
  onClick,
  onDelete,
}: {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const IconComponent =
    channel.type === "public"
      ? Hash
      : channel.type === "private"
        ? Lock
        : MessageSquare;

  return (
    <div className="group flex items-center">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition-all",
          isActive
            ? "bg-cyan-500/10 font-semibold text-cyan-300 border border-cyan-500/30 shadow-sm"
            : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
        )}
      >
        <IconComponent
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            isActive ? "text-cyan-400" : "text-slate-500"
          )}
        />
        <span className="truncate font-medium flex-1">{channel.name}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
        aria-label={`Delete ${channel.name}`}
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

export function ChannelList({
  activeChannelId,
  onChannelSelect,
  onCreateChannel,
  currentUserId,
}: ChannelListProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const channels = useQuery(api.channels.list, {});
  const removeChannel = useMutation(api.channels.remove);

  const filteredChannels = (channels || []).filter((c) =>
    c.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const publicChannels = filteredChannels.filter((c) => c.type === "public");
  const privateChannels = filteredChannels.filter((c) => c.type === "private");
  const directChannels = filteredChannels.filter(
    (c) => c.type === "direct" && c.participants.includes(currentUserId ?? "")
  );

  function handleDelete(channelId: Id<"channels">) {
    if (confirm("Delete this channel and all its messages?")) {
      removeChannel({ channelId });
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#0c1222]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3 bg-[#080d1a]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Workspace Channels
          </h2>
        </div>
        <button
          type="button"
          onClick={onCreateChannel}
          className="flex h-7 items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-300"
          title="Create Channel"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#070b14] px-2.5 py-1.5 text-xs text-slate-400 focus-within:border-cyan-500/40 focus-within:ring-1 focus-within:ring-cyan-500/20">
          <Search className="h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter channels..."
            className="w-full bg-transparent text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Scrollable Channels List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 scrollbar-thin">

        {/* Channel Categories */}
        {channels === undefined ? (
          <div className="space-y-1.5 px-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-7 animate-pulse rounded-md bg-white/[0.04]"
              />
            ))}
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-slate-500 italic">
            No channels found
          </div>
        ) : (
          <>
            {/* Public Channels */}
            {publicChannels.length > 0 && (
              <div>
                <h3 className="mb-1 px-2.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  Public Channels ({publicChannels.length})
                </h3>
                <div className="space-y-0.5">
                  {publicChannels.map((channel) => (
                    <ChannelItem
                      key={channel._id}
                      channel={channel}
                      isActive={activeChannelId === channel._id}
                      onClick={() => onChannelSelect(channel._id)}
                      onDelete={() => handleDelete(channel._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Private Channels */}
            {privateChannels.length > 0 && (
              <div>
                <h3 className="mb-1 px-2.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  Private Channels ({privateChannels.length})
                </h3>
                <div className="space-y-0.5">
                  {privateChannels.map((channel) => (
                    <ChannelItem
                      key={channel._id}
                      channel={channel}
                      isActive={activeChannelId === channel._id}
                      onClick={() => onChannelSelect(channel._id)}
                      onDelete={() => handleDelete(channel._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Direct Messages */}
            {directChannels.length > 0 && (
              <div>
                <h3 className="mb-1 px-2.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                  Direct Messages ({directChannels.length})
                </h3>
                <div className="space-y-0.5">
                  {directChannels.map((channel) => (
                    <ChannelItem
                      key={channel._id}
                      channel={channel}
                      isActive={activeChannelId === channel._id}
                      onClick={() => onChannelSelect(channel._id)}
                      onDelete={() => handleDelete(channel._id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
