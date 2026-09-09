"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/mis/StatusBadge";

type HistoryRow = {
  id: string;
  date: string;
  status: "DRAFT" | "SUBMITTED" | "LOCKED";
  updatedAt: string;
};

export default function HistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/mis/history");
        if (!res.ok) throw new Error("Failed");
        setRows(await res.json());
      } catch {
        setError("Could not load history.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">MIS History</h1>
        <p className="text-sm text-slate-500">Select a date to view or edit its four sheets.</p>
      </div>

      {loading ? <p className="text-slate-500">Loading...</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      {!loading && !rows.length ? (
        <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
          No records yet. Open today&apos;s MIS to create the first entry.
        </p>
      ) : null}

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-bold text-slate-900">{format(parseISO(row.date), "EEEE, d MMM yyyy")}</p>
              <p className="text-xs text-slate-500">Updated {format(new Date(row.updatedAt), "d MMM yyyy, h:mm a")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={row.status} />
              <Link
                href={`/entry/${row.date}/sheet-1`}
                className="min-h-[44px] rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white"
              >
                Open Entry
              </Link>
              <Link
                href={`/dashboards/overall?date=${row.date}`}
                className="min-h-[44px] rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
              >
                Dashboards
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
