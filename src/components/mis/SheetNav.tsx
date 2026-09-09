"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const sheets = [
  { n: 1, label: "Production", href: "sheet-1" },
  { n: 2, label: "Run", href: "sheet-2" },
  { n: 3, label: "Performance", href: "sheet-3" },
  { n: 4, label: "Loom", href: "sheet-4" },
  { n: 5, label: "Review", href: "review" },
];

export function SheetNav({ dateKey, current }: { dateKey: string; current: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {sheets.map((sheet) => (
        <Link
          key={sheet.href}
          href={`/entry/${dateKey}/${sheet.href}`}
          className={cn(
            "rounded-xl border px-3 py-3 text-center text-sm font-semibold",
            current === sheet.href
              ? "border-sky-500 bg-sky-50 text-sky-800"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
          )}
        >
          {sheet.n}. {sheet.label}
        </Link>
      ))}
    </div>
  );
}
