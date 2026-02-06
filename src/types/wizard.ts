/**
 * Types and schemas for the tax refund wizard and calculation engine.
 * Aligned with form 106 fields and deep-research-report.md.
 */

/** Tax year; scope 2020–2025 per "6 years from end of tax year". */
export type TaxYear = 2020 | 2021 | 2022 | 2023 | 2024 | 2025;

/** Single form 106 (per employer). */
export interface Form106Entry {
  /** "הסכום החייב במס" (258/272) or fallback salary. */
  taxableIncome: number;
  /** מס הכנסה שנוכה (042). */
  incomeTaxWithheld: number;
  /** מספר נקודות הזיכוי שניתנו. */
  creditPointsGranted: number;
  /** חודשים שעבד/ה (1–12). Optional; used for flags. */
  monthsWorked?: number[];
  /** Fallback: "משכורת ותשלומים אחרים" (158/172) if 258/272 not used. */
  salaryTaxableRegular?: number;
  /** דגל: פרישה/קצבה/102/פטור 9(5). */
  hasComplexityFlags?: boolean;
}

/** Step 1: year + number of 106 forms. */
export interface Step1Input {
  year: TaxYear;
  formCount: number;
}

/** Step 2: array of 106 data (length = formCount). */
export type Step2Input = Form106Entry[];

/** Questionnaire answers for improved estimate (Step 3). */
export interface QuestionnaireAnswers {
  /** תושב ישראל כל השנה. */
  isIsraeliResidentFullYear?: "yes" | "no" | "unsure";
  /** חצי נקודה כאישה (optional). */
  genderForCredit?: "yes" | "no";
  /** שנות לידה של ילדים (לפי גיל/שנה). */
  childrenBirthYears?: number[];
  /** תואר ראשון/שני/לימודי מקצוע. */
  degreeType?: "first" | "second" | "professional" | "none";
  /** שנת סיום לימודים. */
  graduationYear?: number;
  /** מגורים ביישוב מזכה 12 חודשים רצופים. */
  lived12MonthsConsecutive?: boolean;
  /** סכום תרומות סעיף 46. */
  donations46Total?: number;
  /** הכנסות נוספות שלא ב-106. */
  hasAdditionalIncomeNotIn106?: boolean;
}

/** Full wizard inputs for the engine. */
export interface CalculatorInput {
  year: TaxYear;
  forms: Form106Entry[];
  questionnaire?: QuestionnaireAnswers;
}

/** Single line in the results breakdown. */
export interface BreakdownItem {
  key: string;
  title: string;
  amount: number;
  explanation: string;
}

/** Result from the calculation engine. */
export interface CalculationResult {
  resultSummary: string;
  refundEstimate: number;
  underpaymentEstimate: number;
  totals: {
    taxableIncomeTotal: number;
    withheldTotal: number;
    grossTax: number;
    creditPointsValue: number;
    liability: number;
  };
  breakdownItems: BreakdownItem[];
  assumptions: string[];
  warnings: string[];
  confidence: "high" | "medium" | "low";
}

/** Wizard step index (1–4). */
export type WizardStep = 1 | 2 | 3 | 4;

/** Full wizard state. */
export interface WizardState {
  currentStep: WizardStep;
  step1: Step1Input | null;
  step2: Step2Input | null;
  questionnaire: QuestionnaireAnswers;
  validationErrors: Record<string, string>;
  result: CalculationResult | null;
}
