"use client";

import { useState } from "react";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import { EntryHeader } from "../EntryHeader";
import { SheetNav } from "../SheetNav";
import { StatusBadge } from "../StatusBadge";
import { EntrySkeleton } from "../EntrySkeleton";
import { useMisDay } from "@/hooks/useMisDay";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-bold text-slate-900">{title}</h2>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{typeof value === "number" ? formatNumber(value) : value}</span>
    </div>
  );
}

export function ReviewPage({ dateKey }: { dateKey: string }) {
  const { data, loading, error: loadError, refresh, setData } = useMisDay(dateKey);
  const [submitting, setSubmitting] = useState(false);
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/mis/${dateKey}/submit`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submit failed");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const lock = async () => {
    setLocking(true);
    setError(null);
    try {
      const res = await fetch(`/api/mis/${dateKey}/lock`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Lock failed");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lock failed");
    } finally {
      setLocking(false);
    }
  };

  if (!data && loading) return <EntrySkeleton />;
  if (!data) return <p className="text-red-600">{loadError ?? "Could not load data."}</p>;

  const s1 = data.sheet1;
  const s3 = data.sheet3;

  return (
    <div className="space-y-4">
      <EntryHeader dateKey={dateKey} status={data.status} title="Review & Submit" />
      <SheetNav dateKey={dateKey} current="review" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Sheet 1 - Production / Section A">
          {s1 ? (
            <>
              <Row label="Total Production" value={s1.totalProduction} />
              <Row label="Total Wastage" value={s1.totalWastage} />
              <Row label="Wastage %" value={`${formatNumber(s1.wastagePercentTotal)}%`} />
              <Row label="Efficiency A / B" value={`${formatNumber(s1.efficiencyA)} / ${formatNumber(s1.efficiencyB)}`} />
              <Row label="Total RP" value={s1.totalRp} />
            </>
          ) : (
            <p className="text-slate-500">No data yet.</p>
          )}
          <Link href={`/entry/${dateKey}/sheet-1`} className="mt-2 inline-block text-sm font-medium text-sky-700">
            Edit Sheet 1
          </Link>
        </Section>

        <Section title="Sheet 2 - Run MIS">
          {data.sheet2?.length ? (
            <>
              {data.sheet2.map((row) => (
                <div key={row.material} className="mb-2 border-b border-slate-100 pb-2 last:mb-0 last:border-0">
                  <p className="font-semibold text-slate-800">{row.material}</p>
                  <Row label="A / B / Total Run" value={`${formatNumber(row.shiftA)} / ${formatNumber(row.shiftB)} / ${formatNumber(row.totalRun)}`} />
                  <Row label="Planned / Gap %" value={`${formatNumber(row.totalRunPlanned)} / ${formatNumber(row.gapPercent)}%`} />
                </div>
              ))}
              {data.sheet2Totals ? (
                <Row
                  label="All materials total"
                  value={`Run ${formatNumber(data.sheet2Totals.totalRun)} | Planned ${formatNumber(data.sheet2Totals.totalRunPlanned)} | Gap ${formatNumber(data.sheet2Totals.gapPercent)}%`}
                />
              ) : null}
            </>
          ) : (
            <p className="text-slate-500">No data yet.</p>
          )}
          <Link href={`/entry/${dateKey}/sheet-2`} className="mt-2 inline-block text-sm font-medium text-sky-700">
            Edit Sheet 2
          </Link>
        </Section>

        <Section title="Sheet 3 - Production Performance">
          {s3 ? (
            <>
              <Row label="Total Production" value={s3.totalProduction} />
              <Row label="Production Average" value={s3.productionAvgTotal} />
              <Row label="Total Wastage" value={s3.totalWastage} />
              <Row label="Wastage %" value={`${formatNumber(s3.wastagePercentTotal)}%`} />
            </>
          ) : (
            <p className="text-slate-500">No data yet.</p>
          )}
          <Link href={`/entry/${dateKey}/sheet-3`} className="mt-2 inline-block text-sm font-medium text-sky-700">
            Edit Sheet 3
          </Link>
        </Section>

        <Section title="Sheet 4 - Loom Performance">
          {data.sheet4.length ? (
            data.sheet4.map((row) => (
              <div key={row.material} className="mb-3 border-b border-slate-100 pb-2 last:mb-0 last:border-0">
                <p className="font-semibold text-slate-800">{row.material}</p>
                <Row label="A: Prod / Loom / Per Loom" value={`${formatNumber(row.productionA)} / ${formatNumber(row.loomsRunA)} / ${formatNumber(row.productionPerLoomA)}`} />
                <Row label="B: Prod / Loom / Per Loom" value={`${formatNumber(row.productionB)} / ${formatNumber(row.loomsRunB)} / ${formatNumber(row.productionPerLoomB)}`} />
              </div>
            ))
          ) : (
            <p className="text-slate-500">No data yet.</p>
          )}
          <Link href={`/entry/${dateKey}/sheet-4`} className="mt-2 inline-block text-sm font-medium text-sky-700">
            Edit Sheet 4
          </Link>
        </Section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-4 backdrop-blur safe-bottom-pad">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Status:</span>
            <StatusBadge status={data.status} />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => refresh()}
              className="min-h-[48px] rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold"
            >
              Refresh
            </button>
            {data.status === "DRAFT" ? (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="min-h-[48px] rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit MIS"}
              </button>
            ) : null}
            {data.status === "SUBMITTED" ? (
              <button
                type="button"
                onClick={lock}
                disabled={locking}
                className="min-h-[48px] rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {locking ? "Locking..." : "Lock (Finalize)"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
