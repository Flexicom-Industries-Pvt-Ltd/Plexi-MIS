"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateSheet4Material, LOOM_MATERIALS } from "@/lib/calculations/mis-calculations";
import { CalculatedField } from "../CalculatedField";
import { NumericInput } from "../NumericInput";
import { EntryHeader } from "../EntryHeader";
import { SaveBar } from "../SaveBar";
import { SheetNav } from "../SheetNav";
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

export function Sheet4Form({ dateKey }: { dateKey: string }) {
  const { data, loading, error: loadError, setData } = useMisDay(dateKey);
  const [form, setForm] = useState<FormState>({
    PP: emptyMaterial(),
    LPP: emptyMaterial(),
    GB: emptyMaterial(),
  });
  const [saving, setSaving] = useState(false);
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

  const save = async () => {
    setSaving(true);
    setError(null);
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
      <EntryHeader dateKey={dateKey} status={data.status} title="Sheet 4 - Loom Performance" />
      <SheetNav dateKey={dateKey} current="sheet-4" />

      {LOOM_MATERIALS.map((material) => (
        <div key={material} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">{material}</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-sky-800">Shift A</p>
              <NumericInput
                label="Production"
                value={form[material].productionA}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], productionA: v } }))
                }
              />
              <NumericInput
                label="Looms Run"
                value={form[material].loomsRunA}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], loomsRunA: v } }))
                }
              />
              <CalculatedField label="Production per Loom" value={calc[material].productionPerLoomA} />
            </div>
            <div className="space-y-3 rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-semibold text-sky-800">Shift B</p>
              <NumericInput
                label="Production"
                value={form[material].productionB}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], productionB: v } }))
                }
              />
              <NumericInput
                label="Looms Run"
                value={form[material].loomsRunB}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], loomsRunB: v } }))
                }
              />
              <CalculatedField label="Production per Loom" value={calc[material].productionPerLoomB} />
            </div>
          </div>
        </div>
      ))}

      <SaveBar
        saving={saving}
        error={error}
        onSave={save}
        nextHref={`/entry/${dateKey}/review`}
        nextLabel="Review"
      />
    </div>
  );
}
