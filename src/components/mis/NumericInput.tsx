"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export function NumericInput({ label, value, onChange, disabled, className }: Props) {
  const id = useId();
  return (
    <div className={cn("block", className)}>
      {label ? (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        step="any"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-xl font-medium text-slate-900 shadow-sm sm:text-lg",
          "focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200",
          "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
          "min-h-[56px] touch-manipulation",
        )}
      />
    </div>
  );
}
