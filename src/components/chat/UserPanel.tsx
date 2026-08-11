"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type User = Doc<"users">;

interface UserPanelProps {
  currentUserId?: string;
}

const STATUS_COLORS: Record<User["status"], string> = {
  online: "bg-green-400",
  away: "bg-amber-400",
  offline: "bg-slate-600",
};

function UserRow({ user, isCurrent }: { user: User; isCurrent: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
        isCurrent
          ? "bg-white/[0.06] text-white"
          : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
      )}
    >
      <div className="relative shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-seridian-500/10 text-xs font-semibold text-seridian-400">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0c1222]",
            STATUS_COLORS[user.status]
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{user.name}</div>
        <div className="text-[11px] capitalize text-slate-600">
          {user.status}
        </div>
      </div>
    </div>
  );
}

export function UserPanel({ currentUserId }: UserPanelProps) {
  const users = useQuery(api.users.list, {});

  const onlineUsers = users?.filter((u) => u.status === "online") ?? [];
  const awayUsers = users?.filter((u) => u.status === "away") ?? [];
  const offlineUsers = users?.filter((u) => u.status === "offline") ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.08] px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-200">Users</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {users === undefined ? (
          <div className="space-y-1 px-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded-md bg-white/[0.02]"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-slate-600">
            No users online
          </div>
        ) : (
          <>
            {onlineUsers.length > 0 && (
              <div>
                <h3 className="mb-1 px-2.5 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                  Online — {onlineUsers.length}
                </h3>
                <div className="space-y-0.5">
                  {onlineUsers.map((user) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      isCurrent={user.pubkey === currentUserId}
                    />
                  ))}
                </div>
              </div>
            )}

            {awayUsers.length > 0 && (
              <div>
                <h3 className="mb-1 px-2.5 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                  Away — {awayUsers.length}
                </h3>
                <div className="space-y-0.5">
                  {awayUsers.map((user) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      isCurrent={user.pubkey === currentUserId}
                    />
                  ))}
                </div>
              </div>
            )}

            {offlineUsers.length > 0 && (
              <div>
                <h3 className="mb-1 px-2.5 text-[11px] font-medium uppercase tracking-wider text-slate-600">
                  Offline — {offlineUsers.length}
                </h3>
                <div className="space-y-0.5">
                  {offlineUsers.map((user) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      isCurrent={user.pubkey === currentUserId}
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
