"use client";

import Link from "next/link";
import { CheckCircle2, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMisDay } from "@/contexts/MisDayContext";

const sheets = [
  { n: 1, label: "Production", href: "sheet-1", sub: "Shift Wise" },
  { n: 2, label: "Run MIS", href: "sheet-2", sub: "5 Materials" },
  { n: 3, label: "Performance", href: "sheet-3", sub: "Averages" },
  { n: 4, label: "Loom", href: "sheet-4", sub: "Fabric Wise" },
  { n: 5, label: "Review & Submit", href: "review", sub: "Finalize" },
];

export function SheetNav({ dateKey, current }: { dateKey: string; current: string }) {
  const misDayCtx = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useMisDay(dateKey);
    } catch {
      return null;
    }
  })();

  const data = misDayCtx?.data;

  const isCompleted = (href: string): boolean => {
    if (!data) return false;
    if (href === "sheet-1") {
      return Boolean(
        data.sheet1 &&
          (data.sheet1.productionA > 0 || data.sheet1.productionB > 0 || data.sheet1.totalProduction > 0),
      );
    }
    if (href === "sheet-2") {
      return Boolean(data.sheet2?.some((r) => r.totalRun > 0 || r.totalRunPlanned > 0));
    }
    if (href === "sheet-3") {
      return Boolean(
        data.sheet3 &&
          (data.sheet3.productionA > 0 || data.sheet3.productionB > 0 || data.sheet3.totalProduction > 0),
      );
    }
    if (href === "sheet-4") {
      return Boolean(data.sheet4?.some((r) => r.productionA > 0 || r.productionB > 0));
    }
    if (href === "review") {
      return data.status === "SUBMITTED" || data.status === "LOCKED";
    }
    return false;
  };

  const currentIndex = sheets.findIndex((s) => s.href === current);
  const currentStep = currentIndex >= 0 ? currentIndex + 1 : 1;
  const progressPercent = Math.round((currentStep / sheets.length) * 100);

  return (
    <div className="space-y-2">
      {/* Visual Progress Bar */}
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>
            Step {currentStep} of {sheets.length}: <span className="text-sky-700">{sheets[currentIndex]?.label}</span>
          </span>
          <span className="text-slate-500">{progressPercent}% Completed</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-600 to-sky-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step Pills */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {sheets.map((sheet) => {
          const active = current === sheet.href;
          const completed = isCompleted(sheet.href);
          const isLast = sheet.href === "review";

          return (
            <Link
              key={sheet.href}
              href={`/entry/${dateKey}/${sheet.href}`}
              prefetch
              scroll={false}
              className={cn(
                "group relative flex min-h-[52px] items-center gap-2 rounded-xl border p-2.5 text-left transition-all duration-150 touch-manipulation",
                isLast ? "col-span-2 sm:col-span-1" : "",
                active
                  ? "border-sky-600 bg-sky-50/80 shadow-sm ring-2 ring-sky-500/20"
                  : completed
                    ? "border-emerald-200 bg-emerald-50/40 text-slate-700 hover:bg-emerald-50"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  active
                    ? "bg-sky-600 text-white"
                    : completed
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200",
                )}
              >
                {completed && !active ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : active ? (
                  <CircleDot className="h-4 w-4 animate-pulse" />
                ) : (
                  sheet.n
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-xs font-bold",
                    active ? "text-sky-900" : completed ? "text-emerald-900" : "text-slate-800",
                  )}
                >
                  {sheet.label}
                </p>
                <p className="truncate text-[10px] font-medium text-slate-400">{sheet.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


