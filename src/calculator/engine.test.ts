/**
 * Unit tests for the calculation engine.
 * Covers report examples: partial year, two employers, degree credit.
 */

import { describe, it, expect } from "vitest";
import { calculate } from "./engine";
import type { CalculatorInput, Form106Entry, QuestionnaireAnswers } from "@/types/wizard";

describe("engine", () => {
  it("partial year example: 60k income, 5.5k withheld, 2.25 points → refund 5,500", () => {
    const input: CalculatorInput = {
      year: 2024,
      forms: [
        {
          taxableIncome: 60_000,
          incomeTaxWithheld: 5_500,
          creditPointsGranted: 0,
        },
      ] as Form106Entry[],
      questionnaire: { isIsraeliResidentFullYear: "yes" } as QuestionnaireAnswers,
    };
    const r = calculate(input);
    expect(r.refundEstimate).toBe(5_500);
    expect(r.underpaymentEstimate).toBe(0);
    expect(r.totals.liability).toBe(0);
    expect(r.totals.grossTax).toBe(6_000); // 60k * 10%
    expect(r.totals.creditPointsValue).toBe(2.25 * 2_904);
  });

  it("two employers: 120k+120k, withheld 12k+30k → refund 6,060", () => {
    const input: CalculatorInput = {
      year: 2024,
      forms: [
        { taxableIncome: 120_000, incomeTaxWithheld: 12_000, creditPointsGranted: 2.25 },
        { taxableIncome: 120_000, incomeTaxWithheld: 30_000, creditPointsGranted: 0 },
      ] as Form106Entry[],
      questionnaire: { isIsraeliResidentFullYear: "yes" } as QuestionnaireAnswers,
    };
    const r = calculate(input);
    expect(r.refundEstimate).toBe(6_060);
    expect(r.totals.taxableIncomeTotal).toBe(240_000);
    expect(r.totals.withheldTotal).toBe(42_000);
    expect(r.totals.liability).toBe(35_940);
  });

  it("degree credit: 180k income, 20k withheld, 3.75 points → refund ~5,498", () => {
    const input: CalculatorInput = {
      year: 2024,
      forms: [
        {
          taxableIncome: 180_000,
          incomeTaxWithheld: 20_000,
          creditPointsGranted: 2.25,
        },
      ] as Form106Entry[],
      questionnaire: {
        isIsraeliResidentFullYear: "yes",
        genderForCredit: "yes",
        degreeType: "first",
        graduationYear: 2023,
      } as QuestionnaireAnswers,
    };
    const r = calculate(input);
    expect(r.refundEstimate).toBe(5_498);
    expect(r.totals.creditPointsValue).toBe(3.75 * 2_904);
  });

  it("donation credit reduces liability", () => {
    const input: CalculatorInput = {
      year: 2024,
      forms: [
        { taxableIncome: 100_000, incomeTaxWithheld: 10_000, creditPointsGranted: 2.25 },
      ] as Form106Entry[],
      questionnaire: {
        isIsraeliResidentFullYear: "yes",
        donations46Total: 10_000,
      } as QuestionnaireAnswers,
    };
    const r = calculate(input);
    expect(r.totals.liability).toBeLessThan(
      100_000 * 0.1 - 2.25 * 2_904
    );
    expect(r.breakdownItems.some((b) => b.key === "donation")).toBe(true);
  });

  it("zero income with withheld triggers warning", () => {
    const input: CalculatorInput = {
      year: 2024,
      forms: [
        { taxableIncome: 0, incomeTaxWithheld: 1_000, creditPointsGranted: 0 },
      ] as Form106Entry[],
    };
    const r = calculate(input);
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.warnings.some((w) => w.includes("הכנסה חייבת 0"))).toBe(true);
  });

  it("complexity flag lowers confidence", () => {
    const input: CalculatorInput = {
      year: 2024,
      forms: [
        {
          taxableIncome: 100_000,
          incomeTaxWithheld: 10_000,
          creditPointsGranted: 2.25,
          hasComplexityFlags: true,
        },
      ] as Form106Entry[],
    };
    const r = calculate(input);
    expect(r.confidence).toBe("low");
  });
});
