"use client";

import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  suffix?: string;
  className?: string;
};

export function CalculatedField({ label, value, suffix, className }: Props) {
  return (
    <div className={cn("block", className)}>
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <div
        className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-lg font-semibold text-slate-700 min-h-[52px] flex items-center"
        aria-readonly="true"
      >
        {formatNumber(value)}
        {suffix ? <span className="ml-1 text-sm font-medium text-slate-500">{suffix}</span> : null}
      </div>
    </div>
  );
}
