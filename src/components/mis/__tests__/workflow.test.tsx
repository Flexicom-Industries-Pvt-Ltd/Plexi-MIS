import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalculatedField } from "../CalculatedField";
import { NumericInput } from "../NumericInput";
import {
  calculateSheet1,
  calculateSheet2,
  calculateSheet3,
  calculateSheet4Material,
} from "@/lib/calculations/mis-calculations";

describe("Critical MIS workflow calculations", () => {
  it("sheet 1 through 4 produce expected values for sample day", () => {
    const s1 = calculateSheet1({
      productionA: 1000,
      productionB: 900,
      wastageA: 30,
      wastageB: 27,
      efficiencyA: 95,
      efficiencyB: 93,
      rpA: 5,
      rpB: 3,
    });
    expect(s1.totalProduction).toBe(1900);

    const s2 = calculateSheet2({ shiftA: 120, shiftB: 110, totalRunPlanned: 250 });
    expect(s2.totalRun).toBe(230);

    const s3 = calculateSheet3({
      productionA: 70500,
      productionB: 60000,
      loomRunA: 30,
      loomRunB: 25,
      wastageA: 1500,
      wastageB: 1200,
    });
    expect(s3.productionAvgA).toBe(2350);

    const s4 = calculateSheet4Material({
      productionA: 70500,
      loomsRunA: 30,
      productionB: 60000,
      loomsRunB: 25,
    });
    expect(s4.productionPerLoomA).toBe(2350);
  });

  it("distinguishes input vs calculated UI", () => {
    render(<NumericInput label="Production" value="100" onChange={() => undefined} />);
    render(<CalculatedField label="Total" value={200} />);

    expect(screen.getByLabelText("Production")).not.toBeDisabled();
    expect(screen.getByText("200.00")).toBeInTheDocument();
  });
});
