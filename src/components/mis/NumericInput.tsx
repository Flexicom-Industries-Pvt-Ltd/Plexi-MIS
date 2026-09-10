"use client";

import { useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  unit?: string;
  placeholder?: string;
  className?: string;
};

export function NumericInput({
  label,
  value,
  onChange,
  disabled,
  unit,
  placeholder = "0",
  className,
}: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Find all visible numeric inputs in the form / page and focus the next one
      const inputs = Array.from(
        document.querySelectorAll<HTMLInputElement>("input[type='number']:not([disabled])"),
      );
      const currentIndex = inputs.indexOf(e.currentTarget);
      if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
        inputs[currentIndex + 1].select();
      }
    }
  };

  const showClear = !disabled && value !== "" && value !== "0";

  return (
    <div className={cn("block", className)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>{label}</span>
          {unit ? <span className="text-[11px] font-medium text-slate-400">({unit})</span> : null}
        </label>
      ) : null}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={(e) => e.target.select()}
          onKeyDown={handleKeyDown}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-xl font-semibold text-slate-900 shadow-sm sm:text-lg",
            "transition-colors duration-150 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
            "min-h-[56px] touch-manipulation scroll-mt-24 scroll-mb-36",
            unit || showClear ? "pr-14" : "",
          )}
        />
        <div className="absolute right-2 flex items-center gap-1.5">
          {showClear ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                onChange("0");
                inputRef.current?.focus();
                inputRef.current?.select();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              aria-label="Clear value"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {unit && !showClear ? (
            <span className="select-none px-1 text-xs font-semibold text-slate-400">
              {unit}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

