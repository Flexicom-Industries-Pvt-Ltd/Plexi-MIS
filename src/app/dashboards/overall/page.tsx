"use client";

import { KpiCard } from "@/components/mis/KpiCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ShiftCompareChart } from "@/components/dashboard/ShiftCompareChart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatNumber } from "@/lib/utils";

export default function OverallDashboardPage() {
  const { selected, loading, error } = useDashboardData();
  const s1 = selected?.sheet1;
  const sheet2 = selected?.sheet2 ?? [];
  const s2Totals = selected?.sheet2Totals;
  const s3 = selected?.sheet3;
  const s4 = selected?.sheet4 ?? [];

  const productionCompare = s1
    ? [{ label: "Production", shiftA: s1.productionA, shiftB: s1.productionB }]
    : [];

  const runGapCompare = sheet2.map((row) => ({
    label: row.material,
    shiftA: row.totalRun,
    shiftB: row.gapPercent,
  }));

  return (
    <DashboardShell
      title="Overall MIS Dashboard"
      subtitle="Combined view from all four sheets"
      current="/dashboards/overall"
    >
      {loading ? <p className="text-slate-500">Loading...</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      {!selected ? (
        <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
          No MIS data yet. Start with today&apos;s entry.
        </p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Total Production" value={s1?.totalProduction ?? 0} sub="Sheet 1" />
            <KpiCard label="Total Wastage" value={s1?.totalWastage ?? 0} sub="Sheet 1" />
            <KpiCard label="Wastage %" value={s1?.wastagePercentTotal ?? 0} suffix="%" />
            <KpiCard label="Efficiency A / B" value={`${s1?.efficiencyA ?? 0} / ${s1?.efficiencyB ?? 0}`} />
            <KpiCard label="RP" value={s1?.totalRp ?? 0} />
            <KpiCard label="Actual Run" value={s2Totals?.totalRun ?? 0} sub="Sheet 2 (all materials)" />
            <KpiCard label="Planned Run" value={s2Totals?.totalRunPlanned ?? 0} sub="Sheet 2" />
            <KpiCard label="Gap %" value={s2Totals?.gapPercent ?? 0} suffix="%" sub="Sheet 2" />
            <KpiCard label="Production Average" value={s3?.productionAvgTotal ?? 0} sub="Sheet 3" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-bold text-slate-900">Run MIS</h2>
              <div className="space-y-3">
                {sheet2.map((row) => (
                  <div
                    key={row.material}
                    className="flex justify-between border-b border-slate-100 py-2 text-sm last:border-0"
                  >
                    <span className="font-semibold text-slate-800">{row.material}</span>
                    <span className="text-slate-600">
                      Run: {formatNumber(row.totalRun)} / Planned: {formatNumber(row.totalRunPlanned)} | Gap:{" "}
                      {formatNumber(row.gapPercent)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-bold text-slate-900">Loom Performance</h2>
              <div className="space-y-3">
                {s4.map((row) => (
                  <div
                    key={row.material}
                    className="flex justify-between border-b border-slate-100 py-2 text-sm last:border-0"
                  >
                    <span className="font-semibold text-slate-800">{row.material}</span>
                    <span className="text-slate-600">
                      A: {row.productionPerLoomA} | B: {row.productionPerLoomB}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Shift A vs Shift B (Production)</h2>
              <ShiftCompareChart data={productionCompare} />
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Run: Actual vs Gap % (by material)</h2>
              <ShiftCompareChart data={runGapCompare} />
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
