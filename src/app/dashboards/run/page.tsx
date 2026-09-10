"use client";

import { KpiCard } from "@/components/mis/KpiCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ShiftCompareChart } from "@/components/dashboard/ShiftCompareChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { format, parseISO } from "date-fns";

export default function RunDashboardPage() {
  const { data, selected, loading, error } = useDashboardData();
  const sheet2 = selected?.sheet2 ?? [];
  const totals = selected?.sheet2Totals;

  const trend = data.map((d) => ({
    date: format(parseISO(d.date), "d MMM"),
    actual: d.sheet2Totals?.totalRun ?? 0,
    planned: d.sheet2Totals?.totalRunPlanned ?? 0,
    gap: d.sheet2Totals?.gapPercent ?? 0,
  }));

  const materialCompare = sheet2.map((row) => ({
    label: row.material,
    shiftA: row.shiftA,
    shiftB: row.shiftB,
  }));

  const gapCompare = sheet2.map((row) => ({
    label: row.material,
    shiftA: row.totalRun,
    shiftB: row.totalRunPlanned,
  }));

  return (
    <DashboardShell title="Run Dashboard" subtitle="Sheet 2 - Run MIS" current="/dashboards/run">
      {loading ? <p className="text-slate-500">Loading...</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      {totals ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard label="Total Actual Run" value={totals.totalRun} sub="All materials" />
          <KpiCard label="Total Planned Run" value={totals.totalRunPlanned} sub="All materials" />
          <KpiCard label="Overall Gap %" value={totals.gapPercent} suffix="%" sub="Planned not achieved" />
        </div>
      ) : null}

      {sheet2.map((row) => (
        <div key={row.material} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-slate-900">{row.material}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard label="Shift A" value={row.shiftA} />
            <KpiCard label="Shift B" value={row.shiftB} />
            <KpiCard label="Total Run" value={row.totalRun} />
            <KpiCard label="Planned Run" value={row.totalRunPlanned} />
            <KpiCard label="Gap %" value={row.gapPercent} suffix="%" />
          </div>
        </div>
      ))}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Shift A vs Shift B (by material)</h2>
          <ShiftCompareChart data={materialCompare} />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Actual vs Planned (by material)</h2>
          <ShiftCompareChart data={gapCompare} />
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Historical Trend (all materials)</h2>
        <TrendChart
          data={trend}
          lines={[
            { key: "actual", color: "#0369a1", name: "Actual" },
            { key: "planned", color: "#94a3b8", name: "Planned" },
          ]}
        />
      </div>
    </DashboardShell>
  );
}
