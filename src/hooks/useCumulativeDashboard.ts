"use client";

import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import {
  aggregateOverallDashboard,
  type OverallAggregated,
} from "@/lib/calculations/mis-calculations";
import type { MisDayData } from "@/types/mis-day";
import { useDashboardData } from "@/hooks/useDashboardData";

export function formatDashboardPeriodSummary(
  cumulative: OverallAggregated,
  selectedDate: string | null,
): string {
  if (selectedDate) {
    return `Cumulative through ${format(parseISO(cumulative.toDate), "d MMM yyyy")} (${cumulative.dayCount} day${cumulative.dayCount === 1 ? "" : "s"})`;
  }

  return `Cumulative across all days (${cumulative.dayCount} day${cumulative.dayCount === 1 ? "" : "s"}, ${format(parseISO(cumulative.fromDate), "d MMM")} – ${format(parseISO(cumulative.toDate), "d MMM yyyy")})`;
}

export function useCumulativeDashboard() {
  const { data, selectedDate, loading, error } = useDashboardData();

  const daysForPeriod = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    if (!selectedDate) return sorted;
    return sorted.filter((day) => day.date <= selectedDate);
  }, [data, selectedDate]);

  const cumulative = useMemo(() => aggregateOverallDashboard(daysForPeriod), [daysForPeriod]);

  const periodSummary = cumulative ? formatDashboardPeriodSummary(cumulative, selectedDate) : undefined;

  return {
    data: daysForPeriod as MisDayData[],
    cumulative,
    periodSummary,
    selectedDate,
    loading,
    error,
    hasData: Boolean(cumulative),
  };
}
