"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Sun, Ticket, Grid2X2, MessageCircle, Settings } from "lucide-react";

const NAV_ITEMS = [
  { icon: Sun,        label: "Overview",  href: "/overview"  },
  { icon: Ticket,     label: "Events",    href: "/events"    },
  { icon: Grid2X2,    label: "Dashboard", href: "/dashboard" },
  { icon: MessageCircle,label: "Messages", href: "/messages"  },
  { icon: Settings,   label: "Settings",  href: "/settings"  },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="lg:hidden mb-3">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] h-10 px-3"
            aria-label="Open navigation"
          >
            <Menu className="size-5 text-[var(--text)]" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 border-[var(--border)]">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="p-4 border-b border-[var(--border)] text-[var(--text)] font-semibold">Menu</div>
          <ScrollArea className="h-[calc(100dvh-4rem)]">
            <nav className="p-3 grid gap-1">
              {NAV_ITEMS.map((it) => {
                const active = isActive(it.href);
                return (
                  <Link key={it.href} href={it.href} className="group" onClick={() => setOpen(false)}>
                    <Button
                      variant="ghost"
                      aria-current={active ? "page" : undefined}
                      className={[
                        "w-full justify-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]",
                        "focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                        active ? "ring-1 ring-[var(--accent)]" : "",
                      ].join(" ")}
                    >
                      <it.icon className="size-5 text-[var(--muted-text)] group-hover:text-black" />
                      <span className="text-[var(--text)]">{it.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
