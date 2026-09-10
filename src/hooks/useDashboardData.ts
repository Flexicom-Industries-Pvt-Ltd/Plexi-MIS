"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getCachedDashboard, setCachedDashboard } from "@/lib/mis/mis-day-cache";
import type { MisDayData } from "@/types/mis-day";

export function useDashboardData() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  const [data, setData] = useState<MisDayData[]>(() => getCachedDashboard() ?? []);
  const [loading, setLoading] = useState(() => !getCachedDashboard());
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (silent = false) => {
    const cached = getCachedDashboard();
    if (!silent && !cached) setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mis/dashboard", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as MisDayData[];
      setCachedDashboard(json);
      setData(json);
    } catch {
      if (!getCachedDashboard()) {
        setError("Could not load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = getCachedDashboard();
    if (cached) {
      setData(cached);
      setLoading(false);
      refresh(true);
    } else {
      refresh(false);
    }
  }, [refresh]);

  const latest = data.length ? data[data.length - 1] : null;

  const selected = useMemo(() => {
    if (!dateParam) return latest;
    return data.find((day) => day.date === dateParam) ?? null;
  }, [data, dateParam, latest]);

  return { data, latest, selected, selectedDate: dateParam, loading, error, refresh };
}
