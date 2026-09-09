"use client";

import { useCallback, useEffect, useState } from "react";
import type { MisDayData } from "./useMisDay";

export function useDashboardData() {
  const [data, setData] = useState<MisDayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mis/dashboard");
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
    } catch {
      setError("Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const latest = data.length ? data[data.length - 1] : null;

  return { data, latest, loading, error, refresh };
}
