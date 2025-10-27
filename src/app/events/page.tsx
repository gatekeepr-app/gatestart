"use client";

import GSButton from "@/components/layout/GSButton";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import { eventInt } from "../../../types/events";
import EventCard from "@/components/layout/EventCard";

export default function Events() {
  const { profile, loading } = useAuthProfile();
  const [events, setEvents] = useState<eventInt[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (loading) return;
    if (!profile?.organizerRef) {
      setEvents([]);
      return;
    }

    const fetchData = async () => {
      setErr(null);

      // If orgarr is an ARRAY or JSONB array of organizer uuids:
      const { data } = await supabase
        .from("Events")
        .select("*")
        .contains("orgarr", [profile.organizerRef])
        .eq("status", true)
        .order("created_at", { ascending: true }); // ✅ membership in array column

      // Fallback: if orgarr isn't an array but a single FK like organizerRef
      // if (error) {
      //   console.warn("[Events] contains() failed; trying eq()", error.message);
      //   const alt = await supabase
      //     .from("Events")
      //     .select("*")
      //     .eq("organizerRef", profile.organizerRef);
      //   data = alt.data ?? [];
      //   if (alt.error) {
      //     setErr(alt.error.message);
      //   }
      // }

      setEvents((data as eventInt[]) || []);
    };

    void fetchData();
  }, [loading, profile?.organizerRef, supabase]);

  if (loading) {
    return <div className="px-[var(--container-x)] py-6">Loading...</div>;
  }

  return (
    <div className=" flex flex-col items-start gap-4 px-0 py-6">
      <h1 className="text-[36px] leading-[1.15] font-semibold text-[var(--text)] tracking-tight">
        Welcome to the Events Page
      </h1>

      {err && (
        <div className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {err}
        </div>
      )}

      <p className="text-[14px] text-[var(--muted-text)]">
        This is the main landing page of the application.
      </p>

      <div className="flex flex-wrap gap-3 pt-1">
        <GSButton text="Get Started" href="/get-started" variant="primary" />
        <GSButton text="Learn More" href="/learn-more" variant="ghost" />
        <GSButton text="Contact Us" href="/contact" variant="black" />
      </div>

      {/* Simple list preview */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 xl:grid-cols-3 gap-4 w-full">
        {events.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--chip)] px-3 py-2 text-[var(--muted-text)]">
            No events found for your organizer.
          </div>
        ) : (
          events.map((ev) => <EventCard key={ev.id} event={ev} />)
        )}
      </div>
    </div>
  );
}
