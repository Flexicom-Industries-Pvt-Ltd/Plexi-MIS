"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateSheet2 } from "@/lib/calculations/mis-calculations";
import { CalculatedField } from "../CalculatedField";
import { NumericInput } from "../NumericInput";
import { EntryHeader } from "../EntryHeader";
import { SaveBar } from "../SaveBar";
import { SheetNav } from "../SheetNav";
import { useMisDay } from "@/hooks/useMisDay";

export function Sheet2Form({ dateKey }: { dateKey: string }) {
  const { data, loading, error: loadError, setData } = useMisDay(dateKey);
  const [form, setForm] = useState({ shiftA: "0", shiftB: "0", totalRunPlanned: "0" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readonly = data?.status === "LOCKED";

  useEffect(() => {
    if (!data?.sheet2) return;
    const s = data.sheet2;
    setForm({
      shiftA: String(s.shiftA ?? 0),
      shiftB: String(s.shiftB ?? 0),
      totalRunPlanned: String(s.totalRunPlanned ?? 0),
    });
  }, [data]);

  const calc = useMemo(
    () =>
      calculateSheet2({
        shiftA: Number(form.shiftA),
        shiftB: Number(form.shiftB),
        totalRunPlanned: Number(form.totalRunPlanned),
      }),
    [form],
  );

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/mis/${dateKey}/sheet-2`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shiftA: Number(form.shiftA),
          shiftB: Number(form.shiftB),
          totalRunPlanned: Number(form.totalRunPlanned),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (loadError || !data) return <p className="text-red-600">{loadError}</p>;

  return (
    <div className="space-y-4">
      <EntryHeader dateKey={dateKey} status={data.status} title="Sheet 2 - Run" />
      <SheetNav dateKey={dateKey} current="sheet-2" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <NumericInput
            label="Shift A"
            value={form.shiftA}
            disabled={readonly}
            onChange={(v) => setForm((f) => ({ ...f, shiftA: v }))}
          />
          <NumericInput
            label="Shift B"
            value={form.shiftB}
            disabled={readonly}
            onChange={(v) => setForm((f) => ({ ...f, shiftB: v }))}
          />
          <CalculatedField label="Total Run (Actual)" value={calc.totalRun} />
          <NumericInput
            label="Total Run Planned"
            value={form.totalRunPlanned}
            disabled={readonly}
            onChange={(v) => setForm((f) => ({ ...f, totalRunPlanned: v }))}
          />
        </div>
        <div className="mt-4 rounded-xl bg-amber-50 p-4">
          <CalculatedField label="Gap % (planned not achieved)" value={calc.gapPercent} suffix="%" />
          <p className="mt-2 text-xs text-amber-800">
            Gap shows the percentage of planned run that was not achieved.
          </p>
        </div>
      </div>

      <SaveBar
        saving={saving}
        error={error}
        onSave={save}
        nextHref={`/entry/${dateKey}/sheet-3`}
        nextLabel="Next: Performance"
      />
    </div>
  );
}
