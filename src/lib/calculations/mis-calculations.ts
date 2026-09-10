/** Central calculation logic for all four MIS sheets. */

export function toNum(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return round2((numerator / denominator) * 100);
}

export function divide(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return round2(numerator / denominator);
}

// Sheet 1 — Production / Section A
export type Sheet1Input = {
  productionA: number;
  productionB: number;
  wastageA: number;
  wastageB: number;
  efficiencyA: number;
  efficiencyB: number;
  rpA: number;
  rpB: number;
};

export type Sheet1Calculated = {
  totalProduction: number;
  totalWastage: number;
  totalRp: number;
  wastagePercentA: number;
  wastagePercentB: number;
  wastagePercentTotal: number;
};

export function calculateSheet1(input: Sheet1Input): Sheet1Calculated {
  const productionA = toNum(input.productionA);
  const productionB = toNum(input.productionB);
  const wastageA = toNum(input.wastageA);
  const wastageB = toNum(input.wastageB);
  const rpA = toNum(input.rpA);
  const rpB = toNum(input.rpB);

  const totalProduction = round2(productionA + productionB);
  const totalWastage = round2(wastageA + wastageB);
  const totalRp = round2(rpA + rpB);

  return {
    totalProduction,
    totalWastage,
    totalRp,
    wastagePercentA: percent(wastageA, productionA),
    wastagePercentB: percent(wastageB, productionB),
    wastagePercentTotal: percent(totalWastage, totalProduction),
  };
}

// Sheet 2 — Run MIS (per material)
export type Sheet2MaterialInput = {
  shiftA: number;
  shiftB: number;
  totalRunPlanned: number;
};

export type Sheet2MaterialCalculated = {
  totalRun: number;
  gapPercent: number;
};

export function calculateSheet2Material(
  input: Sheet2MaterialInput,
): Sheet2MaterialCalculated {
  const shiftA = toNum(input.shiftA);
  const shiftB = toNum(input.shiftB);
  const totalRunPlanned = toNum(input.totalRunPlanned);
  const totalRun = round2(shiftA + shiftB);

  const gapPercent =
    totalRunPlanned <= 0
      ? 0
      : round2(((totalRunPlanned - totalRun) / totalRunPlanned) * 100);

  return { totalRun, gapPercent };
}

export const RUN_MATERIALS = ["PP", "CC", "RP", "MB", "TPT"] as const;
export type RunMaterialCode = (typeof RUN_MATERIALS)[number];

/** Aggregate totals across all run materials for dashboards. */
export function aggregateSheet2(
  rows: Array<Sheet2MaterialInput & Sheet2MaterialCalculated>,
) {
  const totalRun = round2(rows.reduce((sum, r) => sum + toNum(r.totalRun), 0));
  const totalRunPlanned = round2(rows.reduce((sum, r) => sum + toNum(r.totalRunPlanned), 0));
  const gapPercent =
    totalRunPlanned <= 0
      ? 0
      : round2(((totalRunPlanned - totalRun) / totalRunPlanned) * 100);

  return { totalRun, totalRunPlanned, gapPercent };
}

// Sheet 3 — Production Performance
export type Sheet3Input = {
  productionA: number;
  productionB: number;
  loomRunA: number;
  loomRunB: number;
  wastageA: number;
  wastageB: number;
};

export type Sheet3Calculated = {
  totalProduction: number;
  totalLoomRun: number;
  totalWastage: number;
  productionAvgA: number;
  productionAvgB: number;
  productionAvgTotal: number;
  wastagePercentA: number;
  wastagePercentB: number;
  wastagePercentTotal: number;
};

export function calculateSheet3(input: Sheet3Input): Sheet3Calculated {
  const productionA = toNum(input.productionA);
  const productionB = toNum(input.productionB);
  const loomRunA = toNum(input.loomRunA);
  const loomRunB = toNum(input.loomRunB);
  const wastageA = toNum(input.wastageA);
  const wastageB = toNum(input.wastageB);

  const totalProduction = round2(productionA + productionB);
  const totalLoomRun = round2(loomRunA + loomRunB);
  const totalWastage = round2(wastageA + wastageB);

  return {
    totalProduction,
    totalLoomRun,
    totalWastage,
    productionAvgA: divide(productionA, loomRunA),
    productionAvgB: divide(productionB, loomRunB),
    productionAvgTotal: divide(totalProduction, totalLoomRun),
    wastagePercentA: percent(wastageA, productionA),
    wastagePercentB: percent(wastageB, productionB),
    wastagePercentTotal: percent(totalWastage, totalProduction),
  };
}

// Sheet 4 — Loom Performance (per material)
export type Sheet4MaterialInput = {
  productionA: number;
  loomsRunA: number;
  productionB: number;
  loomsRunB: number;
};

export type Sheet4MaterialCalculated = {
  productionPerLoomA: number;
  productionPerLoomB: number;
};

export function calculateSheet4Material(
  input: Sheet4MaterialInput,
): Sheet4MaterialCalculated {
  const productionA = toNum(input.productionA);
  const loomsRunA = toNum(input.loomsRunA);
  const productionB = toNum(input.productionB);
  const loomsRunB = toNum(input.loomsRunB);

  return {
    productionPerLoomA: divide(productionA, loomsRunA),
    productionPerLoomB: divide(productionB, loomsRunB),
  };
}

export const LOOM_MATERIALS = ["PP", "LPP", "GB"] as const;
export type LoomMaterialCode = (typeof LOOM_MATERIALS)[number];

function average(values: number[]): number {
  if (!values.length) return 0;
  return round2(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export type OverallAggregated = {
  dayCount: number;
  fromDate: string;
  toDate: string;
  sheet1: {
    productionA: number;
    productionB: number;
    totalProduction: number;
    totalWastage: number;
    wastagePercentTotal: number;
    efficiencyA: number;
    efficiencyB: number;
    totalRp: number;
  } | null;
  sheet2: Array<{
    material: string;
    shiftA: number;
    shiftB: number;
    totalRunPlanned: number;
    totalRun: number;
    gapPercent: number;
  }>;
  sheet2Totals: ReturnType<typeof aggregateSheet2>;
  sheet3: {
    productionAvgTotal: number;
  } | null;
  sheet4: Array<{
    material: string;
    productionPerLoomA: number;
    productionPerLoomB: number;
  }>;
};

/** Sum/average metrics across multiple MIS days for the Overall dashboard. */
export function aggregateOverallDashboard(
  days: Array<{
    date: string;
    sheet1: Record<string, number> | null;
    sheet2: Array<{
      material: string;
      shiftA: number;
      shiftB: number;
      totalRunPlanned: number;
      totalRun: number;
      gapPercent: number;
    }>;
    sheet3: Record<string, number> | null;
    sheet4: Array<{
      material: string;
      productionPerLoomA: number;
      productionPerLoomB: number;
    }>;
  }>,
): OverallAggregated | null {
  if (!days.length) return null;

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const sheet1Days = sorted.filter((day) => day.sheet1);

  const sheet1 = sheet1Days.length
    ? (() => {
        const productionA = round2(sheet1Days.reduce((sum, day) => sum + toNum(day.sheet1!.productionA), 0));
        const productionB = round2(sheet1Days.reduce((sum, day) => sum + toNum(day.sheet1!.productionB), 0));
        const wastageA = round2(sheet1Days.reduce((sum, day) => sum + toNum(day.sheet1!.wastageA), 0));
        const wastageB = round2(sheet1Days.reduce((sum, day) => sum + toNum(day.sheet1!.wastageB), 0));
        const totalProduction = round2(productionA + productionB);
        const totalWastage = round2(wastageA + wastageB);

        return {
          productionA,
          productionB,
          totalProduction,
          totalWastage,
          wastagePercentTotal: percent(totalWastage, totalProduction),
          efficiencyA: average(sheet1Days.map((day) => toNum(day.sheet1!.efficiencyA))),
          efficiencyB: average(sheet1Days.map((day) => toNum(day.sheet1!.efficiencyB))),
          totalRp: round2(sheet1Days.reduce((sum, day) => sum + toNum(day.sheet1!.totalRp), 0)),
        };
      })()
    : null;

  const runByMaterial = new Map<string, { shiftA: number; shiftB: number; totalRunPlanned: number }>();
  for (const day of sorted) {
    for (const row of day.sheet2) {
      const current = runByMaterial.get(row.material) ?? { shiftA: 0, shiftB: 0, totalRunPlanned: 0 };
      runByMaterial.set(row.material, {
        shiftA: round2(current.shiftA + toNum(row.shiftA)),
        shiftB: round2(current.shiftB + toNum(row.shiftB)),
        totalRunPlanned: round2(current.totalRunPlanned + toNum(row.totalRunPlanned)),
      });
    }
  }

  const sheet2 = RUN_MATERIALS.map((material) => {
    const inputs = runByMaterial.get(material) ?? { shiftA: 0, shiftB: 0, totalRunPlanned: 0 };
    const calculated = calculateSheet2Material(inputs);
    return { material, ...inputs, ...calculated };
  });
  const sheet2Totals = aggregateSheet2(sheet2);

  const sheet3Days = sorted.filter((day) => day.sheet3);
  const sheet3 = sheet3Days.length
    ? {
        productionAvgTotal: average(sheet3Days.map((day) => toNum(day.sheet3!.productionAvgTotal))),
      }
    : null;

  const sheet4 = LOOM_MATERIALS.map((material) => {
    const perLoomA: number[] = [];
    const perLoomB: number[] = [];

    for (const day of sorted) {
      const row = day.sheet4.find((entry) => entry.material === material);
      if (row) {
        perLoomA.push(toNum(row.productionPerLoomA));
        perLoomB.push(toNum(row.productionPerLoomB));
      }
    }

    return {
      material,
      productionPerLoomA: average(perLoomA),
      productionPerLoomB: average(perLoomB),
    };
  });

  return {
    dayCount: sorted.length,
    fromDate: sorted[0].date,
    toDate: sorted[sorted.length - 1].date,
    sheet1,
    sheet2,
    sheet2Totals,
    sheet3,
    sheet4,
  };
}
