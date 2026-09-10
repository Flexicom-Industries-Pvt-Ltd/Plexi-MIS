import { describe, expect, it } from "vitest";
import {
  aggregateSheet2,
  calculateSheet1,
  calculateSheet2Material,
  calculateSheet3,
  calculateSheet4Material,
  percent,
} from "../mis-calculations";

describe("Sheet 1 - Production / Section A", () => {
  it("calculates totals and wastage percentages", () => {
    const result = calculateSheet1({
      productionA: 1000,
      productionB: 800,
      wastageA: 50,
      wastageB: 40,
      efficiencyA: 92,
      efficiencyB: 88,
      rpA: 10,
      rpB: 5,
    });

    expect(result.totalProduction).toBe(1800);
    expect(result.totalWastage).toBe(90);
    expect(result.totalRp).toBe(15);
    expect(result.wastagePercentA).toBe(5);
    expect(result.wastagePercentB).toBe(5);
    expect(result.wastagePercentTotal).toBe(5);
  });

  it("handles zero production without division errors", () => {
    const result = calculateSheet1({
      productionA: 0,
      productionB: 100,
      wastageA: 0,
      wastageB: 5,
      efficiencyA: 0,
      efficiencyB: 90,
      rpA: 0,
      rpB: 0,
    });

    expect(result.wastagePercentA).toBe(0);
    expect(result.wastagePercentB).toBe(5);
    expect(result.wastagePercentTotal).toBe(5);
  });
});

describe("Sheet 2 - Run MIS", () => {
  it("calculates total run and gap percent per material", () => {
    const result = calculateSheet2Material({
      shiftA: 120,
      shiftB: 80,
      totalRunPlanned: 250,
    });

    expect(result.totalRun).toBe(200);
    expect(result.gapPercent).toBe(20);
  });

  it("handles zero planned run", () => {
    const result = calculateSheet2Material({
      shiftA: 50,
      shiftB: 50,
      totalRunPlanned: 0,
    });

    expect(result.totalRun).toBe(100);
    expect(result.gapPercent).toBe(0);
  });

  it("aggregates totals across PP, CC, RP, MB, TPT", () => {
    const rows = [
      { shiftA: 100, shiftB: 50, totalRunPlanned: 200, ...calculateSheet2Material({ shiftA: 100, shiftB: 50, totalRunPlanned: 200 }) },
      { shiftA: 80, shiftB: 70, totalRunPlanned: 180, ...calculateSheet2Material({ shiftA: 80, shiftB: 70, totalRunPlanned: 180 }) },
    ];
    const totals = aggregateSheet2(rows);
    expect(totals.totalRun).toBe(300);
    expect(totals.totalRunPlanned).toBe(380);
    expect(totals.gapPercent).toBeCloseTo(21.05, 1);
  });
});

describe("Sheet 3 - Production Performance", () => {
  it("calculates production average and wastage", () => {
    const result = calculateSheet3({
      productionA: 70500,
      productionB: 60000,
      loomRunA: 30,
      loomRunB: 25,
      wastageA: 1500,
      wastageB: 1200,
    });

    expect(result.totalProduction).toBe(130500);
    expect(result.totalLoomRun).toBe(55);
    expect(result.totalWastage).toBe(2700);
    expect(result.productionAvgA).toBe(2350);
    expect(result.productionAvgB).toBe(2400);
    expect(result.productionAvgTotal).toBeCloseTo(2372.73, 1);
    expect(result.wastagePercentA).toBeCloseTo(2.13, 1);
    expect(result.wastagePercentB).toBe(2);
  });

  it("handles zero loom run", () => {
    const result = calculateSheet3({
      productionA: 100,
      productionB: 0,
      loomRunA: 0,
      loomRunB: 10,
      wastageA: 5,
      wastageB: 0,
    });

    expect(result.productionAvgA).toBe(0);
    expect(result.productionAvgB).toBe(0);
    expect(result.productionAvgTotal).toBe(10);
  });
});

describe("Sheet 4 - Loom Performance", () => {
  it("calculates production per loom for PP", () => {
    const result = calculateSheet4Material({
      productionA: 70500,
      loomsRunA: 30,
      productionB: 60000,
      loomsRunB: 25,
    });

    expect(result.productionPerLoomA).toBe(2350);
    expect(result.productionPerLoomB).toBe(2400);
  });

  it("handles zero looms for LPP and GB pattern", () => {
    expect(
      calculateSheet4Material({
        productionA: 1000,
        loomsRunA: 0,
        productionB: 500,
        loomsRunB: 10,
      }).productionPerLoomA,
    ).toBe(0);

    expect(
      calculateSheet4Material({
        productionA: 0,
        loomsRunA: 5,
        productionB: 800,
        loomsRunB: 0,
      }).productionPerLoomB,
    ).toBe(0);
  });
});

describe("percent helper", () => {
  it("supports decimals", () => {
    expect(percent(1.5, 10)).toBe(15);
  });
});
