"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getCachedMisDay, setCachedMisDay } from "@/lib/mis/mis-day-cache";
import type { MisDayData } from "@/types/mis-day";

type MisDayContextValue = {
  dateKey: string;
  data: MisDayData | null;
  loading: boolean;
  error: string | null;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  setData: (data: MisDayData) => void;
};

const MisDayContext = createContext<MisDayContextValue | null>(null);

const SHEET_ROUTES = ["sheet-1", "sheet-2", "sheet-3", "sheet-4", "review"];

export function MisDayProvider({ dateKey, children }: { dateKey: string; children: ReactNode }) {
  const router = useRouter();
  const [data, setDataState] = useState<MisDayData | null>(() => getCachedMisDay(dateKey));
  const [loading, setLoading] = useState(() => !getCachedMisDay(dateKey));
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef<Promise<void> | null>(null);

  const setData = useCallback(
    (next: MisDayData) => {
      setCachedMisDay(dateKey, next);
      setDataState(next);
    },
    [dateKey],
  );

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      if (inflight.current) {
        await inflight.current;
        return;
      }

      const silent = options?.silent ?? !!getCachedMisDay(dateKey);
      if (!silent) setLoading(true);
      setError(null);

      const task = (async () => {
        try {
          const res = await fetch(`/api/mis/${dateKey}`, { cache: "no-store" });
          if (!res.ok) throw new Error("Failed to load");
          const json = (await res.json()) as MisDayData;
          setCachedMisDay(dateKey, json);
          setDataState(json);
        } catch {
          if (!getCachedMisDay(dateKey)) {
            setError("Could not load today's MIS. Please try again.");
          }
        } finally {
          setLoading(false);
          inflight.current = null;
        }
      })();

      inflight.current = task;
      await task;
    },
    [dateKey],
  );

  useEffect(() => {
    const cached = getCachedMisDay(dateKey);
    setDataState(cached);
    setLoading(!cached);
    refresh({ silent: !!cached });
  }, [dateKey, refresh]);

  useEffect(() => {
    for (const route of SHEET_ROUTES) {
      router.prefetch(`/entry/${dateKey}/${route}`);
    }
  }, [dateKey, router]);

  const value = useMemo(
    () => ({ dateKey, data, loading, error, refresh, setData }),
    [dateKey, data, loading, error, refresh, setData],
  );

  return <MisDayContext.Provider value={value}>{children}</MisDayContext.Provider>;
}

export function useMisDay(dateKey?: string) {
  const ctx = useContext(MisDayContext);
  if (!ctx) {
    throw new Error("useMisDay must be used within MisDayProvider (entry layout).");
  }
  if (dateKey && dateKey !== ctx.dateKey) {
    throw new Error("useMisDay dateKey does not match entry layout date.");
  }
  return ctx;
}
