"use client";

import { format, parseISO } from "date-fns";
import { KpiCard } from "@/components/mis/KpiCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ShiftCompareChart } from "@/components/dashboard/ShiftCompareChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useCumulativeDashboard } from "@/hooks/useCumulativeDashboard";

export default function ProductionDashboardPage() {
  const { data, cumulative, periodSummary, loading, error, hasData } = useCumulativeDashboard();
  const s1 = cumulative?.sheet1;

  const trend = data.map((d) => ({
    date: format(parseISO(d.date), "d MMM"),
    production: d.sheet1?.totalProduction ?? 0,
    wastage: d.sheet1?.totalWastage ?? 0,
  }));

  const compare = s1
    ? [
        { label: "Production", shiftA: s1.productionA, shiftB: s1.productionB },
        { label: "Wastage", shiftA: s1.wastageA, shiftB: s1.wastageB },
        { label: "Efficiency", shiftA: s1.efficiencyA, shiftB: s1.efficiencyB },
      ]
    : [];

  return (
    <DashboardShell
      title="Production Dashboard"
      subtitle="Sheet 1 - Production / Section A (cumulative totals)"
      current="/dashboards/production"
      periodSummary={periodSummary}
    >
      {loading ? <p className="text-slate-500">Loading...</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      {!hasData || !s1 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
          No production data yet.
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Shift A Production" value={s1.productionA} sub="All days" />
            <KpiCard label="Shift B Production" value={s1.productionB} sub="All days" />
            <KpiCard label="Total Production" value={s1.totalProduction} />
            <KpiCard label="Wastage %" value={s1.wastagePercentTotal} suffix="%" />
            <KpiCard label="Shift A Wastage" value={s1.wastageA} />
            <KpiCard label="Shift B Wastage" value={s1.wastageB} />
            <KpiCard label="Total Wastage" value={s1.totalWastage} />
            <KpiCard label="Total RP" value={s1.totalRp} />
            <KpiCard label="Efficiency A" value={s1.efficiencyA} sub="Daily average" />
            <KpiCard label="Efficiency B" value={s1.efficiencyB} sub="Daily average" />
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
                  { key: "wastage", color: "#f59e0b", name: "Wastage" },
                ]}
              />
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
