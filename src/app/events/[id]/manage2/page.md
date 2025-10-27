"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Icons
import {
  CalendarClock,
  MapPin,
  Eye,
  Pencil,
  QrCode,
  Mail,
  CircleSlash2,
  CheckCircle2,
} from "lucide-react";

// types
import { eventInt } from "../../../../../types/events";
import { TicketInt } from "../../../../../types/ticki";

// Optional (if you have it, as in your previous code)
import { QRCodeDialog } from "@/components/ui/qr-code-dialog";
import ConnectSheet from "@/components/features/ConnectSheet";
import { useAuthProfile } from "@/hooks/useAuthProfile";

export default function ManageEventPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuthProfile();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<eventInt | null>(null);
  const [tickets, setTickets] = useState<TicketInt[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");

  // derived
  const filtered = useMemo(() => {
    if (!q.trim()) return tickets;
    const k = q.toLowerCase();
    return tickets.filter((t: any) => {
      const name = (t.full_name ?? t.name ?? "").toLowerCase();
      const email = (t.email ?? "").toLowerCase();
      const phone = (t.contact ?? t.phone ?? "").toLowerCase();
      return name.includes(k) || email.includes(k) || phone.includes(k);
    });
  }, [q, tickets]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        // Event
        const { data: ev, error: e1 } = await supabase
          .from("Events")
          .select("*")
          .eq("id", params.id)
          .single();
        if (e1) throw e1;
        setEvent(ev as eventInt);

        // Tickets for this event
        const { data: tks, error: e2 } = await supabase
          .from("ticki")
          .select("*")
          .eq("eventid", ev.eventuuid)
          .order("created_at", { ascending: false });
        if (e2) throw e2;
        setTickets((tks ?? []) as TicketInt[]);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params.id, supabase]);

  const toggleAccepting = async () => {
    if (!event) return;
    const next = !((event as any).accepting ?? false);
    try {
      setLoading(true);
      const { error: upErr } = await supabase
        .from("Events")
        .update({ accepting: next })
        .eq("id", event.id);
      if (upErr) throw upErr;
      setEvent({ ...event, accepting: next } as any);
    } catch (e: any) {
      setError(e?.message ?? "Failed to update accepting");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 py-6">
        <div className="h-4 w-44 bg-[var(--chip)] rounded-md border border-[var(--border)] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] h-44 animate-pulse" />
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] h-44 animate-pulse" />
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] h-44 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-red-200 bg-red-50 text-red-700 px-4 py-3">
        {error ?? "Event not found."}
      </div>
    );
  }

  const from = event.date_range?.from ? new Date(event.date_range.from) : null;

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header / Cover with compact info bar */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="relative h-40 sm:h-56">
          {event.image ? (
            <Image
              src={event.image}
              alt={event.name ?? "Event cover"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 90vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-[var(--accent)]/25 to-black/10" />
          )}

          <div className="absolute left-4 right-4 -bottom-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]/92 backdrop-blur px-3 py-2 shadow-[var(--shadow-sm)]">
              <div className="flex items-center gap-3 min-w-0">
                <h1 className="text-[16px] sm:text-[18px] font-semibold text-[var(--text)] truncate">
                  {event.name ?? "Untitled event"}
                </h1>
                <Separator
                  orientation="vertical"
                  className="h-5 bg-[var(--border)] hidden sm:block"
                />
                <div className="hidden sm:flex items-center gap-2 text-[12px] text-[var(--muted-text)]">
                  <CalendarClock className="size-4" />
                  {from
                    ? from.toLocaleString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Date TBA"}
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[12px] text-[var(--muted-text)]">
                  <MapPin className="size-4" />
                  <span className="truncate">
                    {event.place?.title ||
                      event.place?.details ||
                      "Location TBA"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/events/${event.id}`} aria-label="View">
                  <Button
                    variant="ghost"
                    className="h-9 rounded-[var(--radius-pill)] px-4 border border-[var(--border)] bg-[var(--surface)] hover:shadow-[var(--shadow-sm)]"
                  >
                    <Eye className="size-4 mr-2" /> View
                  </Button>
                </Link>
                <Link href={`/events/${event.id}/edit`} aria-label="Edit">
                  <Button className="h-9 rounded-[var(--radius-pill)] px-4 bg-[var(--surface-alt)] text-white border border-black/10 hover:opacity-95">
                    <Pencil className="size-4 mr-2" /> Edit
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="h-6" />
      </section>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Quick actions + small metric */}
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          {/* Quick Actions */}
          <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold text-[var(--text)]">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
              <Button
                onClick={toggleAccepting}
                disabled={loading}
                className={[
                  "h-10 rounded-[var(--radius-pill)]",
                  (event as any).accepting
                    ? "bg-[var(--accent)] text-black border border-black/10 hover:opacity-95"
                    : "bg-red-500 text-white hover:bg-red-600",
                ].join(" ")}
              >
                {(event as any).accepting ? (
                  <>
                    <CheckCircle2 className="size-4 mr-2" /> Accepting
                  </>
                ) : (
                  <>
                    <CircleSlash2 className="size-4 mr-2" /> Not Accepting
                  </>
                )}
              </Button>

              <Link href={`/events/${event.id}/mail`} className="w-full">
                <Button
                  variant="ghost"
                  className="w-full h-10 rounded-[var(--radius-pill)] border border-[var(--border)]"
                >
                  <Mail className="size-4 mr-2" /> Send Mail
                </Button>
              </Link>

              <Link
                href={`/events/${event.id}`}
                target="_blank"
                className="w-full"
              >
                <Button
                  variant="ghost"
                  className="w-full h-10 rounded-[var(--radius-pill)] border border-[var(--border)]"
                >
                  <Eye className="size-4 mr-2" /> Preview Form Page
                </Button>
              </Link>

              {/* QR dialog (only if present in your project) */}
              {QRCodeDialog ? (
                <div className="w-full">
                  <QRCodeDialog
                    eventSlug={event.slug}
                  />
                </div>
              ) : (
                <Button
                  className="h-10 rounded-[var(--radius-pill)] bg-[var(--surface-alt)] text-white border border-black/10 hover:opacity-95"
                  onClick={() => alert("Add QRCodeDialog to enable this")}
                >
                  <QrCode className="size-4 mr-2" /> Generate QR
                </Button>
              )}
            </div>
          </section>

          {/* Metric card */}
          <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--chip)] p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center w-10 h-10 rounded-[var(--radius-pill)] bg-white border border-[var(--border)] shadow-[var(--shadow-sm)]">
                {/* ticket icon glyph */}
                <span className="text-sm font-semibold">🎟️</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--text)]">
                  {tickets.length} Forms
                </div>
                <div className="text-xs text-[var(--muted-text)]">
                  Scheduled till now
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Registrations table */}
        <section className="lg:col-span-2 order-1 lg:order-2">
            <div className="flex items-center gap-2">
              <ConnectSheet
                setEvent={setEvent}
                id={event.eventuuid}
                event={event}
                tickets={tickets}
                user={user}
              />
            </div>
        </section>
      </div>
    </div>
  );
}
