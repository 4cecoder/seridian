"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent, Skeleton } from "@bytecats/ui-kit";
import { Users, DollarSign, Calendar, BookOpen, type LucideIcon } from "lucide-react";

function MetricCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
}) {
  return (
    <Card className="group rounded-xl border-white/[0.06] bg-[#0c1222]/80 transition-all duration-200 hover:border-seridian-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.05)]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {label}
            </p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-20 rounded" />
            ) : (
              <p className="mt-1.5 font-display text-2xl font-bold text-white">
                {value}
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-seridian-500/10 text-seridian-400 transition-colors group-hover:bg-seridian-500/20">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export function BusinessOverview() {
  const clients = useQuery(api.clients.list, { status: "active" });
  const deals = useQuery(api.deals.list, {});
  const bookings = useQuery(api.bookings.list, {});
  const publishedCaseStudies = useQuery(api.caseStudies.count, {
    published: true,
  });

  const activeDealsValue =
    deals
      ?.filter((d) => d.stage !== "closed_lost")
      .reduce((sum, deal) => sum + deal.value, 0) ?? 0;

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingBookings =
    bookings?.filter((b) => {
      const bookingDate = new Date(b.startTime);
      return bookingDate >= now && bookingDate <= nextWeek;
    }).length ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-white">Business Overview</h2>
        <p className="text-sm text-slate-400">Key metrics at a glance</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active Clients"
          value={clients?.length ?? 0}
          icon={Users}
          loading={clients === undefined}
        />
        <MetricCard
          label="Active Deals"
          value={formatCurrency(activeDealsValue)}
          icon={DollarSign}
          loading={deals === undefined}
        />
        <MetricCard
          label="Upcoming Bookings"
          value={upcomingBookings}
          icon={Calendar}
          loading={bookings === undefined}
        />
        <MetricCard
          label="Published Case Studies"
          value={publishedCaseStudies ?? 0}
          icon={BookOpen}
          loading={publishedCaseStudies === undefined}
        />
      </div>
    </div>
  );
}
