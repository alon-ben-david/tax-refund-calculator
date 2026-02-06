/**
 * Step 2: Enter 106 data per form.
 * Central fields, validation, debounced auto-save between fields.
 */

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import type { Form106Entry, Step2Input } from "@/types/wizard";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Props = {
  forms: Step2Input;
  errors: Record<string, string>;
  onFormsChange: (payload: Step2Input) => void;
  onNext: () => void;
  onBack: () => void;
};

const DEBOUNCE_MS = 400;

export function Step2Form106Data({
  forms,
  errors,
  onFormsChange,
  onNext,
  onBack,
}: Props) {
  const [local, setLocal] = useState<Form106Entry[]>(forms);
  const debounced = useDebounce(local, DEBOUNCE_MS);

  useEffect(() => {
    onFormsChange(debounced);
  }, [debounced, onFormsChange]);

  const updateForm = useCallback((index: number, patch: Partial<Form106Entry>) => {
    setLocal((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

  const fieldError = (key: string) => errors[key];

  return (
    <div className="wizard-step step2">
      <h2 className="step-title">הזנת נתוני טופס 106</h2>
      <p className="step-desc">
        לכל טופס 106: הכנסה חייבת (258/272), מס שנוכה (042), נקודות זיכוי שניתנו.
        אם אין מספר נקודות — אפשר 0.
      </p>

      {errors._system && (
        <div className="banner-error" role="alert">
          {errors._system}
        </div>
      )}

      {local.map((entry, index) => (
        <fieldset key={index} className="form-block" aria-label={`טופס 106 ${index + 1}`}>
          <legend>טופס 106 — מעסיק {index + 1}</legend>

          <div className="form-group">
            <label htmlFor={`taxableIncome-${index}`}>
              הכנסה חייבת במס (258/272) ₪
            </label>
            <input
              id={`taxableIncome-${index}`}
              type="number"
              min={0}
              step={100}
              value={entry.taxableIncome || ""}
              onChange={(e) =>
                updateForm(index, {
                  taxableIncome: Number(e.target.value) || 0,
                })
              }
              className={cx(
                "input",
                fieldError(`form_${index}_taxableIncome`) && "input-error"
              )}
              aria-invalid={!!fieldError(`form_${index}_taxableIncome`)}
            />
            {fieldError(`form_${index}_taxableIncome`) && (
              <span className="error-message" role="alert">
                {fieldError(`form_${index}_taxableIncome`)}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor={`incomeTaxWithheld-${index}`}>
              מס הכנסה שנוכה (042) ₪
            </label>
            <input
              id={`incomeTaxWithheld-${index}`}
              type="number"
              min={0}
              step={100}
              value={entry.incomeTaxWithheld || ""}
              onChange={(e) =>
                updateForm(index, {
                  incomeTaxWithheld: Number(e.target.value) || 0,
                })
              }
              className={cx(
                "input",
                fieldError(`form_${index}_incomeTaxWithheld`) && "input-error"
              )}
              aria-invalid={!!fieldError(`form_${index}_incomeTaxWithheld`)}
            />
            {fieldError(`form_${index}_incomeTaxWithheld`) && (
              <span className="error-message" role="alert">
                {fieldError(`form_${index}_incomeTaxWithheld`)}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor={`creditPointsGranted-${index}`}>
              מספר נקודות זיכוי שניתנו
            </label>
            <input
              id={`creditPointsGranted-${index}`}
              type="number"
              min={0}
              max={10}
              step={0.25}
              value={entry.creditPointsGranted ?? ""}
              onChange={(e) =>
                updateForm(index, {
                  creditPointsGranted: Number(e.target.value) || 0,
                })
              }
              className={cx(
                "input",
                fieldError(`form_${index}_creditPointsGranted`) && "input-error"
              )}
              aria-invalid={!!fieldError(`form_${index}_creditPointsGranted`)}
            />
            {fieldError(`form_${index}_creditPointsGranted`) && (
              <span className="error-message" role="alert">
                {fieldError(`form_${index}_creditPointsGranted`)}
              </span>
            )}
          </div>
        </fieldset>
      ))}

      <div className="wizard-actions">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          חזרה
        </button>
        <button type="button" className="btn btn-primary" onClick={onNext}>
          הבא
        </button>
      </div>
    </div>
  );
}
