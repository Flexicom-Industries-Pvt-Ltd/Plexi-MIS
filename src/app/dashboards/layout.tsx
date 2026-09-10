import { Suspense } from "react";

export default function DashboardsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<p className="p-4 text-slate-500">Loading dashboard...</p>}>{children}</Suspense>;
}
