// app/(your)/events/[id]/manage/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { eventInt } from "../../../../../types/events";
import { TicketInt } from "../../../../../types/ticki";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { Loader2, Search, RefreshCcw } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TicketsTable from "@/components/features/TicketsTable";

export default function EventManage() {
  const params = useParams<{ id: string }>();
  const eventId = typeof params?.id === "string" ? params.id : "";
  const { user } = useAuthProfile();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<eventInt | null>(null);
  const [tickets, setTickets] = useState<TicketInt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return tickets;
    const k = q.toLowerCase();
    return tickets.filter((t) => {
      const name = (t.formdata?.full_name ?? t.formdata?.name ?? "").toLowerCase();
      const email = (t.formdata?.email ?? "").toLowerCase();
      const phone = (t.formdata?.contact ?? t.formdata?.phone ?? "").toLowerCase();
      return name.includes(k) || email.includes(k) || phone.includes(k);
    });
  }, [q, tickets]);

  // Make isAlive optional so callers (like Reload button) don't have to pass it
  const fetchAll = async (id: string, isAlive: () => boolean = () => true) => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      // ----- Fetch Event -----
      // NOTE: Use the exact table name/casing you created. If your table is quoted "Events",
      // you must also use "Events" here; if it's unquoted, prefer lowercase snake_case.
      const { data: ev, error: e1 } = await supabase
        .from("Events")
        .select("*")
        .eq("id", id)
        .single();

      if (!isAlive()) return;
      if (e1) throw e1;

      const eventRow = ev as eventInt;
      setEvent(eventRow);

      // ----- Fetch Tickets -----
      const evUuid = eventRow?.eventuuid ?? null;
      if (!evUuid) {
        setTickets([]);
        return;
      }

      // Ensure ticki.eventid really stores the event UUID (not numeric event id).
      const { data: tks, error: e2 } = await supabase
        .from("ticki")
        .select("*")
        .eq("eventid", evUuid)
        .order("created_at", { ascending: false });

      if (!isAlive()) return;
      if (e2) throw e2;

      setTickets(((tks ?? []) as TicketInt[]) || []);
    } catch (err: unknown) {
      if (!isAlive()) return;

      let message = "Unknown error";
      if (axios.isAxiosError(err)) message = err.response?.data || err.message;
      else if (err instanceof Error) message = err.message;

      console.error(message);
      setError(message);
      toast("Failed to load event.");
    } finally {
      if (isAlive()) setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;
    const guard = () => alive;

    if (eventId) {
      fetchAll(eventId, guard);
    }

    return () => {
      alive = false;
    };
  }, [eventId]); // important: prevents repeated fetches every render

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">Manage Event</h1>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tickets (name, email, phone)…"
              className="rounded-full pl-9 focus-visible:ring-[#7DFF6A] focus-visible:ring-2"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => eventId && fetchAll(eventId)} // no isAlive needed
            className="rounded-full"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reload
          </Button>
        </div>
      </div>

      {/* Status */}
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {event && user && <TicketsTable event={event} user={user} tickets={tickets} />}

      {/* Event inspector */}
      <div className="rounded-xl border bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold">Event</div>
          <div className="text-xs text-muted-foreground">{event ? "Loaded" : "No data"}</div>
        </div>
        {/* Keep your ObjectInspector commented if desired */}
      </div>

      {/* Tickets inspector */}
      <div className="rounded-xl border bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-semibold">Tickets</div>
          <div className="text-xs text-muted-foreground">
            {filtered.length} / {tickets.length} shown
          </div>
        </div>
        {/* Keep your ObjectInspector commented if desired */}
      </div>
    </div>
  );
}
