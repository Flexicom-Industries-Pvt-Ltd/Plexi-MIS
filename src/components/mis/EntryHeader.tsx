"use client";

import { format, parseISO } from "date-fns";
import { StatusBadge } from "./StatusBadge";

export function EntryHeader({
  dateKey,
  status,
  title,
}: {
  dateKey: string;
  status: "DRAFT" | "SUBMITTED" | "LOCKED";
  title: string;
}) {
  const label = format(parseISO(dateKey), "EEEE, d MMM yyyy");
  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Daily MIS</p>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
