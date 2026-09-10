"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateSheet2Material, RUN_MATERIALS } from "@/lib/calculations/mis-calculations";
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

  const save = async () => {
    setSaving(true);
    setError(null);
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

      <p className="text-sm text-slate-600">
        Enter run data for each material. Gap % shows planned run not achieved.
      </p>

      {RUN_MATERIALS.map((material) => (
        <div key={material} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <h2 className="text-lg font-bold text-slate-900">{material}</h2>
          </div>

          <div className="hidden grid-cols-6 gap-0 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 md:grid">
            <div>Material</div>
            <div>A (Shift A)</div>
            <div>B (Shift B)</div>
            <div>Total Run</div>
            <div>Total Run Planned</div>
            <div>Gap %</div>
          </div>

          <div className="p-4">
            <div className="grid gap-3 md:grid-cols-6 md:items-end">
              <p className="font-semibold text-slate-800 md:hidden">{material}</p>
              <NumericInput
                label="A (Shift A)"
                value={form[material].shiftA}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], shiftA: v } }))
                }
                className="md:hidden"
              />
              <NumericInput
                label="B (Shift B)"
                value={form[material].shiftB}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], shiftB: v } }))
                }
                className="md:hidden"
              />
              <CalculatedField label="Total Run" value={calc[material].totalRun} className="md:hidden" />
              <NumericInput
                label="Total Run Planned"
                value={form[material].totalRunPlanned}
                disabled={readonly}
                onChange={(v) =>
                  setForm((f) => ({ ...f, [material]: { ...f[material], totalRunPlanned: v } }))
                }
                className="md:hidden"
              />
              <CalculatedField label="Gap %" value={calc[material].gapPercent} suffix="%" className="md:hidden" />

              <p className="hidden text-sm font-medium text-slate-700 md:block">{material}</p>
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
