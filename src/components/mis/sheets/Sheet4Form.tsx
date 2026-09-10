"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Info, Moon, Sun } from "lucide-react";
import { calculateSheet4Material, LOOM_MATERIALS } from "@/lib/calculations/mis-calculations";
import { CalculatedField } from "../CalculatedField";
import { NumericInput } from "../NumericInput";
import { EntryHeader } from "../EntryHeader";
import { SaveBar } from "../SaveBar";
import { SheetNav } from "../SheetNav";
import { EntrySkeleton } from "../EntrySkeleton";
import { useMisDay } from "@/hooks/useMisDay";

type MaterialForm = {
  productionA: string;
  loomsRunA: string;
  productionB: string;
  loomsRunB: string;
};

type FormState = Record<"PP" | "LPP" | "GB", MaterialForm>;

const emptyMaterial = (): MaterialForm => ({
  productionA: "0",
  loomsRunA: "0",
  productionB: "0",
  loomsRunB: "0",
});

const LOOM_MATERIAL_INFO: Record<string, { label: string; desc: string }> = {
  PP: { label: "PP (Polypropylene)", desc: "Standard PP woven fabric" },
  LPP: { label: "LPP (Laminated PP)", desc: "Laminated fabric weave" },
  GB: { label: "GB (Gusseted / Bags)", desc: "Gusseted bag fabric" },
};

export function Sheet4Form({ dateKey }: { dateKey: string }) {
  const { data, loading, error: loadError, setData } = useMisDay(dateKey);
  const [form, setForm] = useState<FormState>({
    PP: emptyMaterial(),
    LPP: emptyMaterial(),
    GB: emptyMaterial(),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readonly = data?.status === "LOCKED";

  useEffect(() => {
    if (!data?.sheet4?.length) return;
    const next: FormState = { PP: emptyMaterial(), LPP: emptyMaterial(), GB: emptyMaterial() };
    for (const row of data.sheet4) {
      const key = row.material as "PP" | "LPP" | "GB";
      next[key] = {
        productionA: String(row.productionA ?? 0),
        loomsRunA: String(row.loomsRunA ?? 0),
        productionB: String(row.productionB ?? 0),
        loomsRunB: String(row.loomsRunB ?? 0),
      };
    }
    setForm(next);
  }, [data]);

  const calc = useMemo(() => {
    const out: Record<string, ReturnType<typeof calculateSheet4Material>> = {};
    for (const material of LOOM_MATERIALS) {
      const m = form[material];
      out[material] = calculateSheet4Material({
        productionA: Number(m.productionA),
        loomsRunA: Number(m.loomsRunA),
        productionB: Number(m.productionB),
        loomsRunB: Number(m.loomsRunB),
      });
    }
    return out;
  }, [form]);

  const sanityWarning = useMemo(() => {
    for (const material of LOOM_MATERIALS) {
      const m = form[material];
      const prodA = Number(m.productionA);
      const loomsA = Number(m.loomsRunA);
      const prodB = Number(m.productionB);
      const loomsB = Number(m.loomsRunB);

      if (prodA > 0 && loomsA === 0) {
        return `Notice: ${material} has Shift A production entered but Looms Run is 0.`;
      }
      if (prodB > 0 && loomsB === 0) {
        return `Notice: ${material} has Shift B production entered but Looms Run is 0.`;
      }
    }
    return null;
  }, [form]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body: Record<string, { productionA: number; loomsRunA: number; productionB: number; loomsRunB: number }> = {};
      for (const material of LOOM_MATERIALS) {
        body[material] = {
          productionA: Number(form[material].productionA),
          loomsRunA: Number(form[material].loomsRunA),
          productionB: Number(form[material].productionB),
          loomsRunB: Number(form[material].loomsRunB),
        };
      }
      const res = await fetch(`/api/mis/${dateKey}/sheet-4`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      <EntryHeader dateKey={dateKey} status={data.status} title="Sheet 4 - Loom Performance" />
      <SheetNav dateKey={dateKey} current="sheet-4" />

      {/* Guidance Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-xs font-medium text-sky-900 shadow-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
        <p>
          Enter Production and active Looms Run for PP, LPP, and GB fabrics across Shift A (Day) and Shift B (Night). Production per Loom (Production ÷ Looms Run) calculates automatically.
        </p>
      </div>

      {/* Poka-Yoke Warning */}
      {sanityWarning ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold text-amber-900 shadow-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p>{sanityWarning}</p>
        </div>
      ) : null}

      {LOOM_MATERIALS.map((material) => (
        <div key={material} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-800 text-xs font-black text-white">
                {material}
              </span>
              <span className="text-base font-bold text-slate-900">{LOOM_MATERIAL_INFO[material].label}</span>
            </div>
            <span className="text-xs font-medium text-slate-500">{LOOM_MATERIAL_INFO[material].desc}</span>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-2">
            {/* Shift A Card */}
            <div className="space-y-3 rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white p-4">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sun className="h-4 w-4 text-amber-600" />
                  <span>SHIFT A (DAY)</span>
                </div>
                <span className="text-[11px] font-medium text-amber-700">Material: {material}</span>
              </div>
              <NumericInput
                label="Production"
                unit="meters/kg"
                value={form[material].productionA}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], productionA: v } }))
                }
              />
              <NumericInput
                label="Looms Run"
                unit="looms"
                value={form[material].loomsRunA}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], loomsRunA: v } }))
                }
              />
              <CalculatedField
                label="Production per Loom"
                value={calc[material].productionPerLoomA}
                suffix="/loom"
              />
            </div>

            {/* Shift B Card */}
            <div className="space-y-3 rounded-xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/40 to-white p-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <Moon className="h-4 w-4 text-indigo-600" />
                  <span>SHIFT B (NIGHT)</span>
                </div>
                <span className="text-[11px] font-medium text-indigo-700">Material: {material}</span>
              </div>
              <NumericInput
                label="Production"
                unit="meters/kg"
                value={form[material].productionB}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], productionB: v } }))
                }
              />
              <NumericInput
                label="Looms Run"
                unit="looms"
                value={form[material].loomsRunB}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], loomsRunB: v } }))
                }
              />
              <CalculatedField
                label="Production per Loom"
                value={calc[material].productionPerLoomB}
                suffix="/loom"
              />
            </div>
          </div>
        </div>
      ))}

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={save}
        nextHref={`/entry/${dateKey}/review`}
        nextLabel="Next: Review & Submit"
      />
    </div>
  );
}

