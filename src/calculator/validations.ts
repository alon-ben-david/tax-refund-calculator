/**
 * Validation helpers for wizard steps.
 * Inline errors near fields; aligned with report rules.
 */

import type { Form106Entry, Step1Input, TaxYear } from "@/types/wizard";

const TAX_YEARS_SET = new Set<TaxYear>([2020, 2021, 2022, 2023, 2024, 2025]);

export function validateStep1(step1: Step1Input | null): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!step1) {
    errors.year = "נא לבחור שנת מס";
    errors.formCount = "נא להזין מספר טפסי 106";
    return errors;
  }
  if (!TAX_YEARS_SET.has(step1.year)) {
    errors.year = "שנת מס חייבת להיות בין 2020 ל-2025";
  }
  if (
    typeof step1.formCount !== "number" ||
    step1.formCount < 1 ||
    step1.formCount > 20
  ) {
    errors.formCount = "מספר טפסי 106 בין 1 ל-20";
  }
  return errors;
}

export function validateForm106Entry(
  entry: Form106Entry,
  index: number
): Record<string, string> {
  const prefix = `form_${index}_`;
  const errors: Record<string, string> = {};
  if (entry.taxableIncome < 0) {
    errors[`${prefix}taxableIncome`] = "הכנסה חייבת אינה יכולה להיות שלילית";
  }
  if (entry.incomeTaxWithheld < 0) {
    errors[`${prefix}incomeTaxWithheld`] = "מס שנוכה אינו יכול להיות שלילי";
  }
  if (
    entry.taxableIncome > 0 &&
    entry.incomeTaxWithheld > entry.taxableIncome
  ) {
    errors[`${prefix}incomeTaxWithheld`] =
      "נראה שהמס שנוכה גדול מההכנסה החייבת — בדוק/י שזה שדה 042 (מס הכנסה שנוכה) ולא דמי ביטוח לאומי.";
  }
  const cp = entry.creditPointsGranted ?? 0;
  if (cp < 0 || cp > 10) {
    errors[`${prefix}creditPointsGranted`] =
      "נקודות זיכוי בין 0 ל-10 (אם אין — אפשר 0)";
  }
  return errors;
}

export function validateStep2(forms: Form106Entry[]): Record<string, string> {
  const errors: Record<string, string> = {};
  forms.forEach((entry, i) => {
    Object.assign(errors, validateForm106Entry(entry, i));
  });
  return errors;
}
