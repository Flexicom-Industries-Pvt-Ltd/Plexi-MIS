"use client";

import { KpiCard } from "@/components/mis/KpiCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ShiftCompareChart } from "@/components/dashboard/ShiftCompareChart";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function OverallDashboardPage() {
  const { latest, loading, error } = useDashboardData();
  const s1 = latest?.sheet1;
  const s2 = latest?.sheet2;
  const s3 = latest?.sheet3;
  const s4 = latest?.sheet4 ?? [];

  const productionCompare = s1
    ? [{ label: "Production", shiftA: s1.productionA, shiftB: s1.productionB }]
    : [];

  return (
    <DashboardShell
      title="Overall MIS Dashboard"
      subtitle="Combined view from all four sheets"
      current="/dashboards/overall"
    >
      {loading ? <p className="text-slate-500">Loading...</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      {!latest ? (
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
            <KpiCard label="Actual Run" value={s2?.totalRun ?? 0} sub="Sheet 2" />
            <KpiCard label="Planned Run" value={s2?.totalRunPlanned ?? 0} />
            <KpiCard label="Gap %" value={s2?.gapPercent ?? 0} suffix="%" />
            <KpiCard label="Production Average" value={s3?.productionAvgTotal ?? 0} sub="Sheet 3" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-bold text-slate-900">Loom Performance (Latest)</h2>
              <div className="space-y-3">
                {s4.map((row) => (
                  <div key={row.material} className="flex justify-between border-b border-slate-100 py-2 text-sm last:border-0">
                    <span className="font-semibold text-slate-800">{row.material}</span>
                    <span className="text-slate-600">
                      A: {row.productionPerLoomA} | B: {row.productionPerLoomB}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-slate-700">Shift A vs Shift B (Production)</h2>
              <ShiftCompareChart data={productionCompare} />
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
