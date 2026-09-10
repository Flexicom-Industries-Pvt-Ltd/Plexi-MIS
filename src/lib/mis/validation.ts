import { z } from "zod";

const nonNegative = z.coerce.number().min(0, "Cannot be negative");

export const sheet1Schema = z.object({
  productionA: nonNegative,
  productionB: nonNegative,
  wastageA: nonNegative,
  wastageB: nonNegative,
  efficiencyA: nonNegative,
  efficiencyB: nonNegative,
  rpA: nonNegative,
  rpB: nonNegative,
});

export const sheet2MaterialSchema = z.object({
  shiftA: nonNegative,
  shiftB: nonNegative,
  totalRunPlanned: nonNegative,
});

export const sheet2Schema = z.object({
  PP: sheet2MaterialSchema,
  CC: sheet2MaterialSchema,
  RP: sheet2MaterialSchema,
  MB: sheet2MaterialSchema,
  TPT: sheet2MaterialSchema,
});

export const sheet3Schema = z.object({
  productionA: nonNegative,
  productionB: nonNegative,
  loomRunA: nonNegative,
  loomRunB: nonNegative,
  wastageA: nonNegative,
  wastageB: nonNegative,
});

export const sheet4MaterialSchema = z.object({
  productionA: nonNegative,
  loomsRunA: nonNegative,
  productionB: nonNegative,
  loomsRunB: nonNegative,
});

export const sheet4Schema = z.object({
  PP: sheet4MaterialSchema,
  LPP: sheet4MaterialSchema,
  GB: sheet4MaterialSchema,
});
