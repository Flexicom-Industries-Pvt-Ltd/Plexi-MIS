import { subDays, startOfDay } from "date-fns";
import { db } from "@/lib/db";
import {
  LOOM_MATERIALS,
  RUN_MATERIALS,
  round2,
  type Sheet1Input,
  type Sheet2MaterialInput,
  type Sheet3Input,
  type Sheet4MaterialInput,
} from "@/lib/calculations/mis-calculations";
import {
  parseDateKey,
  saveSheet1,
  saveSheet2,
  saveSheet3,
  saveSheet4,
  toDateKey,
} from "@/lib/mis/service";

const MIS_INCLUDE = {
  productionSectionA: true,
  runMaterials: true,
  productionPerformance: true,
  loomMaterials: true,
} as const;

const DEFAULT_TEMPLATE = {
  sheet1: {
    productionA: 1250,
    productionB: 1180,
    wastageA: 62,
    wastageB: 59,
    efficiencyA: 91,
    efficiencyB: 87,
    rpA: 14,
    rpB: 11,
  },
  sheet2: {
    PP: { shiftA: 120, shiftB: 115, totalRunPlanned: 250 },
    CC: { shiftA: 95, shiftB: 90, totalRunPlanned: 200 },
    RP: { shiftA: 80, shiftB: 75, totalRunPlanned: 170 },
    MB: { shiftA: 70, shiftB: 68, totalRunPlanned: 150 },
    TPT: { shiftA: 55, shiftB: 52, totalRunPlanned: 120 },
  },
  sheet3: {
    productionA: 1100,
    productionB: 1050,
    loomRunA: 48,
    loomRunB: 46,
    wastageA: 55,
    wastageB: 50,
  },
  sheet4: {
    PP: { productionA: 2400, loomsRunA: 12, productionB: 2300, loomsRunB: 11 },
    LPP: { productionA: 1800, loomsRunA: 10, productionB: 1750, loomsRunB: 10 },
    GB: { productionA: 1500, loomsRunA: 8, productionB: 1450, loomsRunB: 8 },
  },
};

function num(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return Number(value);
}

function hasMeaningfulData(
  day: NonNullable<Awaited<ReturnType<typeof db.misDay.findFirst<{ include: typeof MIS_INCLUDE }>>>>,
): boolean {
  const production = num(day.productionSectionA?.totalProduction);
  const run = day.runMaterials.reduce((sum, row) => sum + num(row.totalRun), 0);
  return production > 0 || run > 0;
}

function scaleValue(value: number, dayOffset: number): number {
  const factors = [0.94, 0.97, 1, 1.03, 1.06, 1.02];
  const factor = factors[dayOffset % factors.length];
  return round2(value * factor);
}

async function findTemplateDay() {
  const days = await db.misDay.findMany({
    orderBy: { date: "desc" },
    take: 14,
    include: MIS_INCLUDE,
  });

  const yesterdayKey = toDateKey(subDays(startOfDay(new Date()), 1));
  const yesterday = days.find((day) => toDateKey(day.date) === yesterdayKey);
  if (yesterday && hasMeaningfulData(yesterday)) return yesterday;

  return days.find(hasMeaningfulData) ?? null;
}

function templateFromDay(
  day: NonNullable<Awaited<ReturnType<typeof findTemplateDay>>>,
): typeof DEFAULT_TEMPLATE {
  const sheet2 = RUN_MATERIALS.reduce(
    (acc, material) => {
      const row = day.runMaterials.find((entry) => entry.material === material);
      acc[material] = {
        shiftA: num(row?.shiftA),
        shiftB: num(row?.shiftB),
        totalRunPlanned: num(row?.totalRunPlanned),
      };
      return acc;
    },
    {} as Record<"PP" | "CC" | "RP" | "MB" | "TPT", Sheet2MaterialInput>,
  );

  const sheet4 = LOOM_MATERIALS.reduce(
    (acc, material) => {
      const row = day.loomMaterials.find((entry) => entry.material === material);
      acc[material] = {
        productionA: num(row?.productionA),
        loomsRunA: num(row?.loomsRunA),
        productionB: num(row?.productionB),
        loomsRunB: num(row?.loomsRunB),
      };
      return acc;
    },
    {} as Record<"PP" | "LPP" | "GB", Sheet4MaterialInput>,
  );

  return {
    sheet1: {
      productionA: num(day.productionSectionA?.productionA),
      productionB: num(day.productionSectionA?.productionB),
      wastageA: num(day.productionSectionA?.wastageA),
      wastageB: num(day.productionSectionA?.wastageB),
      efficiencyA: num(day.productionSectionA?.efficiencyA),
      efficiencyB: num(day.productionSectionA?.efficiencyB),
      rpA: num(day.productionSectionA?.rpA),
      rpB: num(day.productionSectionA?.rpB),
    },
    sheet2,
    sheet3: {
      productionA: num(day.productionPerformance?.productionA),
      productionB: num(day.productionPerformance?.productionB),
      loomRunA: num(day.productionPerformance?.loomRunA),
      loomRunB: num(day.productionPerformance?.loomRunB),
      wastageA: num(day.productionPerformance?.wastageA),
      wastageB: num(day.productionPerformance?.wastageB),
    },
    sheet4,
  };
}

function scaledTemplate(base: typeof DEFAULT_TEMPLATE, dayOffset: number) {
  const sheet1: Sheet1Input = {
    productionA: scaleValue(base.sheet1.productionA, dayOffset),
    productionB: scaleValue(base.sheet1.productionB, dayOffset),
    wastageA: scaleValue(base.sheet1.wastageA, dayOffset),
    wastageB: scaleValue(base.sheet1.wastageB, dayOffset),
    efficiencyA: base.sheet1.efficiencyA,
    efficiencyB: base.sheet1.efficiencyB,
    rpA: scaleValue(base.sheet1.rpA, dayOffset),
    rpB: scaleValue(base.sheet1.rpB, dayOffset),
  };

  const sheet2 = RUN_MATERIALS.reduce(
    (acc, material) => {
      const row = base.sheet2[material];
      acc[material] = {
        shiftA: scaleValue(row.shiftA, dayOffset),
        shiftB: scaleValue(row.shiftB, dayOffset),
        totalRunPlanned: scaleValue(row.totalRunPlanned, dayOffset),
      };
      return acc;
    },
    {} as Record<"PP" | "CC" | "RP" | "MB" | "TPT", Sheet2MaterialInput>,
  );

  const sheet3: Sheet3Input = {
    productionA: scaleValue(base.sheet3.productionA, dayOffset),
    productionB: scaleValue(base.sheet3.productionB, dayOffset),
    loomRunA: scaleValue(base.sheet3.loomRunA, dayOffset),
    loomRunB: scaleValue(base.sheet3.loomRunB, dayOffset),
    wastageA: scaleValue(base.sheet3.wastageA, dayOffset),
    wastageB: scaleValue(base.sheet3.wastageB, dayOffset),
  };

  const sheet4 = LOOM_MATERIALS.reduce(
    (acc, material) => {
      const row = base.sheet4[material];
      acc[material] = {
        productionA: scaleValue(row.productionA, dayOffset),
        loomsRunA: Math.max(1, Math.round(scaleValue(row.loomsRunA, dayOffset))),
        productionB: scaleValue(row.productionB, dayOffset),
        loomsRunB: Math.max(1, Math.round(scaleValue(row.loomsRunB, dayOffset))),
      };
      return acc;
    },
    {} as Record<"PP" | "LPP" | "GB", Sheet4MaterialInput>,
  );

  return { sheet1, sheet2, sheet3, sheet4 };
}

export async function deleteAllMisData() {
  const result = await db.misDay.deleteMany({});
  return { deletedDays: result.count };
}

export async function simulateMisDays(dayCount = 6) {
  const templateDay = await findTemplateDay();
  const base = templateDay ? templateFromDay(templateDay) : DEFAULT_TEMPLATE;
  const templateSource = templateDay ? toDateKey(templateDay.date) : "built-in defaults";

  const createdDates: string[] = [];

  for (let offset = dayCount; offset >= 1; offset -= 1) {
    const dateKey = toDateKey(subDays(startOfDay(new Date()), offset));
    await db.misDay.deleteMany({ where: { date: parseDateKey(dateKey) } });

    const payload = scaledTemplate(base, dayCount - offset);
    await saveSheet1(dateKey, payload.sheet1);
    await saveSheet2(dateKey, payload.sheet2);
    await saveSheet3(dateKey, payload.sheet3);
    await saveSheet4(dateKey, payload.sheet4);

    const status = offset <= 2 ? "DRAFT" : offset <= 4 ? "SUBMITTED" : "LOCKED";
    await db.misDay.update({
      where: { date: parseDateKey(dateKey) },
      data: { status },
    });

    createdDates.push(dateKey);
  }

  return {
    createdDays: createdDates.length,
    dates: createdDates,
    templateSource,
  };
}
