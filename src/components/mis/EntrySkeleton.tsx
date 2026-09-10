export function EntrySkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden="true">
      <div className="h-24 rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-slate-200" />
    </div>
  );
}
