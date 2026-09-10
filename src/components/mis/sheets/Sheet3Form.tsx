"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateSheet3 } from "@/lib/calculations/mis-calculations";
import { CalculatedField } from "../CalculatedField";
import { NumericInput } from "../NumericInput";
import { EntryHeader } from "../EntryHeader";
import { SaveBar } from "../SaveBar";
import { SheetNav } from "../SheetNav";
import { EntrySkeleton } from "../EntrySkeleton";
import { useMisDay } from "@/hooks/useMisDay";

export function Sheet3Form({ dateKey }: { dateKey: string }) {
  const { data, loading, error: loadError, setData } = useMisDay(dateKey);
  const [form, setForm] = useState({
    productionA: "0",
    productionB: "0",
    loomRunA: "0",
    loomRunB: "0",
    wastageA: "0",
    wastageB: "0",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readonly = data?.status === "LOCKED";

  useEffect(() => {
    if (!data?.sheet3) return;
    const s = data.sheet3;
    setForm({
      productionA: String(s.productionA ?? 0),
      productionB: String(s.productionB ?? 0),
      loomRunA: String(s.loomRunA ?? 0),
      loomRunB: String(s.loomRunB ?? 0),
      wastageA: String(s.wastageA ?? 0),
      wastageB: String(s.wastageB ?? 0),
    });
  }, [data]);

  const calc = useMemo(
    () =>
      calculateSheet3({
        productionA: Number(form.productionA),
        productionB: Number(form.productionB),
        loomRunA: Number(form.loomRunA),
        loomRunB: Number(form.loomRunB),
        wastageA: Number(form.wastageA),
        wastageB: Number(form.wastageB),
      }),
    [form],
  );

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/mis/${dateKey}/sheet-3`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionA: Number(form.productionA),
          productionB: Number(form.productionB),
          loomRunA: Number(form.loomRunA),
          loomRunB: Number(form.loomRunB),
          wastageA: Number(form.wastageA),
          wastageB: Number(form.wastageB),
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

  if (!data && loading) return <EntrySkeleton />;
  if (!data) return <p className="text-red-600">{loadError ?? "Could not load data."}</p>;

  return (
    <div className="space-y-4">
      <EntryHeader dateKey={dateKey} status={data.status} title="Sheet 3 - Production Performance" />
      <SheetNav dateKey={dateKey} current="sheet-3" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-4 gap-0 border-b border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700 md:grid">
          <div>Particular</div>
          <div>Shift A</div>
          <div>Shift B</div>
          <div>Total</div>
        </div>

        {[
          { key: "production", label: "Production" },
          { key: "loomRun", label: "Loom Run" },
          { key: "wastage", label: "Wastage (kg)" },
        ].map((row) => (
          <div key={row.key} className="border-b border-slate-100 p-4">
            <p className="mb-3 font-semibold text-slate-800 md:hidden">{row.label}</p>
            <div className="grid gap-3 md:grid-cols-4 md:items-end">
              <p className="hidden text-sm font-medium text-slate-700 md:block">{row.label}</p>
              <NumericInput
                label="Shift A"
                value={form[`${row.key}A` as keyof typeof form]}
                disabled={readonly}
                onChange={(v) => setForm((f) => ({ ...f, [`${row.key}A`]: v } as typeof f))}
                className="md:hidden"
              />
              <NumericInput
                label="Shift B"
                value={form[`${row.key}B` as keyof typeof form]}
                disabled={readonly}
                onChange={(v) => setForm((f) => ({ ...f, [`${row.key}B`]: v } as typeof f))}
                className="md:hidden"
              />
              <div className="hidden md:block">
                <NumericInput
                  label=""
                  value={form[`${row.key}A` as keyof typeof form]}
                  disabled={readonly}
                  onChange={(v) => setForm((f) => ({ ...f, [`${row.key}A`]: v } as typeof f))}
                />
              </div>
              <div className="hidden md:block">
                <NumericInput
                  label=""
                  value={form[`${row.key}B` as keyof typeof form]}
                  disabled={readonly}
                  onChange={(v) => setForm((f) => ({ ...f, [`${row.key}B`]: v } as typeof f))}
                />
              </div>
              {row.key === "production" ? (
                <CalculatedField label="Total" value={calc.totalProduction} />
              ) : row.key === "loomRun" ? (
                <CalculatedField label="Total" value={calc.totalLoomRun} />
              ) : (
                <CalculatedField label="Total" value={calc.totalWastage} />
              )}
            </div>
          </div>
        ))}

        <div className="border-b border-slate-100 p-4">
          <p className="mb-3 font-semibold text-slate-800">Production Average</p>
          <div className="grid gap-3 md:grid-cols-3">
            <CalculatedField label="Shift A" value={calc.productionAvgA} />
            <CalculatedField label="Shift B" value={calc.productionAvgB} />
            <CalculatedField label="Total" value={calc.productionAvgTotal} />
          </div>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-3">
          <CalculatedField label="Wastage % Shift A" value={calc.wastagePercentA} suffix="%" />
          <CalculatedField label="Wastage % Shift B" value={calc.wastagePercentB} suffix="%" />
          <CalculatedField label="Total Wastage %" value={calc.wastagePercentTotal} suffix="%" />
        </div>
      </div>

      <SaveBar
        saving={saving}
        error={error}
        onSave={save}
        nextHref={`/entry/${dateKey}/sheet-4`}
        nextLabel="Next: Loom"
      />
    </div>
  );
}
