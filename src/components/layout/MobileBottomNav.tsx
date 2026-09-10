"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, Home, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/entry", label: "Today", icon: ClipboardList, match: (p: string) => p.startsWith("/entry") },
  { href: "/history", label: "History", icon: CalendarDays, match: (p: string) => p.startsWith("/history") },
  {
    href: "/dashboards/overall",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (p: string) => p.startsWith("/dashboards"),
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const onEntrySheet = /\/entry\/[^/]+\/(sheet-|review)/.test(pathname);

  if (onEntrySheet) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden safe-bottom-pad"
      aria-label="Main navigation"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-4">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                "flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-xs font-semibold touch-manipulation",
                active ? "text-sky-700" : "text-slate-500",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
