"use client";

import { useEffect, useMemo, useState } from "react";
import { Info, Moon, Sun, Layers } from "lucide-react";
import {
  aggregateSheet2,
  calculateSheet2Material,
  RUN_MATERIALS,
} from "@/lib/calculations/mis-calculations";
import { CalculatedField } from "../CalculatedField";
import { NumericInput } from "../NumericInput";
import { EntryHeader } from "../EntryHeader";
import { SaveBar } from "../SaveBar";
import { SheetNav } from "../SheetNav";
import { EntrySkeleton } from "../EntrySkeleton";
import { useMisDay } from "@/hooks/useMisDay";

type MaterialForm = {
  shiftA: string;
  shiftB: string;
  totalRunPlanned: string;
};

type FormState = Record<"PP" | "CC" | "RP" | "MB" | "TPT", MaterialForm>;

const emptyMaterial = (): MaterialForm => ({
  shiftA: "0",
  shiftB: "0",
  totalRunPlanned: "0",
});

const MATERIAL_NAMES: Record<string, string> = {
  PP: "Polypropylene (PP)",
  CC: "Calcium Carbonate (CC)",
  RP: "Recycled Polymer (RP)",
  MB: "Masterbatch (MB)",
  TPT: "Transparent (TPT)",
};

export function Sheet2Form({ dateKey }: { dateKey: string }) {
  const { data, loading, error: loadError, setData } = useMisDay(dateKey);
  const [form, setForm] = useState<FormState>({
    PP: emptyMaterial(),
    CC: emptyMaterial(),
    RP: emptyMaterial(),
    MB: emptyMaterial(),
    TPT: emptyMaterial(),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readonly = data?.status === "LOCKED";

  useEffect(() => {
    if (!data?.sheet2?.length) return;
    const next: FormState = {
      PP: emptyMaterial(),
      CC: emptyMaterial(),
      RP: emptyMaterial(),
      MB: emptyMaterial(),
      TPT: emptyMaterial(),
    };
    for (const row of data.sheet2) {
      const key = row.material as keyof FormState;
      next[key] = {
        shiftA: String(row.shiftA ?? 0),
        shiftB: String(row.shiftB ?? 0),
        totalRunPlanned: String(row.totalRunPlanned ?? 0),
      };
    }
    setForm(next);
  }, [data]);

  const calc = useMemo(() => {
    const out: Record<string, ReturnType<typeof calculateSheet2Material>> = {};
    for (const material of RUN_MATERIALS) {
      const m = form[material];
      out[material] = calculateSheet2Material({
        shiftA: Number(m.shiftA),
        shiftB: Number(m.shiftB),
        totalRunPlanned: Number(m.totalRunPlanned),
      });
    }
    return out;
  }, [form]);

  // Overall aggregate across 5 materials
  const aggregate = useMemo(() => {
    const rows = RUN_MATERIALS.map((material) => ({
      shiftA: Number(form[material].shiftA),
      shiftB: Number(form[material].shiftB),
      totalRunPlanned: Number(form[material].totalRunPlanned),
      ...calc[material],
    }));
    return aggregateSheet2(rows);
  }, [form, calc]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const body: Record<string, { shiftA: number; shiftB: number; totalRunPlanned: number }> = {};
      for (const material of RUN_MATERIALS) {
        body[material] = {
          shiftA: Number(form[material].shiftA),
          shiftB: Number(form[material].shiftB),
          totalRunPlanned: Number(form[material].totalRunPlanned),
        };
      }
      const res = await fetch(`/api/mis/${dateKey}/sheet-2`, {
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
      <EntryHeader dateKey={dateKey} status={data.status} title="Sheet 2 - Run MIS" />
      <SheetNav dateKey={dateKey} current="sheet-2" />

      {/* Guidance Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-xs font-medium text-sky-900 shadow-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
        <p>
          Enter actual run and planned run for all 5 materials (PP, CC, RP, MB, TPT). Total run and Gap % calculate automatically for each material.
        </p>
      </div>

      {/* Material Sections */}
      {RUN_MATERIALS.map((material) => (
        <div key={material} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-700 text-xs font-black text-white">
                {material}
              </span>
              <span className="text-sm font-bold text-slate-900">{MATERIAL_NAMES[material]}</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">Material Code: {material}</span>
          </div>

          <div className="hidden grid-cols-5 gap-3 border-b border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-600 md:grid">
            <div className="flex items-center gap-1.5 text-amber-900">
              <Sun className="h-4 w-4 text-amber-600" />
              <span>SHIFT A</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-900">
              <Moon className="h-4 w-4 text-indigo-600" />
              <span>SHIFT B</span>
            </div>
            <div className="text-slate-800">TOTAL RUN</div>
            <div className="text-slate-800">PLANNED RUN</div>
            <div className="text-slate-800">GAP %</div>
          </div>

          <div className="p-4">
            <div className="grid gap-3 md:grid-cols-5 md:items-end">
              <NumericInput
                label="Shift A (Day)"
                value={form[material].shiftA}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], shiftA: v } }))
                }
                className="md:hidden"
              />
              <NumericInput
                label="Shift B (Night)"
                value={form[material].shiftB}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], shiftB: v } }))
                }
                className="md:hidden"
              />
              <CalculatedField label="Total Run" value={calc[material].totalRun} className="md:hidden" />
              <NumericInput
                label="Planned Run"
                value={form[material].totalRunPlanned}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], totalRunPlanned: v } }))
                }
                className="md:hidden"
              />
              <CalculatedField label="Gap %" value={calc[material].gapPercent} suffix="%" className="md:hidden" />

              <div className="hidden md:block">
                <NumericInput
                  label=""
                  value={form[material].shiftA}
                  disabled={readonly}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, [material]: { ...f[material], shiftA: v } }))
                  }
                />
              </div>
              <div className="hidden md:block">
                <NumericInput
                  label=""
                  value={form[material].shiftB}
                  disabled={readonly}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, [material]: { ...f[material], shiftB: v } }))
                  }
                />
              </div>
              <div className="hidden md:block">
                <CalculatedField label="" value={calc[material].totalRun} />
              </div>
              <div className="hidden md:block">
                <NumericInput
                  label=""
                  value={form[material].totalRunPlanned}
                  disabled={readonly}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, [material]: { ...f[material], totalRunPlanned: v } }))
                  }
                />
              </div>
              <div className="hidden md:block">
                <CalculatedField label="" value={calc[material].gapPercent} suffix="%" />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Aggregate Totals Summary */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-sky-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900">
            All Materials Aggregate (Total)
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <CalculatedField label="Total Actual Run (All Materials)" value={aggregate.totalRun} />
          <CalculatedField label="Total Planned Run (All Materials)" value={aggregate.totalRunPlanned} />
          <CalculatedField label="Overall Gap %" value={aggregate.gapPercent} suffix="%" />
        </div>
      </div>

      <SaveBar
        saving={saving}
        saved={saved}
        error={error}
        onSave={save}
        nextHref={`/entry/${dateKey}/sheet-3`}
        nextLabel="Next: Performance"
      />
    </div>
  );
}

