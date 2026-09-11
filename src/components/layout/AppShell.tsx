"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, ClipboardList, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { HiddenAdminPanel } from "@/components/admin/HiddenAdminPanel";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { useIsEntrySheet } from "@/hooks/useIsEntrySheet";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/entry", label: "Today", icon: ClipboardList },
  { href: "/history", label: "History", icon: CalendarDays },
  { href: "/dashboards/production", label: "Production", icon: BarChart3 },
  { href: "/dashboards/run", label: "Run", icon: BarChart3 },
  { href: "/dashboards/performance", label: "Performance", icon: BarChart3 },
  { href: "/dashboards/loom", label: "Loom", icon: BarChart3 },
  { href: "/dashboards/overall", label: "Overall", icon: LayoutDashboard },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isEntrySheet = useIsEntrySheet();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <HiddenAdminPanel />
            <Link href="/" className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">Flexicom</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700">LOOM PRODUCTION</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button
              type="button"
              className="rounded-lg border border-slate-200 p-2 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <nav className="hidden gap-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium",
                  pathname.startsWith(item.href)
                    ? "bg-sky-100 text-sky-800"
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          </div>
        </div>
        {open && (
          <nav className="border-t border-slate-200 px-2 py-2 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-3 text-sm font-medium",
                  pathname.startsWith(item.href)
                    ? "bg-sky-100 text-sky-800"
                    : "text-slate-700 hover:bg-slate-100",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main
        className={cn(
          "mx-auto max-w-6xl px-4 py-4",
          isEntrySheet ? "pb-36" : "pb-24 lg:pb-8",
        )}
      >
        {children}
      </main>
      <MobileBottomNav />
      <PwaInstallPrompt />
    </div>
  );
}
