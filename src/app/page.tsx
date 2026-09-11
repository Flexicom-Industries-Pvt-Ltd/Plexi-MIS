import Link from "next/link";
import { format } from "date-fns";
import { ClipboardList, LayoutDashboard, CalendarDays } from "lucide-react";

export default function HomePage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const todayLabel = format(new Date(), "EEEE, d MMMM yyyy");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">LOOM PRODUCTION</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Daily production reporting</h1>
        <p className="mt-2 text-slate-600">Today: {todayLabel}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href={`/entry/${today}/sheet-1`}
          className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow"
        >
          <ClipboardList className="h-8 w-8 text-sky-700" />
          <div>
            <p className="font-bold text-slate-900">Today&apos;s MIS</p>
            <p className="text-sm text-slate-500">Enter all four sheets</p>
          </div>
        </Link>

        <Link
          href="/history"
          className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow"
        >
          <CalendarDays className="h-8 w-8 text-sky-700" />
          <div>
            <p className="font-bold text-slate-900">History</p>
            <p className="text-sm text-slate-500">Browse previous days</p>
          </div>
        </Link>

        <Link
          href="/dashboards/overall"
          className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow"
        >
          <LayoutDashboard className="h-8 w-8 text-sky-700" />
          <div>
            <p className="font-bold text-slate-900">Overall Dashboard</p>
            <p className="text-sm text-slate-500">Management overview</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
