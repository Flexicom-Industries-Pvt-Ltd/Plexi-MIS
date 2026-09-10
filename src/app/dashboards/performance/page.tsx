"use client";

import { format, parseISO } from "date-fns";
import { KpiCard } from "@/components/mis/KpiCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ShiftCompareChart } from "@/components/dashboard/ShiftCompareChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useCumulativeDashboard } from "@/hooks/useCumulativeDashboard";

export default function PerformanceDashboardPage() {
  const { data, cumulative, periodSummary, loading, error, hasData } = useCumulativeDashboard();
  const s3 = cumulative?.sheet3;

  const trend = data.map((d) => ({
    date: format(parseISO(d.date), "d MMM"),
    production: d.sheet3?.totalProduction ?? 0,
    avg: d.sheet3?.productionAvgTotal ?? 0,
    wastagePct: d.sheet3?.wastagePercentTotal ?? 0,
  }));

  const compare = s3
    ? [
        { label: "Production", shiftA: s3.productionA, shiftB: s3.productionB },
        { label: "Wastage", shiftA: s3.wastageA, shiftB: s3.wastageB },
      ]
    : [];

  return (
    <DashboardShell
      title="Production Performance Dashboard"
      subtitle="Sheet 3 - Production Performance (cumulative totals)"
      current="/dashboards/performance"
      periodSummary={periodSummary}
    >
      {loading ? <p className="text-slate-500">Loading...</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      {!hasData || !s3 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
          No performance data yet.
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Shift A Production" value={s3.productionA} sub="All days" />
            <KpiCard label="Shift B Production" value={s3.productionB} sub="All days" />
            <KpiCard label="Total Production" value={s3.totalProduction} />
            <KpiCard label="Production Average" value={s3.productionAvgTotal} />
            <KpiCard label="Shift A Wastage" value={s3.wastageA} />
            <KpiCard label="Shift B Wastage" value={s3.wastageB} />
            <KpiCard label="Total Wastage" value={s3.totalWastage} />
            <KpiCard label="Wastage %" value={s3.wastagePercentTotal} suffix="%" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Shift A vs Shift B (cumulative)</h2>
              <ShiftCompareChart data={compare} />
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Daily Trend</h2>
              <TrendChart
                data={trend}
                lines={[
                  { key: "production", color: "#0369a1", name: "Production" },
                  { key: "avg", color: "#10b981", name: "Prod. Average" },
                ]}
              />
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
