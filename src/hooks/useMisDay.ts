"use client";

import { useCallback, useEffect, useState } from "react";

export type MisDayData = {
  id: string;
  date: string;
  status: "DRAFT" | "SUBMITTED" | "LOCKED";
  sheet1: Record<string, number> | null;
  sheet2: Record<string, number> | null;
  sheet3: Record<string, number> | null;
  sheet4: Array<{
    material: string;
    productionA: number;
    loomsRunA: number;
    productionPerLoomA: number;
    productionB: number;
    loomsRunB: number;
    productionPerLoomB: number;
  }>;
};

export function useMisDay(dateKey: string) {
  const [data, setData] = useState<MisDayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/mis/${dateKey}`);
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
    } catch {
      setError("Could not load today's MIS. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dateKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh, setData };
}
