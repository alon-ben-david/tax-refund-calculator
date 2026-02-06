/**
 * Pure calculation engine: inputs → result + breakdown.
 * Logic from deep-research-report.md (TaxByBrackets, credits, liability, refund).
 */

import type {
  CalculatorInput,
  CalculationResult,
  BreakdownItem,
  Form106Entry,
  QuestionnaireAnswers,
} from "@/types/wizard";
import { getYearParams } from "./constants";

/** Tax by brackets: Σ (min(income, upper_i) - lower_i) * rate_i. */
function taxByBrackets(
  income: number,
  brackets: { upperLimit: number; rate: number }[]
): number {
  let tax = 0;
  let prevUpper = 0;
  for (const b of brackets) {
    const band = Math.min(income, b.upperLimit) - prevUpper;
    if (band <= 0) break;
    tax += band * b.rate;
    prevUpper = b.upperLimit;
    if (income <= b.upperLimit) break;
  }
  return tax;
}

/** Surtax 3% above threshold. */
function surtax(
  income: number,
  threshold: number,
  rate: number
): number {
  if (income <= threshold) return 0;
  return (income - threshold) * rate;
}

/** Base residency points: 2.25 for Israeli resident full year. */
const BASE_RESIDENCY_POINTS = 2.25;

/** Woman credit: 0.5 points (optional). */
const GENDER_CREDIT_POINTS = 0.5;

/** Degree credit: 1 point for first degree (e.g. grad 2023+ for 2024). Simplified: 1 point if graduation year within last 3 years. */
function degreePoints(
  graduationYear: number | undefined,
  taxYear: number,
  degreeType: string | undefined
): number {
  if (!graduationYear || degreeType === "none" || !degreeType) return 0;
  const yearsSince = taxYear - graduationYear;
  if (yearsSince >= 0 && yearsSince <= 3) return 1;
  return 0;
}

/** Children points: simplified placeholder (per report: varies by age/year; 2024 changes 0–5). We use 0.5 per child up to 5. */
function childrenPoints(birthYears: number[] | undefined, taxYear: number): number {
  if (!birthYears?.length) return 0;
  let points = 0;
  for (const y of birthYears) {
    const age = taxYear - y;
    if (age >= 0 && age <= 18) points += 0.5;
  }
  return Math.min(points, 3); // cap for sanity
}

/** Donation credit: 35% of eligible amount; eligible = min(donations, 30% of taxable income). */
function donationCredit(
  donations46: number | undefined,
  taxableIncome: number
): number {
  if (!donations46 || donations46 <= 0 || taxableIncome <= 0) return 0;
  const eligible = Math.min(donations46, 0.3 * taxableIncome);
  return 0.35 * eligible;
}

/** Compute total credit points (base estimate vs improved from questionnaire). */
function totalCreditPoints(
  forms: Form106Entry[],
  questionnaire: QuestionnaireAnswers | undefined,
  year: number
): number {
  const fromForms = forms.reduce((s, f) => s + (f.creditPointsGranted ?? 0), 0);
  if (!questionnaire) return fromForms;

  const resident = questionnaire.isIsraeliResidentFullYear === "yes";
  const woman = questionnaire.genderForCredit === "yes";
  const deg = degreePoints(
    questionnaire.graduationYear,
    year,
    questionnaire.degreeType
  );
  const child = childrenPoints(questionnaire.childrenBirthYears, year);

  const basePoints = resident ? BASE_RESIDENCY_POINTS : fromForms;
  const extra = (woman ? GENDER_CREDIT_POINTS : 0) + deg + child;
  return basePoints + extra;
}

/** Build assumptions list (human-readable). */
function buildAssumptions(
  input: CalculatorInput,
  creditPointsTotal: number,
  usedQuestionnaire: boolean
): string[] {
  const a: string[] = [];
  a.push(`שנת מס: ${input.year}`);
  a.push(`מספר טפסי 106: ${input.forms.length}`);
  a.push(
    `הכנסה חייבת כוללת: ${input.forms.reduce((s, f) => s + f.taxableIncome, 0).toLocaleString("he-IL")} ₪`
  );
  a.push(
    `מס שנוכה כולל: ${input.forms.reduce((s, f) => s + f.incomeTaxWithheld, 0).toLocaleString("he-IL")} ₪`
  );
  a.push(`נקודות זיכוי שנכללו בחישוב: ${creditPointsTotal.toFixed(2)}`);
  if (usedQuestionnaire) {
    a.push("אומדן משופר: נעשה שימוש בשאלון השלמה (תושבות, ילדים, תואר, תרומות).");
  } else {
    a.push("אומדן בסיסי: רק נתוני טופס 106, ללא שאלון השלמה.");
  }
  return a;
}

/** Confidence: high/medium/low from report rules. */
function confidence(
  input: CalculatorInput,
  hasWarnings: boolean
): "high" | "medium" | "low" {
  const hasComplexity = input.forms.some((f) => f.hasComplexityFlags);
  if (hasComplexity) return "low";
  if (input.questionnaire?.hasAdditionalIncomeNotIn106) return "low";
  if (input.questionnaire?.isIsraeliResidentFullYear === "unsure") return "medium";
  if (input.forms.length > 1 && !input.questionnaire) return "medium";
  if (hasWarnings) return "medium";
  return "high";
}

/**
 * Main engine: compute refund estimate and breakdown.
 */
export function calculate(input: CalculatorInput): CalculationResult {
  const params = getYearParams(input.year);
  const taxableIncomeTotal = input.forms.reduce((s, f) => s + f.taxableIncome, 0);
  const withheldTotal = input.forms.reduce((s, f) => s + f.incomeTaxWithheld, 0);

  const grossTax =
    taxByBrackets(taxableIncomeTotal, params.brackets) +
    surtax(
      taxableIncomeTotal,
      params.surtaxThreshold,
      params.surtaxRate
    );

  const creditPointsTotal = totalCreditPoints(
    input.forms,
    input.questionnaire,
    input.year
  );
  const creditPointsValue = creditPointsTotal * params.creditPointValueAnnual;
  const donationCred = donationCredit(
    input.questionnaire?.donations46Total,
    taxableIncomeTotal
  );

  const liability = Math.max(
    0,
    grossTax - creditPointsValue - donationCred
  );
  const refundEstimate = Math.max(0, withheldTotal - liability);
  const underpaymentEstimate = Math.max(0, liability - withheldTotal);

  const breakdownItems: BreakdownItem[] = [
    {
      key: "gross_tax",
      title: "מס לפי מדרגות",
      amount: grossTax,
      explanation: "חישוב מס לפי מדרגות המס לשנת המס הנבחרת.",
    },
    {
      key: "credit_points",
      title: "זיכוי נקודות זיכוי",
      amount: -creditPointsValue,
      explanation: `נקודות זיכוי (${creditPointsTotal.toFixed(2)}) × ערך נקודה שנתי.`,
    },
    {
      key: "donation",
      title: "זיכוי תרומות סעיף 46",
      amount: -donationCred,
      explanation: "35% מסכום התרומות הזכאי (עד 30% מההכנסה החייבת).",
    },
    {
      key: "liability",
      title: "חבות מס שנתית",
      amount: liability,
      explanation: "מס ברוטו פחות זיכויים.",
    },
    {
      key: "withheld",
      title: "מס שנוכה במקור",
      amount: -withheldTotal,
      explanation: "סה״כ מס שנוכה על ידי המעסיק/ים.",
    },
  ];

  const warnings: string[] = [];
  if (taxableIncomeTotal === 0 && withheldTotal > 0) {
    warnings.push("הכנסה חייבת 0 אך מס שנוכה > 0 — מומלץ לבדוק נתונים.");
  }
  if (input.forms.length > 1) {
    const allHavePoints = input.forms.every((f) => (f.creditPointsGranted ?? 0) > 0);
    if (allHavePoints) {
      warnings.push("ייתכן כפל נקודות זיכוי אצל כמה מעסיקים — תיאום מס יכול למנוע ניכוי עודף.");
    }
  }
  if (underpaymentEstimate > 0) {
    warnings.push("ייתכן חוב/השלמת מס — מומלץ להתייעץ או להגיש דוח.");
  }

  const assumptions = buildAssumptions(
    input,
    creditPointsTotal,
    !!input.questionnaire?.isIsraeliResidentFullYear
  );

  const conf = confidence(input, warnings.length > 0);
  const resultSummary =
    refundEstimate > 0
      ? `אומדן החזר: ${refundEstimate.toLocaleString("he-IL")} ₪`
      : underpaymentEstimate > 0
        ? `ייתכן חוב להשלמה: ${underpaymentEstimate.toLocaleString("he-IL")} ₪`
        : "אין אומדן החזר או חוב לפי הנתונים שהזנת.";

  return {
    resultSummary,
    refundEstimate,
    underpaymentEstimate,
    totals: {
      taxableIncomeTotal,
      withheldTotal,
      grossTax,
      creditPointsValue,
      liability,
    },
    breakdownItems,
    assumptions,
    warnings,
    confidence: conf,
  };
}
