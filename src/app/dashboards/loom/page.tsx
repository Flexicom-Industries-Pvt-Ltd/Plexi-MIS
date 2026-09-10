"use client";

import { format, parseISO } from "date-fns";
import { KpiCard } from "@/components/mis/KpiCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ShiftCompareChart } from "@/components/dashboard/ShiftCompareChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useCumulativeDashboard } from "@/hooks/useCumulativeDashboard";

export default function LoomDashboardPage() {
  const { data, cumulative, periodSummary, loading, error, hasData } = useCumulativeDashboard();
  const sheet4 = cumulative?.sheet4 ?? [];

  const trend = data.map((d) => {
    const pp = d.sheet4.find((r) => r.material === "PP");
    const lpp = d.sheet4.find((r) => r.material === "LPP");
    const gb = d.sheet4.find((r) => r.material === "GB");
    return {
      date: format(parseISO(d.date), "d MMM"),
      pp: pp?.productionPerLoomA ?? 0,
      lpp: lpp?.productionPerLoomA ?? 0,
      gb: gb?.productionPerLoomA ?? 0,
    };
  });

  const materialCompare = sheet4.map((row) => ({
    label: row.material,
    shiftA: row.productionPerLoomA,
    shiftB: row.productionPerLoomB,
  }));

  return (
    <DashboardShell
      title="Loom Performance Dashboard"
      subtitle="Sheet 4 - Loom Performance (cumulative totals)"
      current="/dashboards/loom"
      periodSummary={periodSummary}
    >
      {loading ? <p className="text-slate-500">Loading...</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      {!hasData ? (
        <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
          No loom data yet.
        </p>
      ) : (
        <>
          {sheet4.map((row) => (
            <div key={row.material} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-slate-900">{row.material}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <KpiCard label="A Production" value={row.productionA} sub="All days" />
                <KpiCard label="A Looms Run" value={row.loomsRunA} sub="All days" />
                <KpiCard label="A Prod / Loom" value={row.productionPerLoomA} />
                <KpiCard label="B Production" value={row.productionB} sub="All days" />
                <KpiCard label="B Looms Run" value={row.loomsRunB} sub="All days" />
                <KpiCard label="B Prod / Loom" value={row.productionPerLoomB} />
              </div>
            </div>
          ))}

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Shift A vs Shift B (Prod/Loom, cumulative)</h2>
              <ShiftCompareChart data={materialCompare} />
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Daily Trend (Shift A Prod/Loom)</h2>
              <TrendChart
                data={trend}
                lines={[
                  { key: "pp", color: "#0369a1", name: "PP" },
                  { key: "lpp", color: "#10b981", name: "LPP" },
                  { key: "gb", color: "#f59e0b", name: "GB" },
                ]}
              />
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
