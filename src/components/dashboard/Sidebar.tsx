"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@bytecats/ui-kit";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "\u2302" },
  { href: "/dashboard/issues", label: "Issues", icon: "\u2610" },
  { href: "/dashboard/clients", label: "Clients", icon: "\u25CE" },
  { href: "/dashboard/bookings", label: "Bookings", icon: "\u25F7" },
  { href: "/dashboard/sales", label: "Sales", icon: "\u25AD" },
  { href: "/dashboard/proposals", label: "Proposals", icon: "\u229E" },
  { href: "/dashboard/templates", label: "Templates", icon: "\u2709" },
  { href: "/dashboard/files", label: "Files", icon: "\u{1F4C4}" },
  { href: "/dashboard/sync", label: "Sync", icon: "\u21BB" },
  { href: "/dashboard/chat", label: "Chat", icon: "\u{1F4AC}" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-white/5 bg-slate-950 transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[240px]",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/5",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-label="Seridian logo"
            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-contain"
              aria-hidden="true"
            >
              <source
                src="/assets/images/Can_you_make_a_video_of_that_a.mp4"
                type="video/mp4"
              />
            </video>
          </span>
          {!collapsed && (
            <span className="font-display text-base font-semibold tracking-tight text-white">
              Seridian
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-seridian-500/10 text-seridian-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className="text-base shrink-0" aria-hidden="true">
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex h-9 w-full items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180",
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
      </div>
    </aside>
  );
}
