"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateSheet1 } from "@/lib/calculations/mis-calculations";
import { CalculatedField } from "../CalculatedField";
import { NumericInput } from "../NumericInput";
import { EntryHeader } from "../EntryHeader";
import { SaveBar } from "../SaveBar";
import { SheetNav } from "../SheetNav";
import { EntrySkeleton } from "../EntrySkeleton";
import { useMisDay } from "@/hooks/useMisDay";

const fields = [
  { key: "production", label: "Production (kg)" },
  { key: "wastage", label: "Wastage (kg)" },
  { key: "efficiency", label: "Efficiency" },
  { key: "rp", label: "RP / Re-Production" },
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

  const save = async () => {
    setSaving(true);
    setError(null);
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
      <EntryHeader dateKey={dateKey} status={data.status} title="Sheet 1 - Production / Section A" />
      <SheetNav dateKey={dateKey} current="sheet-1" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-4 gap-0 border-b border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700 md:grid">
          <div>Particular</div>
          <div>Shift A</div>
          <div>Shift B</div>
          <div>Total</div>
        </div>

        {fields.map((field) => (
          <div key={field.key} className="border-b border-slate-100 p-4">
            <p className="mb-3 font-semibold text-slate-800 md:hidden">{field.label}</p>
            <div className="grid gap-3 md:grid-cols-4 md:items-end">
              <p className="hidden text-sm font-medium text-slate-700 md:block">{field.label}</p>
              <NumericInput
                label="Shift A"
                value={form[`${field.key}A` as keyof typeof form]}
                disabled={readonly}
                onChange={(v) => setForm((f) => ({ ...f, [`${field.key}A`]: v } as typeof f))}
                className="md:hidden"
              />
              <NumericInput
                label="Shift B"
                value={form[`${field.key}B` as keyof typeof form]}
                disabled={readonly}
                onChange={(v) => setForm((f) => ({ ...f, [`${field.key}B`]: v } as typeof f))}
                className="md:hidden"
              />
              <div className="hidden md:block">
                <NumericInput
                  label=""
                  value={form[`${field.key}A` as keyof typeof form]}
                  disabled={readonly}
                  onChange={(v) => setForm((f) => ({ ...f, [`${field.key}A`]: v } as typeof f))}
                />
              </div>
              <div className="hidden md:block">
                <NumericInput
                  label=""
                  value={form[`${field.key}B` as keyof typeof form]}
                  disabled={readonly}
                  onChange={(v) => setForm((f) => ({ ...f, [`${field.key}B`]: v } as typeof f))}
                />
              </div>
              {field.key === "production" ? (
                <CalculatedField label="Total" value={calc.totalProduction} />
              ) : field.key === "wastage" ? (
                <CalculatedField label="Total" value={calc.totalWastage} />
              ) : field.key === "rp" ? (
                <CalculatedField label="Total" value={calc.totalRp} />
              ) : (
                <div className="hidden md:block" />
              )}
            </div>
          </div>
        ))}

        <div className="grid gap-3 p-4 md:grid-cols-3">
          <CalculatedField label="Wastage % Shift A" value={calc.wastagePercentA} suffix="%" />
          <CalculatedField label="Wastage % Shift B" value={calc.wastagePercentB} suffix="%" />
          <CalculatedField label="Total Wastage %" value={calc.wastagePercentTotal} suffix="%" />
        </div>
      </div>

      <SaveBar saving={saving} error={error} onSave={save} nextHref={`/entry/${dateKey}/sheet-2`} />
    </div>
  );
}
