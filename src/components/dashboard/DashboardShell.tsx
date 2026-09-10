"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const { selected, latest, loading, error } = useDashboardData();
  const dateQuery = dateParam ? `?date=${dateParam}` : "";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        {loading && !selected && !latest ? (
          <p className="mt-2 text-sm text-slate-500">Loading dashboard data...</p>
        ) : error ? (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        ) : dateParam && !selected ? (
          <p className="mt-2 text-sm text-amber-700">
            No MIS record for {format(parseISO(dateParam), "d MMM yyyy")}.
          </p>
        ) : selected ? (
          <p className="mt-2 text-sm text-slate-600">
            {dateParam ? "Viewing" : "Latest"}: {format(parseISO(selected.date), "d MMM yyyy")} ({selected.status})
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No MIS records yet.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {dashboardLinks.map((link) => (
          <Link
            key={link.href}
            href={`${link.href}${dateQuery}`}
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
