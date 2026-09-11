"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Gauge, Info, Layers, Moon, Sun, Trash2 } from "lucide-react";
import { calculateSheet3 } from "@/lib/calculations/mis-calculations";
import { CalculatedField } from "../CalculatedField";
import { NumericInput } from "../NumericInput";
import { EntryHeader } from "../EntryHeader";
import { SaveBar } from "../SaveBar";
import { SheetNav } from "../SheetNav";
import { EntrySkeleton } from "../EntrySkeleton";
import { useMisDay } from "@/hooks/useMisDay";

const rowsConfig = [
  { key: "production", label: "Production", icon: Layers, unit: "kg" },
  { key: "loomRun", label: "Loom Run", icon: Gauge, unit: "looms" },
  { key: "wastage", label: "Wastage", icon: Trash2, unit: "kg" },
] as const;

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
  const [saved, setSaved] = useState(false);
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

  const sanityWarning = useMemo(() => {
    const prodA = Number(form.productionA);
    const prodB = Number(form.productionB);
    const loomsA = Number(form.loomRunA);
    const loomsB = Number(form.loomRunB);
    const wstA = Number(form.wastageA);
    const wstB = Number(form.wastageB);

    if (prodA > 0 && loomsA === 0) {
      return "Notice: Shift A has production entered but Loom Run is 0.";
    }
    if (prodB > 0 && loomsB === 0) {
      return "Notice: Shift B has production entered but Loom Run is 0.";
    }
    if (prodA > 0 && wstA > prodA) {
      return "Notice: Shift A Wastage is greater than Production. Please verify the numbers.";
    }
    if (prodB > 0 && wstB > prodB) {
      return "Notice: Shift B Wastage is greater than Production. Please verify the numbers.";
    }
    return null;
  }, [form]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
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
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
      <EntryHeader dateKey={dateKey} status={data.status} title="Sheet 3 - Loom Production" />
      <SheetNav dateKey={dateKey} current="sheet-3" />

      {/* Guidance Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-xs font-medium text-sky-900 shadow-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
        <p>
          Enter Production, active Loom Run, and Wastage for Shift A & B. Production Average (Production ÷ Loom Run) and Wastage % calculate automatically.
        </p>
      </div>

      {/* Poka-Yoke Warning */}
      {sanityWarning ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold text-amber-900 shadow-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p>{sanityWarning}</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Shift Header */}
        <div className="hidden grid-cols-4 gap-0 border-b border-slate-200 bg-slate-50 p-3.5 text-xs font-bold text-slate-700 md:grid">
          <div>PARTICULAR</div>
          <div className="flex items-center gap-1.5 text-amber-900">
            <Sun className="h-4 w-4 text-amber-600" />
            <span>SHIFT A (DAY)</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-900">
            <Moon className="h-4 w-4 text-indigo-600" />
            <span>SHIFT B (NIGHT)</span>
          </div>
          <div className="text-slate-900">TOTAL (CALCULATED)</div>
        </div>

        {rowsConfig.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.key} className="border-b border-slate-100 p-4 last:border-0">
              <div className="mb-3 flex items-center gap-2 font-bold text-slate-900 md:hidden">
                <Icon className="h-4 w-4 text-sky-700" />
                <span>{row.label}</span>
                {row.unit ? <span className="text-xs font-normal text-slate-400">({row.unit})</span> : null}
              </div>

              <div className="grid gap-3.5 md:grid-cols-4 md:items-end">
                <div className="hidden items-center gap-2 text-sm font-bold text-slate-800 md:flex">
                  <Icon className="h-4 w-4 text-sky-700" />
                  <span>{row.label}</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 md:contents">
                  <NumericInput
                    label="Shift A (Day)"
                    unit={row.unit}
                    value={form[`${row.key}A` as keyof typeof form]}
                    disabled={readonly}
                    onChange={(v) => setForm((f) => ({ ...f, [`${row.key}A`]: v } as typeof f))}
                  />
                  <NumericInput
                    label="Shift B (Night)"
                    unit={row.unit}
                    value={form[`${row.key}B` as keyof typeof form]}
                    disabled={readonly}
                    onChange={(v) => setForm((f) => ({ ...f, [`${row.key}B`]: v } as typeof f))}
                  />
                </div>

                {row.key === "production" ? (
                  <CalculatedField label="Total Production" value={calc.totalProduction} suffix="kg" />
                ) : row.key === "loomRun" ? (
                  <CalculatedField label="Total Loom Run" value={calc.totalLoomRun} suffix="looms" />
                ) : (
                  <CalculatedField label="Total Wastage" value={calc.totalWastage} suffix="kg" />
                )}
              </div>
            </div>
          );
        })}

        {/* Calculated Production Averages */}
        <div className="border-t border-slate-100 bg-slate-50/40 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-700">
            Production Average (Production ÷ Loom Run)
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <CalculatedField label="Shift A Average" value={calc.productionAvgA} suffix="kg/loom" />
            <CalculatedField label="Shift B Average" value={calc.productionAvgB} suffix="kg/loom" />
            <CalculatedField label="Total Production Average" value={calc.productionAvgTotal} suffix="kg/loom" />
          </div>
        </div>

        {/* Wastage Percentages */}
        <div className="grid gap-3 border-t border-slate-100 bg-slate-50/80 p-4 md:grid-cols-3">
          <CalculatedField label="Wastage % Shift A" value={calc.wastagePercentA} suffix="%" />
          <CalculatedField label="Wastage % Shift B" value={calc.wastagePercentB} suffix="%" />
          <CalculatedField label="Total Wastage %" value={calc.wastagePercentTotal} suffix="%" />
        </div>
      </div>

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={save}
        nextHref={`/entry/${dateKey}/sheet-4`}
        nextLabel="Next: Loom Performance"
      />
    </div>
  );
}

