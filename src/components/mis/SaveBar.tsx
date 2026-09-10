"use client";

import Link from "next/link";
import { ArrowRight, Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export function SaveBar({
  saving,
  saved = false,
  error,
  onSave,
  nextHref,
  nextLabel = "Next Sheet",
}: {
  saving: boolean;
  saved?: boolean;
  error: string | null;
  onSave: () => void;
  nextHref?: string;
  nextLabel?: string;
}) {
  const handleSave = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(25);
      } catch {
        // ignore if not supported
      }
    }
    onSave();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-3.5 backdrop-blur safe-bottom-pad shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {error ? (
            <p className="text-xs font-semibold text-red-600">{error}</p>
          ) : saved ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Saved successfully</span>
            </p>
          ) : (
            <p className="text-xs font-medium text-slate-500">
              All totals and percentages update automatically.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-60 sm:flex-none",
            )}
          >
            <Save className="h-4 w-4 text-slate-600" />
            <span>{saving ? "Saving..." : "Save Draft"}</span>
          </button>
          {nextHref ? (
            <Link
              href={nextHref}
              onClick={() => {
                // If user hasn't saved explicitly, trigger save on forward progression
                handleSave();
              }}
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-6 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:bg-sky-800 active:scale-95 sm:flex-none"
            >
              <span>{nextLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

