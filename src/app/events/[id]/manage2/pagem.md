"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Icons
import {
  CalendarClock,
  MapPin,
  Eye,
  Pencil,
  Download,
  Users,
  Ticket as TicketIcon,
  DollarSign,
} from "lucide-react";

// Charts
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";
import { toast } from "sonner";
import axios from "axios";

// --- Types (adjust to your schema as needed) ---
type DateRange = { from: string; to?: string | null };
type Place = { title?: string | null; details?: string | null };
type EventRow = {
  id: string;
  name?: string | null;
  details?: string | null;
  image?: string | null;
  status?: boolean | null;
  date_range?: DateRange | null;
  place?: Place | null;
};

type SalesPoint = { day: string; value: number };

// --- Utils ---
const fmtCurrency = (n: number) =>
  n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

// --- Skeletons ---
function LineSkeleton() {
  return (
    <div className="h-4 w-44 bg-[var(--chip)] rounded-md border border-[var(--border)] animate-pulse" />
  );
}
function CardSkeleton() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] h-44 animate-pulse" />
  );
}

// --- KPI Card ---
function KPI({
  label,
  value,
  icon: Icon,
  tone = "light",
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  tone?: "light" | "dark";
}) {
  return (
    <section
      className={[
        "rounded-[var(--radius-xl)] p-5 h-[140px] border",
        tone === "dark"
          ? "bg-[var(--surface-alt)] text-white border-black/10"
          : "bg-[var(--surface)] text-[var(--text)] border-[var(--border)]",
      ].join(" ")}
      role="region"
      aria-label={label}
    >
      <div className="flex items-start justify-between">
        <h3
          className={
            tone === "dark"
              ? "text-white/90 text-sm font-semibold"
              : "text-sm font-semibold"
          }
        >
          {label}
        </h3>
        {Icon ? (
          <span
            className={[
              "grid place-items-center w-9 h-9 rounded-[var(--radius-pill)] border",
              tone === "dark"
                ? "bg-white/10 border-white/15"
                : "bg-[var(--accent-muted)] border-[var(--accent)]/40",
            ].join(" ")}
          >
            <Icon
              className={
                tone === "dark" ? "size-4 text-white" : "size-4 text-black"
              }
            />
          </span>
        ) : null}
      </div>
      <div className="mt-3 text-[28px] leading-none font-semibold tracking-tight">
        {value}
      </div>
      <p
        className={
          tone === "dark"
            ? "mt-2 text-xs text-white/80"
            : "mt-2 text-xs text-[var(--muted-text)]"
        }
      >
        Updated just now
      </p>
    </section>
  );
}

// --- Sales Area Chart ---
function SalesArea({ data }: { data: SalesPoint[] }) {
  return (
    <section className="rounded-[var(--radius-xl)] p-5 bg-[var(--surface)] border border-[var(--border)]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-[var(--text)]">
            7-day Sales
          </h2>
          <p className="text-[13px] -mt-0.5 text-[var(--muted-text)]">
            Revenue by day
          </p>
        </div>
        <span className="inline-flex items-center px-3 h-8 rounded-[var(--radius-pill)] bg-[var(--chip)] border border-[var(--border)] text-xs">
          Weekly
        </span>
      </div>
      <div className="mt-4 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#7A7A7A", fontSize: 12 }}
            />
            <RTooltip
              cursor={{ stroke: "rgba(0,0,0,0.1)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}
              formatter={(v: any) => [fmtCurrency(Number(v)), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0B0B0B"
              fill="url(#grad)"
              strokeWidth={2}
              dot={false}
            />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.7} />
                <stop
                  offset="100%"
                  stopColor="var(--accent)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

// --- Page ---
export default function ManageEventPage() {
  const params = useParams<{ id: string }>();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventRow | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // lightweight “fake” metrics until you wire real ones
  const [ticketsSold, setTicketsSold] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [visitors, setVisitors] = useState(0);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data, error } = await supabase
          .from("Events")
          .select("*")
          .eq("id", params.id)
          .single();
        if (error) throw error;
        setEvent(data as EventRow);

        // TODO: replace with real aggregations from your tables
        // Example mocks to keep the UI alive
        setTicketsSold(312);
        setRevenue(18400);
        setVisitors(1270);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(error.response?.data || error.message);
        } else if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("Unknown error:", error);
        }
        toast("Failed to send mail.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params.id, supabase]);

  const salesData: SalesPoint[] = useMemo(
    () => [
      { day: "Mon", value: 1200 },
      { day: "Tue", value: 1400 },
      { day: "Wed", value: 900 },
      { day: "Thu", value: 2400 },
      { day: "Fri", value: 2000 },
      { day: "Sat", value: 1700 },
      { day: "Sun", value: 1300 },
    ],
    []
  );

  if (loading) {
    return (
      <div className="space-y-6 py-6">
        <LineSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
    );
  }

  if (err || !event) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-red-200 bg-red-50 text-red-700 px-4 py-3">
        {err ?? "Event not found."}
      </div>
    );
  }

  const from = event.date_range?.from ? new Date(event.date_range.from) : null;

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Hero / Header */}
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

          {/* Status pill */}
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center gap-2 px-3 h-8 rounded-[var(--radius-pill)] bg-black/45 text-white border border-white/10 backdrop-blur text-xs">
              {event.status ? "Published" : "Draft"}
            </span>
          </div>

          {/* Action bar (blur pill) */}
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
                    className="h-9 rounded-[var(--radius-pill)] px-4 border border-[var(--border)] bg-[var(--surface)] hover:shadow-[var(--shadow-sm)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    <Eye className="size-4 mr-2" /> View
                  </Button>
                </Link>

                <Link href={`/events/${event.id}/edit`} aria-label="Edit">
                  <Button className="h-9 rounded-[var(--radius-pill)] px-4 bg-[var(--surface-alt)] text-white border border-black/10 hover:opacity-95 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
                    <Pencil className="size-4 mr-2" /> Edit
                  </Button>
                </Link>

                <Button
                  className="h-9 rounded-[var(--radius-pill)] px-4 bg-[var(--accent)] text-black border border-black/10 hover:opacity-95 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  onClick={() => {
                    // simple CSV export demo using currently loaded values
                    const rows = [
                      ["Metric", "Value"],
                      ["Revenue", String(revenue)],
                      ["Tickets Sold", String(ticketsSold)],
                      ["Visitors", String(visitors)],
                    ]
                      .map((r) =>
                        r
                          .map((x) => `"${String(x).replaceAll('"', '""')}"`)
                          .join(",")
                      )
                      .join("\n");
                    const blob = new Blob([rows], {
                      type: "text/csv;charset=utf-8;",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "event-metrics.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="size-4 mr-2" /> Export CSV
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer for the floating bar */}
        <div className="h-6" />
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPI
          label="Revenue"
          value={fmtCurrency(revenue)}
          icon={DollarSign}
          tone="dark"
        />
        <KPI label="Tickets sold" value={`${ticketsSold}`} icon={TicketIcon} />
        <KPI label="Visitors" value={`${visitors}`} icon={Users} />
      </section>

      {/* Chart */}
      <SalesArea data={salesData} />

      {/* Tabs */}
      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
        <Tabs defaultValue="attendees" className="w-full">
          <TabsList className="rounded-[var(--radius-pill)] bg-[var(--chip)] border border-[var(--border)] p-1">
            <TabsTrigger
              value="attendees"
              className="rounded-[var(--radius-pill)] data-[state=active]:bg-[var(--surface)] data-[state=active]:shadow-[var(--shadow-sm)]"
            >
              Attendees
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="rounded-[var(--radius-pill)] data-[state=active]:bg-[var(--surface)] data-[state=active]:shadow-[var(--shadow-sm)]"
            >
              Tickets
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-[var(--radius-pill)] data-[state=active]:bg-[var(--surface)] data-[state=active]:shadow-[var(--shadow-sm)]"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="mt-4" />

          <TabsContent value="attendees" className="m-0">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--chip)] p-4 text-[var(--muted-text)]">
              Connect your attendees table here. (e.g., `/Orders` or `/Tickets`
              joined with profiles)
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="m-0">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="text-sm font-semibold">General Admission</div>
                <div className="text-xs text-[var(--muted-text)]">
                  Price · Capacity · Sold
                </div>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="text-sm font-semibold">VIP</div>
                <div className="text-xs text-[var(--muted-text)]">
                  Price · Capacity · Sold
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="m-0">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="text-sm font-semibold mb-2">Visibility</div>
                <div className="text-xs text-[var(--muted-text)] mb-3">
                  Toggle publish status for this event.
                </div>
                <div className="flex gap-2">
                  <Button
                    className="h-9 rounded-[var(--radius-pill)] px-4 bg-[var(--accent)] text-black border border-black/10"
                    onClick={() => alert("Publish API here")}
                  >
                    Publish
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 rounded-[var(--radius-pill)] px-4 border border-[var(--border)]"
                    onClick={() => alert("Unpublish API here")}
                  >
                    Unpublish
                  </Button>
                </div>
              </div>

              <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="text-sm font-semibold mb-2">Danger zone</div>
                <div className="text-xs text-[var(--muted-text)] mb-3">
                  Archiving hides the event from listings without deleting data.
                </div>
                <Button
                  variant="ghost"
                  className="h-9 rounded-[var(--radius-pill)] px-4 border border-[var(--border)]"
                  onClick={() => alert("Archive API here")}
                >
                  Archive event
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
