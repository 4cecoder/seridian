"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import { Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from "@bytecats/ui-kit";
import { Clock, Video, Code, Eye, MapPin, Link2, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Booking = Doc<"bookings">;

interface BookingFormProps {
  booking?: Booking;
  defaultDate?: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

const MEETING_TYPES = [
  {
    id: "consultation",
    label: "Consultation",
    icon: Video,
    colorClass: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20",
    dot: "bg-cyan-400",
  },
  {
    id: "development",
    label: "Development",
    icon: Code,
    colorClass: "border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
    dot: "bg-purple-400",
  },
  {
    id: "review",
    label: "Review",
    icon: Eye,
    colorClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
    dot: "bg-emerald-400",
  },
] as const;

export function BookingForm({ booking, defaultDate, onSuccess, onCancel }: BookingFormProps) {
  const createBooking = useMutation(api.bookings.create);
  const updateBooking = useMutation(api.bookings.update);
  const clients = useQuery(api.clients.list, { status: "active" });

  const getDefaultStart = () => {
    if (booking?.startTime) return booking.startTime.slice(0, 16);
    if (!defaultDate) {
      const now = new Date();
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);
      const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
      return iso.slice(0, 16);
    }
    if (defaultDate.includes("T")) return defaultDate.slice(0, 16);
    return `${defaultDate}T09:00`;
  };

  const getDefaultEnd = () => {
    if (booking?.endTime) return booking.endTime.slice(0, 16);
    const startStr = getDefaultStart();
    const startDate = new Date(startStr);
    startDate.setHours(startDate.getHours() + 1);
    const iso = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000).toISOString();
    return iso.slice(0, 16);
  };

  const [title, setTitle] = useState(booking?.title ?? "");
  const [clientId, setClientId] = useState<string>(booking?.clientId ?? "");
  const [startTime, setStartTime] = useState(getDefaultStart());
  const [endTime, setEndTime] = useState(getDefaultEnd());
  const [type, setType] = useState<"consultation" | "development" | "review">(
    booking?.type ?? "consultation"
  );
  const [location, setLocation] = useState(booking?.location ?? "");
  const [meetingUrl, setMeetingUrl] = useState(booking?.meetingUrl ?? "");
  const [notes, setNotes] = useState(booking?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-select first client if none selected and list available
  useEffect(() => {
    if (!clientId && clients && clients.length > 0) {
      setClientId(clients[0]._id);
    }
  }, [clients, clientId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a meeting title.");
      return;
    }
    if (!clientId) {
      setError("Please select a client.");
      return;
    }
    if (!startTime || !endTime) {
      setError("Please specify both start and end times.");
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        clientId: clientId as Id<"clients">,
        startTime,
        endTime,
        type,
        location: location.trim() || undefined,
        meetingUrl: meetingUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (booking) {
        await updateBooking({ bookingId: booking._id, ...payload });
      } else {
        await createBooking(payload);
      }
      onSuccess();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to save booking");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-red-400">
          {error}
        </div>
      )}

      {/* Meeting Type Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Meeting Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {MEETING_TYPES.map((t) => {
            const Icon = t.icon;
            const isSelected = type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 transition-all text-xs font-medium",
                  t.colorClass,
                  isSelected
                    ? "ring-1 ring-white/30 font-semibold shadow-sm opacity-100"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full", t.dot)} />
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title & Client Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Architecture Review & Planning"
            className="h-9 bg-white/[0.03] border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-cyan-500/50"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Client Link</span>
            {clients && clients.length === 0 && (
              <span className="text-[10px] text-amber-400">No active clients</span>
            )}
          </label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="h-9 bg-white/[0.03] border-white/10 text-white text-xs focus:border-cyan-500/50">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#0f172a] text-white">
              {clients?.map((c) => (
                <SelectItem key={c._id} value={c._id} className="text-xs focus:bg-white/10">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-slate-400" />
                    <span className="font-medium text-slate-200">{c.name}</span>
                    <span className="text-[10px] text-slate-500">({c.company})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Start & End Times */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-cyan-400" />
            <span>Start Time</span>
          </label>
          <Input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="h-9 bg-white/[0.03] border-white/10 text-white text-xs focus:border-cyan-500/50 [color-scheme:dark]"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-purple-400" />
            <span>End Time</span>
          </label>
          <Input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="h-9 bg-white/[0.03] border-white/10 text-white text-xs focus:border-cyan-500/50 [color-scheme:dark]"
            required
          />
        </div>
      </div>

      {/* Location & Meeting Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-slate-400" />
            <span>Location / Platform</span>
          </label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Google Meet, Office HQ, Zoom"
            className="h-9 bg-white/[0.03] border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-cyan-500/50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Link2 className="h-3 w-3 text-slate-400" />
            <span>Meeting Link</span>
          </label>
          <Input
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="h-9 bg-white/[0.03] border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Agenda / Notes */}
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
          <FileText className="h-3 w-3 text-slate-400" />
          <span>Agenda / Notes</span>
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Key topics to discuss, deliverables, links..."
          rows={3}
          className="bg-white/[0.03] border-white/10 text-white text-xs placeholder:text-slate-600 focus:border-cyan-500/50 resize-none"
        />
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={saving}
            className="h-8 text-xs text-slate-400 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={saving}
          className="h-8 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 shadow-sm"
        >
          {saving ? "Saving..." : booking ? "Update Booking" : "Create Booking"}
        </Button>
      </div>
    </form>
  );
}
