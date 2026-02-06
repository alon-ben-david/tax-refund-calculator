/**
 * Step 1: Select year + number of 106 forms.
 * Next disabled until valid.
 */

import type { Step1Input, TaxYear } from "@/types/wizard";
import { TAX_YEARS } from "@/calculator/constants";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Props = {
  step1: Step1Input | null;
  errors: Record<string, string>;
  onStep1Change: (payload: Step1Input) => void;
  onNext: () => void;
  canNext: boolean;
  onBack: (() => void) | null;
};

export function Step1YearAndForms({
  step1,
  errors,
  onStep1Change,
  onNext,
  canNext,
  onBack,
}: Props) {
  const year = step1?.year ?? 2024;
  const formCount = step1?.formCount ?? 1;

  const setYear = (y: number) => {
    onStep1Change({ year: y as TaxYear, formCount });
  };
  const setFormCount = (n: number) => {
    onStep1Change({ year, formCount: n });
  };

  return (
    <div className="wizard-step step1">
      <h2 className="step-title">בחירת שנת מס ומספר טפסי 106</h2>
      <p className="step-desc">
        בחרו שנת מס (2020–2025) וכמה טפסי 106 יש לכם לאותה שנה (לפי מספר מעסיקים).
      </p>

      <div className="form-group">
        <label htmlFor="wizard-year">שנת מס</label>
        <select
          id="wizard-year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className={cx("input", errors.year && "input-error")}
          aria-invalid={!!errors.year}
          aria-describedby={errors.year ? "year-error" : undefined}
        >
          {TAX_YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        {errors.year && (
          <span id="year-error" className="error-message" role="alert">
            {errors.year}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="wizard-formCount">מספר טפסי 106</label>
        <input
          id="wizard-formCount"
          type="number"
          min={1}
          max={20}
          value={formCount}
          onChange={(e) => setFormCount(Number(e.target.value) || 1)}
          className={cx("input", errors.formCount && "input-error")}
          aria-invalid={!!errors.formCount}
          aria-describedby={errors.formCount ? "formCount-error" : undefined}
        />
        {errors.formCount && (
          <span id="formCount-error" className="error-message" role="alert">
            {errors.formCount}
          </span>
        )}
      </div>

      <div className="wizard-actions">
        {onBack && (
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            חזרה
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canNext}
          aria-disabled={!canNext}
        >
          הבא
        </button>
      </div>
    </div>
  );
}
