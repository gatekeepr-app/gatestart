"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarClock, MapPin, Eye, Pencil, Settings } from "lucide-react";
import { eventInt } from "../../../types/events";
import RichTextEditor from "../richtext-editor";

export default function EventCard({
  event,
  className,
}: {
  event: eventInt;
  className?: string;
}) {
  const id = event.id;
  const hrefBase = `/events/${id}`;
  const cover = event.image || null;
  const from = event.date_range?.from ? new Date(event.date_range.from) : null;

  const dateBadge = from
    ? {
        day: String(from.getDate()).padStart(2, "0"),
        mon: from.toLocaleString(undefined, { month: "short" }),
      }
    : null;

  return (
    <article
      className={[
        "group relative overflow-hidden",
        "rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]",
        "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow",
        className || "",
      ].join(" ")}
    >
      {/* Media */}
      <div className="relative h-36 sm:h-40">
        {cover ? (
          <Image
            src={cover}
            alt={event.name ?? "Event cover"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-black/10 via-[var(--accent)]/25 to-black/10"
          />
        )}

        {/* Status tag */}
        <div className="absolute right-3 top-3 text-[11px] font-medium text-white/95">
          {event.status ? (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-black/50 backdrop-blur border border-white/10">
              Published
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-black/40 backdrop-blur border border-white/10">
              Draft
            </span>
          )}
        </div>

        {/* Blurred action pill (inside media) */}
        <div className="absolute left-3 right-3 bottom-2">
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-[18px] sm:rounded-[20px] bg-blue-800/32 border border-[var(--border)] shadow-[var(--shadow-sm)] backdrop-blur">
            <h1 className="font-medium pl-3 text-white">Actions</h1>
            <div className="flex items-center gap-2">
              {/* Manage (accent) */}
              <Link
                href={`${hrefBase}/manage`}
                aria-label="Manage event"
                className="text-white bg-white/0 transition ease-in-out rounded-md hover:bg-white/100 hover:text-black p-2"
              >
                <Settings className="size-4" />
              </Link>

              {/* Edit (black pill) */}
              <Link
                href={`${hrefBase}/edit`}
                aria-label="Edit event"
                className="text-white bg-white/0 transition ease-in-out rounded-md hover:bg-white/100 hover:text-black p-2"
              >
                <Pencil className="size-4" />
              </Link>

              {/* View (ghost) */}
              <Link
                href={hrefBase}
                aria-label="View event"
                className="text-white bg-white/0 transition ease-in-out rounded-md hover:bg-white/100 hover:text-black p-2"
              >
                <Eye className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] sm:text-[16px] font-semibold text-[var(--text)] truncate">
              {event.name ?? "Untitled event"}
            </h3>
            {event.details ? (
              <RichTextEditor editable={false} content={event.details} />
            ) : null}
          </div>

          {/* Date badge */}
          {dateBadge && (
            <div className="flex-shrink-0 text-right leading-tight">
              <div className="text-[18px] sm:text-[20px] font-semibold text-[var(--text)]">
                {dateBadge.day}
              </div>
              <div className="text-[11px] text-[var(--muted-text)] uppercase">
                {dateBadge.mon}
              </div>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-col md:flex-row gap-2 justify-between text-[12px]">
          <div className="inline-flex items-center gap-2 text-[var(--muted-text)]">
            <CalendarClock className="size-4" />
            <span>
              {from
                ? from.toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Date TBA"}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 text-[var(--muted-text)]">
            <MapPin className="size-4" />
            <span className="truncate max-w-24">
              {event.place?.title || event.place?.details || "Location TBA"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
