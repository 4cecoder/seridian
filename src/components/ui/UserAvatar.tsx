"use client";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatarUrl: string | null | undefined;
  size?: "xs" | "sm" | "md" | "lg";
  status?: "online" | "offline" | "away";
  className?: string;
  ringColor?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

const statusSizes = {
  xs: "h-2 w-2 border",
  sm: "h-2.5 w-2.5 border-[1.5px]",
  md: "h-2.5 w-2.5 border-2",
  lg: "h-3 w-3 border-2",
};

const statusColors = {
  online: "bg-emerald-400",
  away: "bg-amber-400",
  offline: "bg-slate-500",
};

export function UserAvatar({
  name,
  avatarUrl,
  size = "md",
  status,
  className,
  ringColor,
}: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full overflow-hidden",
          sizeClasses[size],
          !avatarUrl && "bg-seridian-500/10 text-seridian-400",
          ringColor
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${name}'s avatar`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-semibold">{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-[#0c1222]",
            statusSizes[size],
            statusColors[status]
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
