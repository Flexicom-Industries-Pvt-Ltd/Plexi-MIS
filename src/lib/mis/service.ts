import { format, parseISO, startOfDay } from "date-fns";
import type { LoomMaterial, MisDayStatus } from "@/generated/prisma";
import { db } from "@/lib/db";
import {
  calculateSheet1,
  calculateSheet2,
  calculateSheet3,
  calculateSheet4Material,
  LOOM_MATERIALS,
} from "@/lib/calculations/mis-calculations";
import type { Sheet1Input, Sheet2Input, Sheet3Input, Sheet4MaterialInput } from "@/lib/calculations/mis-calculations";

const MIS_INCLUDE = {
  productionSectionA: true,
  runSheet: true,
  productionPerformance: true,
  loomMaterials: true,
} as const;

export function parseDateKey(dateKey: string): Date {
  return startOfDay(parseISO(dateKey));
}

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayKey(): string {
  return toDateKey(new Date());
}

async function ensureMisDay(dateKey: string) {
  const date = parseDateKey(dateKey);
  let misDay = await db.misDay.findUnique({
    where: { date },
    include: MIS_INCLUDE,
  });

  if (!misDay) {
    misDay = await db.misDay.create({
      data: {
        date,
        productionSectionA: { create: {} },
        runSheet: { create: {} },
        productionPerformance: { create: {} },
        loomMaterials: {
          create: LOOM_MATERIALS.map((material) => ({ material: material as LoomMaterial })),
        },
      },
      include: MIS_INCLUDE,
    });
  } else if (misDay.loomMaterials.length < 3) {
    for (const material of LOOM_MATERIALS) {
      await db.loomMaterialRow.upsert({
        where: { misDayId_material: { misDayId: misDay.id, material: material as LoomMaterial } },
        create: { misDayId: misDay.id, material: material as LoomMaterial },
        update: {},
      });
    }
    misDay = await db.misDay.findUniqueOrThrow({
      where: { id: misDay.id },
      include: MIS_INCLUDE,
    });
  }

  return misDay;
}

function assertEditable(status: MisDayStatus) {
  if (status === "LOCKED") {
    throw new Error("This day's MIS is locked and cannot be edited.");
  }
}

export async function getMisDay(dateKey: string) {
  return ensureMisDay(dateKey);
}

export async function listMisHistory(limit = 60) {
  return db.misDay.findMany({
    orderBy: { date: "desc" },
    take: limit,
    select: {
      id: true,
      date: true,
      status: true,
      updatedAt: true,
    },
  });
}

export async function saveSheet1(dateKey: string, input: Sheet1Input) {
  const misDay = await ensureMisDay(dateKey);
  assertEditable(misDay.status);
  const calc = calculateSheet1(input);

  await db.productionSectionA.upsert({
    where: { misDayId: misDay.id },
    create: {
      misDayId: misDay.id,
      ...input,
      ...calc,
    },
    update: {
      ...input,
      ...calc,
    },
  });

  return getMisDay(dateKey);
}

export async function saveSheet2(dateKey: string, input: Sheet2Input) {
  const misDay = await ensureMisDay(dateKey);
  assertEditable(misDay.status);
  const calc = calculateSheet2(input);

  await db.runSheet.upsert({
    where: { misDayId: misDay.id },
    create: { misDayId: misDay.id, ...input, ...calc },
    update: { ...input, ...calc },
  });

  return getMisDay(dateKey);
}

export async function saveSheet3(dateKey: string, input: Sheet3Input) {
  const misDay = await ensureMisDay(dateKey);
  assertEditable(misDay.status);
  const calc = calculateSheet3(input);

  await db.productionPerformance.upsert({
    where: { misDayId: misDay.id },
    create: { misDayId: misDay.id, ...input, ...calc },
    update: { ...input, ...calc },
  });

  return getMisDay(dateKey);
}

export async function saveSheet4(
  dateKey: string,
  materials: Record<"PP" | "LPP" | "GB", Sheet4MaterialInput>,
) {
  const misDay = await ensureMisDay(dateKey);
  assertEditable(misDay.status);

  for (const material of LOOM_MATERIALS) {
    const input = materials[material];
    const calc = calculateSheet4Material(input);
    await db.loomMaterialRow.upsert({
      where: { misDayId_material: { misDayId: misDay.id, material: material as LoomMaterial } },
      create: { misDayId: misDay.id, material: material as LoomMaterial, ...input, ...calc },
      update: { ...input, ...calc },
    });
  }

  return getMisDay(dateKey);
}

export async function submitMisDay(dateKey: string) {
  const misDay = await ensureMisDay(dateKey);
  assertEditable(misDay.status);

  return db.misDay.update({
    where: { id: misDay.id },
    data: { status: "SUBMITTED" },
    include: MIS_INCLUDE,
  });
}

export async function lockMisDay(dateKey: string) {
  const misDay = await ensureMisDay(dateKey);
  if (misDay.status === "LOCKED") return misDay;

  return db.misDay.update({
    where: { id: misDay.id },
    data: { status: "LOCKED" },
    include: MIS_INCLUDE,
  });
}

export async function getDashboardData(limit = 30) {
  const days = await db.misDay.findMany({
    orderBy: { date: "desc" },
    take: limit,
    include: MIS_INCLUDE,
  });

  return days.reverse();
}

export function serializeMisDay(misDay: Awaited<ReturnType<typeof getMisDay>>) {
  const num = (v: { toString(): string } | number | null | undefined) =>
    v == null ? 0 : Number(v);

  return {
    id: misDay.id,
    date: toDateKey(misDay.date),
    status: misDay.status,
    sheet1: misDay.productionSectionA
      ? {
          productionA: num(misDay.productionSectionA.productionA),
          productionB: num(misDay.productionSectionA.productionB),
          wastageA: num(misDay.productionSectionA.wastageA),
          wastageB: num(misDay.productionSectionA.wastageB),
          efficiencyA: num(misDay.productionSectionA.efficiencyA),
          efficiencyB: num(misDay.productionSectionA.efficiencyB),
          rpA: num(misDay.productionSectionA.rpA),
          rpB: num(misDay.productionSectionA.rpB),
          totalProduction: num(misDay.productionSectionA.totalProduction),
          totalWastage: num(misDay.productionSectionA.totalWastage),
          totalRp: num(misDay.productionSectionA.totalRp),
          wastagePercentA: num(misDay.productionSectionA.wastagePercentA),
          wastagePercentB: num(misDay.productionSectionA.wastagePercentB),
          wastagePercentTotal: num(misDay.productionSectionA.wastagePercentTotal),
        }
      : null,
    sheet2: misDay.runSheet
      ? {
          shiftA: num(misDay.runSheet.shiftA),
          shiftB: num(misDay.runSheet.shiftB),
          totalRunPlanned: num(misDay.runSheet.totalRunPlanned),
          totalRun: num(misDay.runSheet.totalRun),
          gapPercent: num(misDay.runSheet.gapPercent),
        }
      : null,
    sheet3: misDay.productionPerformance
      ? {
          productionA: num(misDay.productionPerformance.productionA),
          productionB: num(misDay.productionPerformance.productionB),
          loomRunA: num(misDay.productionPerformance.loomRunA),
          loomRunB: num(misDay.productionPerformance.loomRunB),
          wastageA: num(misDay.productionPerformance.wastageA),
          wastageB: num(misDay.productionPerformance.wastageB),
          totalProduction: num(misDay.productionPerformance.totalProduction),
          totalLoomRun: num(misDay.productionPerformance.totalLoomRun),
          totalWastage: num(misDay.productionPerformance.totalWastage),
          productionAvgA: num(misDay.productionPerformance.productionAvgA),
          productionAvgB: num(misDay.productionPerformance.productionAvgB),
          productionAvgTotal: num(misDay.productionPerformance.productionAvgTotal),
          wastagePercentA: num(misDay.productionPerformance.wastagePercentA),
          wastagePercentB: num(misDay.productionPerformance.wastagePercentB),
          wastagePercentTotal: num(misDay.productionPerformance.wastagePercentTotal),
        }
      : null,
    sheet4: misDay.loomMaterials.map((row) => ({
      material: row.material,
      productionA: num(row.productionA),
      loomsRunA: num(row.loomsRunA),
      productionPerLoomA: num(row.productionPerLoomA),
      productionB: num(row.productionB),
      loomsRunB: num(row.loomsRunB),
      productionPerLoomB: num(row.productionPerLoomB),
    })),
  };
}
