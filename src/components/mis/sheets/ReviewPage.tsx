"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Edit3,
  Gauge,
  Info,
  Layers,
  Lock,
  Package,
  RefreshCw,
  Send,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { EntryHeader } from "../EntryHeader";
import { SheetNav } from "../SheetNav";
import { StatusBadge } from "../StatusBadge";
import { EntrySkeleton } from "../EntrySkeleton";
import { useMisDay } from "@/hooks/useMisDay";

function Section({
  title,
  icon: Icon,
  editHref,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-sky-700" />
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          </div>
          <Link
            href={editHref}
            className="flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            <Edit3 className="h-3 w-3" />
            <span>Edit</span>
          </Link>
        </div>
        <div className="space-y-2 text-sm">{children}</div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5 text-xs last:border-0 sm:text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-bold text-slate-900">{typeof value === "number" ? formatNumber(value) : value}</span>
    </div>
  );
}

export function ReviewPage({ dateKey }: { dateKey: string }) {
  const { data, loading, error: loadError, refresh, setData } = useMisDay(dateKey);
  const [submitting, setSubmitting] = useState(false);
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(40);
      } catch {
        // ignore
      }
    }
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
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(40);
      } catch {
        // ignore
      }
    }
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
      <EntryHeader dateKey={dateKey} status={data.status} title="Review & Submit MIS" />
      <SheetNav dateKey={dateKey} current="review" />

      {/* Guidance Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-xs font-medium text-sky-900 shadow-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
        <p>
          Verify all 4 sheet figures below. When ready, tap <strong>Submit MIS</strong> to record today&apos;s entry permanently.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Sheet 1 - Production" icon={Layers} editHref={`/entry/${dateKey}/sheet-1`}>
          {s1 ? (
            <>
              <Row label="Total Production" value={`${formatNumber(s1.totalProduction)} kg`} />
              <Row label="Total Wastage" value={`${formatNumber(s1.totalWastage)} kg`} />
              <Row label="Total Wastage %" value={`${formatNumber(s1.wastagePercentTotal)}%`} />
              <Row label="Efficiency A / B" value={`${formatNumber(s1.efficiencyA)}% / ${formatNumber(s1.efficiencyB)}%`} />
              <Row label="Total RP" value={`${formatNumber(s1.totalRp)} kg`} />
            </>
          ) : (
            <p className="text-xs text-slate-500">No data entered yet.</p>
          )}
        </Section>

        <Section title="Sheet 2 - Run MIS" icon={Package} editHref={`/entry/${dateKey}/sheet-2`}>
          {data.sheet2?.length ? (
            <>
              {data.sheet2.map((row) => (
                <div key={row.material} className="border-b border-slate-100 py-1.5 last:border-0">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800">{row.material}</span>
                    <span className="text-slate-600">
                      Run: <strong>{formatNumber(row.totalRun)}</strong> / Plan: {formatNumber(row.totalRunPlanned)} (Gap: {formatNumber(row.gapPercent)}%)
                    </span>
                  </div>
                </div>
              ))}
              {data.sheet2Totals ? (
                <div className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs font-semibold text-slate-800">
                  Total Run: {formatNumber(data.sheet2Totals.totalRun)} | Planned: {formatNumber(data.sheet2Totals.totalRunPlanned)} | Gap: {formatNumber(data.sheet2Totals.gapPercent)}%
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-xs text-slate-500">No data entered yet.</p>
          )}
        </Section>

        <Section title="Sheet 3 - Production Performance" icon={Activity} editHref={`/entry/${dateKey}/sheet-3`}>
          {s3 ? (
            <>
              <Row label="Total Production" value={`${formatNumber(s3.totalProduction)} kg`} />
              <Row label="Total Loom Run" value={`${formatNumber(s3.totalLoomRun)} looms`} />
              <Row label="Production Average" value={`${formatNumber(s3.productionAvgTotal)} kg/loom`} />
              <Row label="Total Wastage" value={`${formatNumber(s3.totalWastage)} kg`} />
              <Row label="Total Wastage %" value={`${formatNumber(s3.wastagePercentTotal)}%`} />
            </>
          ) : (
            <p className="text-xs text-slate-500">No data entered yet.</p>
          )}
        </Section>

        <Section title="Sheet 4 - Loom Performance" icon={Gauge} editHref={`/entry/${dateKey}/sheet-4`}>
          {data.sheet4?.length ? (
            data.sheet4.map((row) => (
              <div key={row.material} className="border-b border-slate-100 py-1.5 last:border-0">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">{row.material}</span>
                  <span className="text-slate-600">
                    A: {formatNumber(row.productionPerLoomA)}/loom | B: {formatNumber(row.productionPerLoomB)}/loom
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">No data entered yet.</p>
          )}
        </Section>
      </div>

      {/* Fixed Sticky Submission Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-3.5 backdrop-blur safe-bottom-pad shadow-lg">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Record Status:</span>
            <StatusBadge status={data.status} />
            {error ? <p className="text-xs font-bold text-red-600">{error}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => refresh()}
              className="flex min-h-[48px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
            {data.status === "DRAFT" ? (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="flex min-h-[48px] items-center gap-2 rounded-xl bg-sky-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? "Submitting MIS..." : "Submit MIS Record"}</span>
              </button>
            ) : null}
            {data.status === "SUBMITTED" ? (
              <button
                type="button"
                onClick={lock}
                disabled={locking}
                className="flex min-h-[48px] items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-black disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />
                <span>{locking ? "Locking Record..." : "Lock (Finalize Record)"}</span>
              </button>
            ) : null}
            {data.status === "LOCKED" ? (
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Finalized & Locked</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

