import { formatNumber } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  suffix,
  sub,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">
        {typeof value === "number" ? formatNumber(value) : value}
        {suffix ? <span className="ml-1 text-base font-semibold text-slate-500">{suffix}</span> : null}
      </p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}
