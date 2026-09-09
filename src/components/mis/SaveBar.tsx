"use client";

import Link from "next/link";

export function SaveBar({
  saving,
  error,
  onSave,
  nextHref,
  nextLabel = "Next",
}: {
  saving: boolean;
  error: string | null;
  onSave: () => void;
  nextHref?: string;
  nextLabel?: string;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {error ? <p className="text-sm text-red-600">{error}</p> : <p className="text-sm text-slate-500">Calculated fields update automatically.</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="min-h-[48px] flex-1 rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:flex-none"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {nextHref ? (
            <Link
              href={nextHref}
              className="min-h-[48px] flex-1 rounded-xl border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 sm:flex-none"
            >
              {nextLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
