import { cn } from "@/lib/utils";

const styles = {
  DRAFT: "bg-amber-100 text-amber-800",
  SUBMITTED: "bg-emerald-100 text-emerald-800",
  LOCKED: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ status }: { status: "DRAFT" | "SUBMITTED" | "LOCKED" }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide", styles[status])}>
      {status}
    </span>
  );
}
