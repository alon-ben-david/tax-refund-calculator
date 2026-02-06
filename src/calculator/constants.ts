/**
 * Annual tax parameters 2020–2025 (brackets, surtax threshold, credit point value).
 * Source: deep-research-report.md table; 2025 same as 2024 per report.
 */

import type { TaxYear } from "@/types/wizard";

export interface TaxBracket {
  upperLimit: number;
  rate: number; // 0.10, 0.14, etc.
}

export interface YearParams {
  brackets: TaxBracket[];
  surtaxThreshold: number;
  surtaxRate: number;
  creditPointValueAnnual: number;
}

const BRACKETS_2020: TaxBracket[] = [
  { upperLimit: 75_960, rate: 0.1 },
  { upperLimit: 108_960, rate: 0.14 },
  { upperLimit: 174_960, rate: 0.2 },
  { upperLimit: 243_120, rate: 0.31 },
  { upperLimit: 505_920, rate: 0.35 },
  { upperLimit: Infinity, rate: 0.47 },
];

const BRACKETS_2021: TaxBracket[] = [
  { upperLimit: 75_480, rate: 0.1 },
  { upperLimit: 108_360, rate: 0.14 },
  { upperLimit: 173_880, rate: 0.2 },
  { upperLimit: 241_680, rate: 0.31 },
  { upperLimit: 502_920, rate: 0.35 },
  { upperLimit: Infinity, rate: 0.47 },
];

const BRACKETS_2022: TaxBracket[] = [
  { upperLimit: 77_400, rate: 0.1 },
  { upperLimit: 110_880, rate: 0.14 },
  { upperLimit: 178_080, rate: 0.2 },
  { upperLimit: 247_440, rate: 0.31 },
  { upperLimit: 514_920, rate: 0.35 },
  { upperLimit: Infinity, rate: 0.47 },
];

const BRACKETS_2023: TaxBracket[] = [
  { upperLimit: 81_480, rate: 0.1 },
  { upperLimit: 116_760, rate: 0.14 },
  { upperLimit: 187_440, rate: 0.2 },
  { upperLimit: 260_520, rate: 0.31 },
  { upperLimit: 542_160, rate: 0.35 },
  { upperLimit: Infinity, rate: 0.47 },
];

const BRACKETS_2024: TaxBracket[] = [
  { upperLimit: 84_120, rate: 0.1 },
  { upperLimit: 120_720, rate: 0.14 },
  { upperLimit: 193_800, rate: 0.2 },
  { upperLimit: 269_280, rate: 0.31 },
  { upperLimit: 560_280, rate: 0.35 },
  { upperLimit: Infinity, rate: 0.47 },
];

const PARAMS_2020: YearParams = {
  brackets: BRACKETS_2020,
  surtaxThreshold: 651_600,
  surtaxRate: 0.03,
  creditPointValueAnnual: 2_628,
};

const PARAMS_2021: YearParams = {
  brackets: BRACKETS_2021,
  surtaxThreshold: 647_640,
  surtaxRate: 0.03,
  creditPointValueAnnual: 2_616,
};

const PARAMS_2022: YearParams = {
  brackets: BRACKETS_2022,
  surtaxThreshold: 663_240,
  surtaxRate: 0.03,
  creditPointValueAnnual: 2_676,
};

const PARAMS_2023: YearParams = {
  brackets: BRACKETS_2023,
  surtaxThreshold: 698_280,
  surtaxRate: 0.03,
  creditPointValueAnnual: 2_820,
};

const PARAMS_2024: YearParams = {
  brackets: BRACKETS_2024,
  surtaxThreshold: 721_560,
  surtaxRate: 0.03,
  creditPointValueAnnual: 2_904,
};

export const TAX_YEARS: TaxYear[] = [2020, 2021, 2022, 2023, 2024, 2025];

const PARAMS_MAP: Record<TaxYear, YearParams> = {
  2020: PARAMS_2020,
  2021: PARAMS_2021,
  2022: PARAMS_2022,
  2023: PARAMS_2023,
  2024: PARAMS_2024,
  2025: PARAMS_2024, // 2025 same as 2024 per report
};

export function getYearParams(year: TaxYear): YearParams {
  return PARAMS_MAP[year];
}
