"use client";

import { KpiCard } from "@/components/mis/KpiCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ShiftCompareChart } from "@/components/dashboard/ShiftCompareChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { format, parseISO } from "date-fns";

export default function RunDashboardPage() {
  const { data, latest, loading, error } = useDashboardData();
  const s2 = latest?.sheet2;

  const trend = data.map((d) => ({
    date: format(parseISO(d.date), "d MMM"),
    actual: d.sheet2?.totalRun ?? 0,
    planned: d.sheet2?.totalRunPlanned ?? 0,
    gap: d.sheet2?.gapPercent ?? 0,
  }));

  const compare = s2
    ? [{ label: "Run", shiftA: s2.shiftA, shiftB: s2.shiftB }]
    : [];

  return (
    <DashboardShell title="Run Dashboard" subtitle="Sheet 2 - Run" current="/dashboards/run">
      {loading ? <p className="text-slate-500">Loading...</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      {s2 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard label="Shift A Run" value={s2.shiftA} />
          <KpiCard label="Shift B Run" value={s2.shiftB} />
          <KpiCard label="Total Actual Run" value={s2.totalRun} />
          <KpiCard label="Total Planned Run" value={s2.totalRunPlanned} />
          <KpiCard label="Gap %" value={s2.gapPercent} suffix="%" sub="Planned not achieved" />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Shift A vs Shift B</h2>
          <ShiftCompareChart data={compare} />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Actual vs Planned</h2>
          <TrendChart
            data={trend}
            lines={[
              { key: "actual", color: "#0369a1", name: "Actual" },
              { key: "planned", color: "#94a3b8", name: "Planned" },
            ]}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
