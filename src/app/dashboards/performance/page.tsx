"use client";

import { KpiCard } from "@/components/mis/KpiCard";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ShiftCompareChart } from "@/components/dashboard/ShiftCompareChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useDashboardData } from "@/hooks/useDashboardData";
import { format, parseISO } from "date-fns";

export default function PerformanceDashboardPage() {
  const { data, selected, loading, error } = useDashboardData();
  const s3 = selected?.sheet3;

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
      subtitle="Sheet 3 - Production Performance"
      current="/dashboards/performance"
    >
      {loading ? <p className="text-slate-500">Loading...</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      {s3 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Shift A Production" value={s3.productionA} />
          <KpiCard label="Shift B Production" value={s3.productionB} />
          <KpiCard label="Total Production" value={s3.totalProduction} />
          <KpiCard label="Production Average" value={s3.productionAvgTotal} />
          <KpiCard label="Shift A Wastage" value={s3.wastageA} />
          <KpiCard label="Shift B Wastage" value={s3.wastageB} />
          <KpiCard label="Total Wastage" value={s3.totalWastage} />
          <KpiCard label="Wastage %" value={s3.wastagePercentTotal} suffix="%" />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Shift A vs Shift B</h2>
          <ShiftCompareChart data={compare} />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Historical Trend</h2>
          <TrendChart
            data={trend}
            lines={[
              { key: "production", color: "#0369a1", name: "Production" },
              { key: "avg", color: "#10b981", name: "Prod. Average" },
            ]}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
