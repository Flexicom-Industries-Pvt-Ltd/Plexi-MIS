import type { MisDayData } from "@/types/mis-day";

const dayCache = new Map<string, MisDayData>();
let dashboardCache: { data: MisDayData[]; fetchedAt: number } | null = null;

const DASHBOARD_TTL_MS = 60_000;

export function getCachedMisDay(dateKey: string): MisDayData | null {
  return dayCache.get(dateKey) ?? null;
}

export function setCachedMisDay(dateKey: string, data: MisDayData): void {
  dayCache.set(dateKey, data);
}

export function getCachedDashboard(): MisDayData[] | null {
  if (!dashboardCache) return null;
  if (Date.now() - dashboardCache.fetchedAt > DASHBOARD_TTL_MS) return null;
  return dashboardCache.data;
}

export function setCachedDashboard(data: MisDayData[]): void {
  dashboardCache = { data, fetchedAt: Date.now() };
}

export function invalidateMisDay(dateKey: string): void {
  dayCache.delete(dateKey);
  dashboardCache = null;
}

export function clearAllCaches(): void {
  dayCache.clear();
  dashboardCache = null;
}
