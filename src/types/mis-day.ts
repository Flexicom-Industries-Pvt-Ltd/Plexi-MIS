export type RunMaterialRow = {
  material: string;
  shiftA: number;
  shiftB: number;
  totalRunPlanned: number;
  totalRun: number;
  gapPercent: number;
};

export type Sheet2Totals = {
  totalRun: number;
  totalRunPlanned: number;
  gapPercent: number;
};

export type MisDayData = {
  id: string;
  date: string;
  status: "DRAFT" | "SUBMITTED" | "LOCKED";
  sheet1: Record<string, number> | null;
  sheet2: RunMaterialRow[];
  sheet2Totals: Sheet2Totals;
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
