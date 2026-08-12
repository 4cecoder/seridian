"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import {
  Button,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@bytecats/ui-kit";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Code,
  Eye,
  Clock,
  User,
  MapPin,
  Link2,
  FileText,
  Trash2,
  Edit3,
  ExternalLink,
  Filter,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingForm } from "./BookingForm";
import Link from "next/link";

type Booking = Doc<"bookings">;
type Client = Doc<"clients">;

export const TYPE_CONFIG = {
  consultation: {
    label: "Consultation",
    bg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    dot: "bg-cyan-400",
    border: "border-l-cyan-400",
    icon: Video,
  },
  development: {
    label: "Development",
    bg: "bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    dot: "bg-purple-400",
    border: "border-l-purple-400",
    icon: Code,
  },
  review: {
    label: "Review",
    bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-400",
    border: "border-l-emerald-400",
    icon: Eye,
  },
} as const;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM (20:00)

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso.slice(11, 16);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDurationMinutes(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (isNaN(start) || isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / (1000 * 60)));
}

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

function getWeekDates(currentDate: Date): Date[] {
  const date = new Date(currentDate);
  const dayOfWeek = date.getDay();
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMon);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

interface BookingCalendarProps {
  onDayClick?: (date: string) => void;
  onBookingClick?: (bookingId: Id<"bookings">) => void;
}

export function BookingCalendar({ onDayClick, onBookingClick }: BookingCalendarProps) {
  const todayDate = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(todayDate);
  const [view, setView] = useState<"month" | "week">("month");
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [formDate, setFormDate] = useState<string | undefined>();
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  const bookings = useQuery(api.bookings.list, {});
  const clients = useQuery(api.clients.list, {});
  const removeBooking = useMutation(api.bookings.remove);

  const clientMap = useMemo(() => {
    const map = new Map<string, Client>();
    if (clients) {
      for (const c of clients) {
        map.set(c._id, c);
      }
    }
    return map;
  }, [clients]);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b) => {
      if (selectedClientId !== "all" && b.clientId !== selectedClientId) return false;
      if (selectedType !== "all" && b.type !== selectedType) return false;
      return true;
    });
  }, [bookings, selectedClientId, selectedType]);

  // Counts by type
  const stats = useMemo(() => {
    const total = filteredBookings.length;
    let consultation = 0;
    let development = 0;
    let review = 0;
    for (const b of filteredBookings) {
      if (b.type === "consultation") consultation++;
      else if (b.type === "development") development++;
      else if (b.type === "review") review++;
    }
    return { total, consultation, development, review };
  }, [filteredBookings]);

  // Bookings mapped by date string (YYYY-MM-DD)
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of filteredBookings) {
      const dateKey = b.startTime.slice(0, 10);
      const list = map.get(dateKey) ?? [];
      list.push(b);
      map.set(dateKey, list);
    }
    // Sort bookings in each date by start time
    for (const list of map.values()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [filteredBookings]);

  const todayStr = toISODate(todayDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthDays = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const weekDays = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // Navigation handlers
  function handlePrev() {
    if (view === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(currentDate.getDate() - 7);
      setCurrentDate(prevWeek);
    }
  }

  function handleNext() {
    if (view === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextWeek);
    }
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  function handleOpenCreate(dateStr?: string) {
    setEditingBooking(null);
    setFormDate(dateStr || todayStr);
    setFormOpen(true);
    onDayClick?.(dateStr || todayStr);
  }

  function handleOpenDetail(booking: Booking) {
    setDetailBooking(booking);
    onBookingClick?.(booking._id);
  }

  function handleEditFromDetail(booking: Booking) {
    setDetailBooking(null);
    setEditingBooking(booking);
    setFormOpen(true);
  }

  async function handleDeleteBooking(bookingId: Id<"bookings">) {
    await removeBooking({ bookingId });
    setDetailBooking(null);
  }

  // Header range label
  const dateRangeLabel = useMemo(() => {
    if (view === "month") {
      return currentDate.toLocaleString("en-US", { month: "long", year: "numeric" });
    } else {
      const start = weekDays[0];
      const end = weekDays[6];
      const startMonth = start.toLocaleString("en-US", { month: "short" });
      const endMonth = end.toLocaleString("en-US", { month: "short" });
      if (startMonth === endMonth) {
        return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
      }
      return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
    }
  }, [view, currentDate, weekDays]);

  return (
    <div className="space-y-4 font-sans text-slate-200">
      {/* Top Workspace Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white tracking-tight">Bookings & Schedule</h1>
            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-0.5">
              Enterprise
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Unified calendar workspace for client scheduling & meeting management.
          </p>
        </div>

        {/* Stats Pill Breakdown */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-slate-300">
            <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-white">{stats.total}</span>
            <span className="text-[11px] text-slate-400">Total</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="font-semibold text-white">{stats.consultation}</span>
            <span className="text-[11px] text-cyan-300/80">Consultation</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-purple-300">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            <span className="font-semibold text-white">{stats.development}</span>
            <span className="text-[11px] text-purple-300/80">Development</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-white">{stats.review}</span>
            <span className="text-[11px] text-emerald-300/80">Review</span>
          </div>
        </div>
      </div>

      {/* Control & Filter Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-[#0c1222]/90 p-3 rounded-xl border border-white/[0.06]">
        {/* Navigation & Range Header */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-white/10"
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToday}
              className="h-7 px-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10"
            >
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-white/10"
              title="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-sm font-semibold text-white px-2 tracking-tight">
            {dateRangeLabel}
          </h2>
        </div>

        {/* Filters, View Toggle & Action Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Client Filter */}
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="h-8 w-[140px] text-xs bg-white/[0.03] border-white/10 text-slate-200">
              <div className="flex items-center gap-1.5 truncate">
                <User className="h-3 w-3 text-slate-400 shrink-0" />
                <SelectValue placeholder="All Clients" />
              </div>
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#0f172a] text-white">
              <SelectItem value="all" className="text-xs">
                All Clients
              </SelectItem>
              {clients?.map((c) => (
                <SelectItem key={c._id} value={c._id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="h-8 w-[130px] text-xs bg-white/[0.03] border-white/10 text-slate-200">
              <div className="flex items-center gap-1.5 truncate">
                <Filter className="h-3 w-3 text-slate-400 shrink-0" />
                <SelectValue placeholder="All Types" />
              </div>
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#0f172a] text-white">
              <SelectItem value="all" className="text-xs">
                All Types
              </SelectItem>
              <SelectItem value="consultation" className="text-xs text-cyan-400">
                Consultation
              </SelectItem>
              <SelectItem value="development" className="text-xs text-purple-400">
                Development
              </SelectItem>
              <SelectItem value="review" className="text-xs text-emerald-400">
                Review
              </SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle (Month / Week) */}
          <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
            <button
              type="button"
              onClick={() => setView("month")}
              className={cn(
                "h-7 px-3 rounded-md text-xs font-medium transition-all",
                view === "month"
                  ? "bg-cyan-600/90 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setView("week")}
              className={cn(
                "h-7 px-3 rounded-md text-xs font-medium transition-all",
                view === "week"
                  ? "bg-cyan-600/90 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Week
            </button>
          </div>

          {/* Quick Create Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => handleOpenCreate()}
            className="h-8 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium px-3 gap-1 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Quick Booking</span>
          </Button>
        </div>
      </div>

      {/* Main Workspace Calendar View */}
      {view === "month" ? (
        /* MONTHLY VIEW GRID */
        <div className="rounded-xl border border-white/[0.06] bg-[#0c1222]/90 overflow-hidden shadow-xl">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 border-b border-white/[0.06] bg-white/[0.02]">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-r border-white/[0.04] last:border-r-0"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-white/[0.04] bg-[#0c1222]">
            {monthDays.map((day, i) => {
              const dateStr = toISODate(day);
              const isCurrentMonth = day.getMonth() === month;
              const isToday = dateStr === todayStr;
              const dayBookings = bookingsByDate.get(dateStr) ?? [];

              return (
                <div
                  key={i}
                  className={cn(
                    "group relative min-h-[110px] p-1.5 transition-colors text-left flex flex-col justify-between",
                    isCurrentMonth ? "bg-transparent text-slate-200" : "bg-white/[0.01] text-slate-600",
                    "hover:bg-white/[0.02]"
                  )}
                >
                  {/* Top Bar of Cell */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all",
                        isToday
                          ? "bg-cyan-500 text-white font-bold ring-2 ring-cyan-400/40 shadow-sm"
                          : isCurrentMonth
                          ? "text-slate-300 font-semibold"
                          : "text-slate-600"
                      )}
                    >
                      {day.getDate()}
                    </span>

                    {/* Hover '+' Quick Add Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenCreate(dateStr)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded bg-white/10 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-400"
                      title={`Schedule on ${dateStr}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Booking Chips Container */}
                  <div className="mt-1 flex-1 flex flex-col gap-1 overflow-hidden">
                    {dayBookings.slice(0, 3).map((b) => {
                      const cfg = TYPE_CONFIG[b.type];
                      const client = clientMap.get(b.clientId);
                      const Icon = cfg.icon;

                      return (
                        <div
                          key={b._id}
                          onClick={() => handleOpenDetail(b)}
                          className={cn(
                            "cursor-pointer flex items-center justify-between rounded px-1.5 py-0.5 border text-[11px] transition-all truncate",
                            cfg.bg,
                            "hover:scale-[1.01] hover:brightness-125"
                          )}
                          title={`${b.title} (${formatTime(b.startTime)})`}
                        >
                          <div className="flex items-center gap-1 min-w-0 truncate">
                            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
                            <span className="font-semibold text-white truncate max-w-[80px]">
                              {b.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400">
                            <span>{formatTime(b.startTime)}</span>
                          </div>
                        </div>
                      );
                    })}

                    {dayBookings.length > 3 && (
                      <button
                        type="button"
                        onClick={() => handleOpenCreate(dateStr)}
                        className="text-[10px] font-medium text-cyan-400 hover:underline pl-1 text-left"
                      >
                        +{dayBookings.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* WEEKLY VIEW GRID */
        <div className="rounded-xl border border-white/[0.06] bg-[#0c1222]/90 overflow-hidden shadow-xl">
          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 border-b border-white/[0.06] bg-white/[0.02]">
            {weekDays.map((d, idx) => {
              const dateStr = toISODate(d);
              const isToday = dateStr === todayStr;
              const count = (bookingsByDate.get(dateStr) ?? []).length;

              return (
                <div
                  key={idx}
                  className={cn(
                    "p-3 text-center border-r border-white/[0.04] last:border-r-0 flex flex-col items-center justify-center gap-1",
                    isToday && "bg-cyan-500/5"
                  )}
                >
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {WEEKDAYS[idx]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                        isToday
                          ? "bg-cyan-500 text-white ring-2 ring-cyan-400/40"
                          : "text-white"
                      )}
                    >
                      {d.getDate()}
                    </span>
                    {count > 0 && (
                      <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0">
                        {count}
                      </Badge>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenCreate(dateStr)}
                    className="mt-1 flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-cyan-300"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Week Day Schedule Cards Grid */}
          <div className="grid grid-cols-7 divide-x divide-white/[0.04] bg-[#0c1222] min-h-[450px]">
            {weekDays.map((d, idx) => {
              const dateStr = toISODate(d);
              const dayBookings = bookingsByDate.get(dateStr) ?? [];

              return (
                <div key={idx} className="p-2 space-y-2 flex flex-col justify-start">
                  {dayBookings.length === 0 ? (
                    <div
                      onClick={() => handleOpenCreate(dateStr)}
                      className="cursor-pointer group flex flex-col items-center justify-center h-32 rounded-lg border border-dashed border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-slate-600 hover:text-cyan-400"
                    >
                      <Plus className="h-4 w-4 mb-1 opacity-40 group-hover:opacity-100" />
                      <span className="text-[10px]">No meetings</span>
                    </div>
                  ) : (
                    dayBookings.map((b) => {
                      const cfg = TYPE_CONFIG[b.type];
                      const client = clientMap.get(b.clientId);
                      const duration = getDurationMinutes(b.startTime, b.endTime);

                      return (
                        <div
                          key={b._id}
                          onClick={() => handleOpenDetail(b)}
                          className={cn(
                            "cursor-pointer rounded-lg border p-2.5 transition-all shadow-sm flex flex-col gap-1.5",
                            cfg.bg,
                            "hover:brightness-125 hover:scale-[1.02]"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />
                              <span className="font-bold text-xs text-white truncate">
                                {b.title}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-300">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>
                                {formatTime(b.startTime)} - {formatTime(b.endTime)}
                              </span>
                            </div>
                            {duration > 0 && (
                              <span className="text-[9px] text-slate-400">({duration}m)</span>
                            )}
                          </div>

                          {client && (
                            <div className="flex items-center gap-1 text-[10px] text-cyan-300/90 font-medium truncate pt-1 border-t border-white/10">
                              <User className="h-3 w-3 shrink-0 text-slate-400" />
                              <span className="truncate">{client.name}</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE / EDIT BOOKING DIALOG */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg border-white/10 bg-[#0c1222] text-white">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-white flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-cyan-400" />
              <span>{editingBooking ? "Edit Booking" : "New Booking"}</span>
            </DialogTitle>
          </DialogHeader>
          <BookingForm
            booking={editingBooking || undefined}
            defaultDate={formDate}
            onSuccess={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* BOOKING DETAIL DIALOG */}
      <Dialog open={!!detailBooking} onOpenChange={(open) => !open && setDetailBooking(null)}>
        {detailBooking && (
          <DialogContent className="max-w-md border-white/10 bg-[#0c1222] text-white p-5 space-y-4">
            {/* Header Badge & Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2.5 py-0.5 font-medium flex items-center gap-1.5",
                    TYPE_CONFIG[detailBooking.type].badgeBg
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", TYPE_CONFIG[detailBooking.type].dot)} />
                  <span>{TYPE_CONFIG[detailBooking.type].label}</span>
                </Badge>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditFromDetail(detailBooking)}
                    className="h-7 px-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 gap-1"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBooking(detailBooking._id)}
                    className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white tracking-tight">
                {detailBooking.title}
              </h3>
            </div>

            {/* Linked Client Section */}
            {(() => {
              const client = clientMap.get(detailBooking.clientId);
              if (!client) return null;
              return (
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-xs">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{client.name}</div>
                      <div className="text-[11px] text-slate-400">{client.company}</div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/clients?selected=${client._id}`}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline font-medium"
                  >
                    <span>Dossier</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              );
            })()}

            {/* Time & Duration */}
            <div className="space-y-1.5 text-xs text-slate-300 bg-white/[0.02] p-3 rounded-lg border border-white/[0.06]">
              <div className="flex items-center gap-2 font-medium text-white">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span>{formatFullDate(detailBooking.startTime)}</span>
              </div>
              <div className="pl-6 text-slate-400 text-xs flex items-center justify-between">
                <span>
                  {formatTime(detailBooking.startTime)} – {formatTime(detailBooking.endTime)}
                </span>
                <span className="text-[11px] text-cyan-300">
                  {getDurationMinutes(detailBooking.startTime, detailBooking.endTime)} min
                </span>
              </div>
            </div>

            {/* Location & Meeting Link */}
            {(detailBooking.location || detailBooking.meetingUrl) && (
              <div className="space-y-2 text-xs">
                {detailBooking.location && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{detailBooking.location}</span>
                  </div>
                )}

                {detailBooking.meetingUrl && (
                  <a
                    href={detailBooking.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-3 transition-colors shadow-sm text-xs"
                  >
                    <Video className="h-4 w-4" />
                    <span>Join Video Call</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                  </a>
                )}
              </div>
            )}

            {/* Agenda / Notes */}
            {detailBooking.notes && (
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-400 text-[11px] uppercase tracking-wider">
                  <FileText className="h-3 w-3" />
                  <span>Notes</span>
                </div>
                <p className="text-slate-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06] whitespace-pre-wrap leading-relaxed">
                  {detailBooking.notes}
                </p>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
