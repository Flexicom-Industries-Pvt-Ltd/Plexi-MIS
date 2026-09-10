"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useDashboardData } from "@/hooks/useDashboardData";

const dashboardLinks = [
  { href: "/dashboards/production", label: "Production" },
  { href: "/dashboards/run", label: "Run" },
  { href: "/dashboards/performance", label: "Performance" },
  { href: "/dashboards/loom", label: "Loom" },
  { href: "/dashboards/overall", label: "Overall" },
];

export function DashboardShell({
  title,
  subtitle,
  current,
  children,
}: {
  title: string;
  subtitle?: string;
  current: string;
  children: React.ReactNode;
}) {
  const { latest, loading, error } = useDashboardData();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        {loading && !latest ? (
          <p className="mt-2 text-sm text-slate-500">Loading latest data...</p>
        ) : error ? (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        ) : latest ? (
          <p className="mt-2 text-sm text-slate-600">
            Latest: {format(parseISO(latest.date), "d MMM yyyy")} ({latest.status})
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No MIS records yet.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {dashboardLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              current === link.href
                ? "rounded-lg bg-sky-100 px-3 py-2 text-sm font-semibold text-sky-800"
                : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            }
          >
            {link.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
