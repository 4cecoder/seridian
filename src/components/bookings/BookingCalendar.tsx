"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { Button } from "@bytecats/ui-kit";
import { cn } from "@/lib/utils";

type Booking = Doc<"bookings">;

const typeColors: Record<Booking["type"], { bg: string; text: string; dot: string }> = {
  consultation: {
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  development: {
    bg: "bg-purple-500/10 border-purple-500/20",
    text: "text-purple-400",
    dot: "bg-purple-400",
  },
  review: {
    bg: "bg-green-500/10 border-green-500/20",
    text: "text-green-400",
    dot: "bg-green-400",
  },
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  for (let i = startDay - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

interface BookingCalendarProps {
  onDayClick?: (date: string) => void;
  onBookingClick?: (bookingId: Id<"bookings">) => void;
}

export function BookingCalendar({ onDayClick, onBookingClick }: BookingCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const bookings = useQuery(api.bookings.list, {});
  const clients = useQuery(api.clients.list, {});

  const clientMap = useMemo(
    () => new Map<string, string>((clients ?? []).map((c) => [c._id, c.name])),
    [clients]
  );

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    if (!bookings) return map;
    for (const b of bookings) {
      const dateKey = b.startTime.slice(0, 10);
      const list = map.get(dateKey) ?? [];
      list.push(b);
      map.set(dateKey, list);
    }
    return map;
  }, [bookings]);

  const today = toISODate(new Date());
  const monthLabel = new Date(year, month).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function handleDayClick(dateStr: string) {
    setSelectedDate(dateStr === selectedDate ? null : dateStr);
    onDayClick?.(dateStr);
  }

  const selectedBookings = selectedDate
    ? (bookingsByDate.get(selectedDate) ?? [])
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Bookings</h2>
          <p className="text-sm text-slate-500">
            {bookings === undefined ? "Loading..." : `${bookings.length} booking${bookings.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button type="button" size="sm" onClick={() => onDayClick?.(today)}>
          + New Booking
        </Button>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-[#0c1222]/80 p-4">
        <div className="flex items-center justify-between mb-4">
          <Button type="button" variant="ghost" size="sm" onClick={prevMonth}>
            ← Prev
          </Button>
          <h3 className="text-sm font-medium text-slate-300">{monthLabel}</h3>
          <Button type="button" variant="ghost" size="sm" onClick={nextMonth}>
            Next →
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-px">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-center text-[11px] font-medium text-slate-500 uppercase">
              {d}
            </div>
          ))}

          {days.map((day, i) => {
            const dateStr = toISODate(day);
            const isCurrentMonth = day.getMonth() === month;
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const dayBookings = bookingsByDate.get(dateStr) ?? [];

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDayClick(dateStr)}
                className={cn(
                  "relative flex h-24 flex-col items-start p-1.5 text-left transition-colors rounded-md",
                  isCurrentMonth ? "text-slate-300" : "text-slate-700",
                  "hover:bg-white/[0.03]",
                  isSelected && "bg-seridian-500/10 ring-1 ring-seridian-500/30",
                  !isCurrentMonth && "opacity-40"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday && "bg-seridian-500 text-white font-medium",
                    !isToday && "font-medium"
                  )}
                >
                  {day.getDate()}
                </span>
                <div className="mt-1 flex flex-1 flex-col gap-0.5 overflow-hidden w-full">
                  {dayBookings.slice(0, 3).map((b) => {
                    const colors = typeColors[b.type];
                    return (
                      <div
                        key={b._id}
                        className={cn(
                          "flex items-center gap-1 rounded border px-1 py-0.5",
                          colors.bg
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookingClick?.(b._id);
                        }}
                      >
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", colors.dot)} />
                        <span className={cn("truncate text-[10px] font-medium", colors.text)}>
                          {formatTime(b.startTime)}
                        </span>
                      </div>
                    );
                  })}
                  {dayBookings.length > 3 && (
                    <span className="text-[10px] text-slate-500 pl-1">
                      +{dayBookings.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="rounded-lg border border-white/[0.06] bg-[#0c1222]/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-300">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h4>
            <Button type="button" variant="ghost" size="sm" onClick={() => onDayClick?.(selectedDate)}>
              + Add
            </Button>
          </div>
          {selectedBookings.length === 0 ? (
            <p className="text-xs text-slate-600">No bookings on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedBookings.map((b) => {
                const colors = typeColors[b.type];
                const clientName = b.clientId ? clientMap.get(b.clientId) : undefined;
                return (
                  <div
                    key={b._id}
                    onClick={() => onBookingClick?.(b._id)}
                    className={cn(
                      "cursor-pointer rounded-lg border p-3 transition-colors",
                      colors.bg,
                      "hover:brightness-110"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", colors.dot)} />
                      <span className={cn("text-sm font-medium", colors.text)}>
                        {b.title}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                      <span>
                        {formatTime(b.startTime)} — {formatTime(b.endTime)}
                      </span>
                      {clientName && <span>· {clientName}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
