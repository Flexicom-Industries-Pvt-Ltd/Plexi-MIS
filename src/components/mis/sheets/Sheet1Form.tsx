"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Info,
  Layers,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
} from "lucide-react";
import { calculateSheet1 } from "@/lib/calculations/mis-calculations";
import { CalculatedField } from "../CalculatedField";
import { NumericInput } from "../NumericInput";
import { EntryHeader } from "../EntryHeader";
import { SaveBar } from "../SaveBar";
import { SheetNav } from "../SheetNav";
import { EntrySkeleton } from "../EntrySkeleton";
import { useMisDay } from "@/hooks/useMisDay";

const fields = [
  { key: "production", label: "Production", icon: Layers, unit: "kg" },
  { key: "wastage", label: "Wastage", icon: Trash2, unit: "kg" },
  { key: "efficiency", label: "Efficiency", icon: Activity, unit: "%" },
  { key: "rp", label: "RP (Re-Production)", icon: RotateCcw, unit: "kg" },
] as const;

export function Sheet1Form({ dateKey }: { dateKey: string }) {
  const { data, loading, error: loadError, setData } = useMisDay(dateKey);
  const [form, setForm] = useState(() => ({
    productionA: String(data?.sheet1?.productionA ?? 0),
    productionB: String(data?.sheet1?.productionB ?? 0),
    wastageA: String(data?.sheet1?.wastageA ?? 0),
    wastageB: String(data?.sheet1?.wastageB ?? 0),
    efficiencyA: String(data?.sheet1?.efficiencyA ?? 0),
    efficiencyB: String(data?.sheet1?.efficiencyB ?? 0),
    rpA: String(data?.sheet1?.rpA ?? 0),
    rpB: String(data?.sheet1?.rpB ?? 0),
  }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readonly = data?.status === "LOCKED";

  useEffect(() => {
    if (!data?.sheet1) return;
    const s = data.sheet1;
    setForm({
      productionA: String(s.productionA ?? 0),
      productionB: String(s.productionB ?? 0),
      wastageA: String(s.wastageA ?? 0),
      wastageB: String(s.wastageB ?? 0),
      efficiencyA: String(s.efficiencyA ?? 0),
      efficiencyB: String(s.efficiencyB ?? 0),
      rpA: String(s.rpA ?? 0),
      rpB: String(s.rpB ?? 0),
    });
  }, [data]);

  const calc = useMemo(
    () =>
      calculateSheet1({
        productionA: Number(form.productionA),
        productionB: Number(form.productionB),
        wastageA: Number(form.wastageA),
        wastageB: Number(form.wastageB),
        efficiencyA: Number(form.efficiencyA),
        efficiencyB: Number(form.efficiencyB),
        rpA: Number(form.rpA),
        rpB: Number(form.rpB),
      }),
    [form],
  );

  // Soft Poka-Yoke sanity warnings
  const sanityWarning = useMemo(() => {
    const prodA = Number(form.productionA);
    const prodB = Number(form.productionB);
    const wstA = Number(form.wastageA);
    const wstB = Number(form.wastageB);

    if (prodA > 0 && wstA > prodA) {
      return "Notice: Shift A Wastage is greater than Production. Please verify the numbers.";
    }
    if (prodB > 0 && wstB > prodB) {
      return "Notice: Shift B Wastage is greater than Production. Please verify the numbers.";
    }
    if (prodA > 500000 || prodB > 500000) {
      return "Notice: Production value is unusually high (> 500,000 kg). Please ensure there are no extra zeros.";
    }
    return null;
  }, [form]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/mis/${dateKey}/sheet-1`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productionA: Number(form.productionA),
          productionB: Number(form.productionB),
          wastageA: Number(form.wastageA),
          wastageB: Number(form.wastageB),
          efficiencyA: Number(form.efficiencyA),
          efficiencyB: Number(form.efficiencyB),
          rpA: Number(form.rpA),
          rpB: Number(form.rpB),
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
      <EntryHeader dateKey={dateKey} status={data.status} title="Sheet 1 - Tape Plant Production" />
      <SheetNav dateKey={dateKey} current="sheet-1" />

      {/* Guidance Callout */}
      <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-xs font-medium text-sky-900 shadow-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
        <p>
          Enter Shift A (Day) and Shift B (Night) production, wastage, efficiency, and RP. Totals and wastage percentages calculate automatically.
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
        {/* Table Header with Shift Visual Anchors */}
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

        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key} className="border-b border-slate-100 p-4 last:border-0">
              <div className="mb-3 flex items-center gap-2 font-bold text-slate-900 md:hidden">
                <Icon className="h-4 w-4 text-sky-700" />
                <span>{field.label}</span>
                {field.unit ? <span className="text-xs font-normal text-slate-400">({field.unit})</span> : null}
              </div>

              <div className="grid gap-3.5 md:grid-cols-4 md:items-end">
                <div className="hidden items-center gap-2 text-sm font-bold text-slate-800 md:flex">
                  <Icon className="h-4 w-4 text-sky-700" />
                  <span>{field.label}</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 md:contents">
                  <NumericInput
                    label="Shift A (Day)"
                    unit={field.unit}
                    value={form[`${field.key}A` as keyof typeof form]}
                    disabled={readonly}
                    onChange={(v) => setForm((f) => ({ ...f, [`${field.key}A`]: v } as typeof f))}
                  />
                  <NumericInput
                    label="Shift B (Night)"
                    unit={field.unit}
                    value={form[`${field.key}B` as keyof typeof form]}
                    disabled={readonly}
                    onChange={(v) => setForm((f) => ({ ...f, [`${field.key}B`]: v } as typeof f))}
                  />
                </div>

                {field.key === "production" ? (
                  <CalculatedField label="Total Production" value={calc.totalProduction} suffix="kg" />
                ) : field.key === "wastage" ? (
                  <CalculatedField label="Total Wastage" value={calc.totalWastage} suffix="kg" />
                ) : field.key === "rp" ? (
                  <CalculatedField label="Total RP" value={calc.totalRp} suffix="kg" />
                ) : (
                  <div className="hidden md:block" />
                )}
              </div>
            </div>
          );
        })}

        <div className="grid gap-3 border-t border-slate-100 bg-slate-50/50 p-4 md:grid-cols-3">
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
        nextHref={`/entry/${dateKey}/sheet-2`}
        nextLabel="Next: Run MIS"
      />
    </div>
  );
}

