"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@bytecats/ui-kit";
import { cn } from "@/lib/utils";

type Booking = Doc<"bookings">;

interface BookingFormProps {
  booking?: Booking;
  defaultDate?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormErrors {
  title?: string;
  clientId?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function fromDatetimeLocal(val: string): string {
  return new Date(val).toISOString();
}

export function BookingForm({ booking, defaultDate, onSuccess, onCancel }: BookingFormProps) {
  const createBooking = useMutation(api.bookings.create);
  const updateBooking = useMutation(api.bookings.update);
  const clients = useQuery(api.clients.list, {});

  const defaultStart = defaultDate
    ? `${defaultDate}T09:00`
    : booking?.startTime
      ? toDatetimeLocal(booking.startTime)
      : "";
  const defaultEnd = defaultDate
    ? `${defaultDate}T10:00`
    : booking?.endTime
      ? toDatetimeLocal(booking.endTime)
      : "";

  const [title, setTitle] = useState(booking?.title ?? "");
  const [clientId, setClientId] = useState<string>(booking?.clientId ?? "");
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [type, setType] = useState<Booking["type"]>(booking?.type ?? "consultation");
  const [notes, setNotes] = useState(booking?.notes ?? "");
  const [location, setLocation] = useState(booking?.location ?? "");
  const [meetingUrl, setMeetingUrl] = useState(booking?.meetingUrl ?? "");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!title.trim()) next.title = "Title is required";
    if (!clientId) next.clientId = "Client is required";
    if (!startTime) next.startTime = "Start time is required";
    if (!endTime) next.endTime = "End time is required";
    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      next.endTime = "End time must be after start time";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        clientId: clientId as Id<"clients">,
        startTime: fromDatetimeLocal(startTime),
        endTime: fromDatetimeLocal(endTime),
        type,
        notes: notes.trim() || undefined,
        location: location.trim() || undefined,
        meetingUrl: meetingUrl.trim() || undefined,
      };

      if (booking) {
        await updateBooking({ bookingId: booking._id, ...payload });
      } else {
        await createBooking(payload);
      }
      onSuccess?.();
    } catch {
      setErrors({ title: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="booking-title" className="text-xs text-slate-400">
            Title *
          </Label>
          <Input
            id="booking-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Client consultation"
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20",
              errors.title && "border-red-500/40"
            )}
          />
          {errors.title && (
            <p className="text-[11px] text-red-400">{errors.title}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-client" className="text-xs text-slate-400">
            Client *
          </Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger
              className={cn(
                "bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20",
                errors.clientId && "border-red-500/40"
              )}
            >
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent className="bg-[#0c1222] border-white/[0.08]">
              {clients === undefined ? (
                <SelectItem value="__loading" disabled>Loading...</SelectItem>
              ) : clients.length === 0 ? (
                <SelectItem value="__empty" disabled>No clients</SelectItem>
              ) : (
                clients.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.clientId && (
            <p className="text-[11px] text-red-400">{errors.clientId}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-type" className="text-xs text-slate-400">
            Type *
          </Label>
          <Select value={type} onValueChange={(v) => setType(v as Booking["type"])}>
            <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-slate-200 focus:border-seridian-500/40 focus:ring-seridian-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0c1222] border-white/[0.08]">
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="review">Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-start" className="text-xs text-slate-400">
            Start *
          </Label>
          <Input
            id="booking-start"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20",
              errors.startTime && "border-red-500/40"
            )}
          />
          {errors.startTime && (
            <p className="text-[11px] text-red-400">{errors.startTime}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-end" className="text-xs text-slate-400">
            End *
          </Label>
          <Input
            id="booking-end"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={cn(
              "bg-white/[0.03] border-white/[0.08] text-slate-200",
              "focus:border-seridian-500/40 focus:ring-seridian-500/20",
              errors.endTime && "border-red-500/40"
            )}
          />
          {errors.endTime && (
            <p className="text-[11px] text-red-400">{errors.endTime}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-location" className="text-xs text-slate-400">
            Location
          </Label>
          <Input
            id="booking-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Office, client site..."
            className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-meeting" className="text-xs text-slate-400">
            Meeting URL
          </Label>
          <Input
            id="booking-meeting"
            type="url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="booking-notes" className="text-xs text-slate-400">
          Notes
        </Label>
        <Textarea
          id="booking-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Agenda, preparation notes..."
          rows={3}
          className="bg-white/[0.03] border-white/[0.08] text-slate-200 placeholder:text-slate-600 focus:border-seridian-500/40 focus:ring-seridian-500/20 resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : booking ? "Update Booking" : "Create Booking"}
        </Button>
      </div>
    </form>
  );
}
