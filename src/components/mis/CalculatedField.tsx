"use client";

import { Calculator } from "lucide-react";
import { formatNumber, cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  suffix?: string;
  className?: string;
};

export function CalculatedField({ label, value, suffix, className }: Props) {
  return (
    <div className={cn("block", className)}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className="inline-flex items-center gap-1 rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
          <Calculator className="h-2.5 w-2.5" />
          <span>Auto</span>
        </span>
      </div>
      <div
        className="flex min-h-[56px] w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-100/90 px-4 py-3 text-xl font-bold text-slate-800 sm:text-lg"
        aria-readonly="true"
      >
        <span className="notranslate" translate="no">{formatNumber(value)}</span>
        {suffix ? <span className="text-sm font-semibold text-slate-500">{suffix}</span> : null}
      </div>
    </div>
  );
}

