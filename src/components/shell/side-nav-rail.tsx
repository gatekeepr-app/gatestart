"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sun, Ticket, Grid2X2, MessageCircle, Settings } from "lucide-react";

const NAV_ITEMS = [
  { icon: Sun, label: "Overview", href: "/overview" },
  { icon: Ticket, label: "Events", href: "/events" },
  { icon: Grid2X2, label: "Dashboard", href: "/dashboard" },
  { icon: MessageCircle, label: "Messages", href: "/messages" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function SideNavRail() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      aria-label="Sidebar"
      className="sticky top-6 h-[calc(100dvh-3rem)] w-[76px] p-2 rounded-xl bg-[var(--surface)]/70 backdrop-blur-md border border-[var(--border)] shadow-[var(--shadow-sm)] hidden lg:flex flex-col items-center justify-between"
    >
      {/* Tooltips only on hover-capable devices to avoid irritation */}
      <div className="mt-2">
        <TooltipProvider delayDuration={600}>
          <nav
            className="flex flex-col items-center gap-2"
            role="navigation"
            aria-label="Main"
          >
            {NAV_ITEMS.map((it) => {
              const active = isActive(it.href);
              return (
                <Tooltip key={it.href} disableHoverableContent>
                  <TooltipTrigger asChild>
                    <Link
                      href={it.href}
                      aria-label={it.label}
                      aria-current={active ? "page" : undefined}
                    >
                      <Button
                        variant="ghost"
                        className={[
                          "relative grid place-items-center w-12 h-12 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]",
                          "hover:shadow-[var(--shadow-md)] transition-shadow focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                          active ? "ring-1 ring-[var(--accent)]" : "",
                        ].join(" ")}
                      >
                        <it.icon
                          className={
                            active
                              ? "size-5 text-black"
                              : "size-5 text-[var(--muted-text)]"
                          }
                        />
                        {active && (
                          <span
                            aria-hidden
                            className="absolute -right-1 top-1.5 w-2 h-2 rounded-full bg-[var(--accent)]"
                          />
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  {/* Side/right, subtle, no arrow, small offset */}
                  <TooltipContent
                    side="right"
                    sideOffset={8}
                    className="rounded-[var(--radius-sm)] bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-[var(--shadow-sm)]"
                  >
                    {it.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>
      </div>

      {/* Avatar / future notifications */}
      <div className="mb-2">
        <Avatar className="h-10 w-10 border border-[var(--border)] shadow-[var(--shadow-sm)]">
          <AvatarImage src="/avatar.png" alt="User" />
          <AvatarFallback>GK</AvatarFallback>
        </Avatar>
      </div>
    </aside>
  );
}
