/**
 * Step 3: Adaptive short questionnaire.
 * Questions based on missing fields, outliers, scenario refinement.
 * Skip only when optional.
 */

import { useMemo } from "react";
import type {
  QuestionnaireAnswers,
  Step1Input,
  Step2Input,
} from "@/types/wizard";

type Props = {
  questionnaire: QuestionnaireAnswers;
  onQuestionnaireChange: (payload: Partial<QuestionnaireAnswers>) => void;
  onNext: () => void;
  onBack: () => void;
  step2: Step2Input | null;
  step1: Step1Input | null;
};

/** Which questions to show: missing data, inconsistent values, refinement. */
function selectQuestions(
  step2: Step2Input | null,
  _step1: Step1Input | null
): Array<{ key: keyof QuestionnaireAnswers; label: string; optional: boolean }> {
  const multipleEmployers = (step2?.length ?? 0) > 1;
  const creditPointsFromForms =
    step2?.reduce((s, f) => s + (f.creditPointsGranted ?? 0), 0) ?? 0;
  const totalIncome = step2?.reduce((s, f) => s + f.taxableIncome, 0) ?? 0;
  const showResidencyFirst =
    creditPointsFromForms === 0 && totalIncome > 0;

  const base: Array<{
    key: keyof QuestionnaireAnswers;
    label: string;
    optional: boolean;
  }> = [
    {
      key: "isIsraeliResidentFullYear",
      label: showResidencyFirst
        ? "האם תושב/ת ישראל כל השנה? (נקודות זיכוי בסיס — משפיע על האומדן)"
        : "האם תושב/ת ישראל כל שנת המס? (נקודות בסיס 2.25)",
      optional: false,
    },
    { key: "genderForCredit", label: "חצי נקודה כאישה (אופציונלי)", optional: true },
    {
      key: "degreeType",
      label: "סוג תואר / לימודי מקצוע (תואר ראשון/שני/לימודי מקצוע/ללא)",
      optional: true,
    },
    {
      key: "graduationYear",
      label: "שנת סיום לימודים (אם רלוונטי)",
      optional: true,
    },
    {
      key: "donations46Total",
      label: "סכום תרומות למוסד ציבורי לפי סעיף 46 (₪)",
      optional: true,
    },
    {
      key: "hasAdditionalIncomeNotIn106",
      label: multipleEmployers
        ? "האם יש הכנסות נוספות שלא ב-106? (חשוב לתיאום מס)"
        : "האם יש הכנסות נוספות שלא ב-106 (ריבית/דיבידנד/עסק/חו\"ל)?",
      optional: false,
    },
  ];
  return base;
}

export function Step3Questionnaire({
  questionnaire,
  onQuestionnaireChange,
  onNext,
  onBack,
  step2,
  step1,
}: Props) {
  const questions = useMemo(
    () => selectQuestions(step2, step1),
    [step2, step1]
  );

  const set = (key: keyof QuestionnaireAnswers, value: unknown) => {
    onQuestionnaireChange({ [key]: value });
  };

  return (
    <div className="wizard-step step3">
      <h2 className="step-title">שאלון השלמה קצר</h2>
      <p className="step-desc">
        שאלות אלה משפרות את דיוק האומדן (נקודות זיכוי, תרומות). אפשר לדלג רק על
        שאלות שסומנו כאופציונליות.
      </p>

      {questions.map((q) => (
        <div key={String(q.key)} className="form-group">
          <label htmlFor={`q-${q.key}`}>{q.label}</label>
          {q.key === "isIsraeliResidentFullYear" && (
            <select
              id={`q-${q.key}`}
              value={questionnaire[q.key] ?? ""}
              onChange={(e) =>
                set(
                  q.key,
                  e.target.value
                    ? (e.target.value as "yes" | "no" | "unsure")
                    : undefined
                )
              }
              className="input"
              aria-required={!q.optional}
            >
              <option value="">בחר/י</option>
              <option value="yes">כן</option>
              <option value="no">לא</option>
              <option value="unsure">לא בטוח/ה</option>
            </select>
          )}
          {q.key === "genderForCredit" && (
            <select
              id={`q-${q.key}`}
              value={questionnaire[q.key] ?? ""}
              onChange={(e) =>
                set(
                  q.key,
                  e.target.value
                    ? (e.target.value as "yes" | "no")
                    : undefined
                )
              }
              className="input"
            >
              <option value="">דלג/י (אופציונלי)</option>
              <option value="yes">כן</option>
              <option value="no">לא</option>
            </select>
          )}
          {q.key === "degreeType" && (
            <select
              id={`q-${q.key}`}
              value={questionnaire[q.key] ?? ""}
              onChange={(e) =>
                set(
                  q.key,
                  e.target.value
                    ? (e.target.value as QuestionnaireAnswers["degreeType"])
                    : undefined
                )
              }
              className="input"
            >
              <option value="">דלג/י</option>
              <option value="first">תואר ראשון</option>
              <option value="second">תואר שני</option>
              <option value="professional">לימודי מקצוע</option>
              <option value="none">ללא</option>
            </select>
          )}
          {q.key === "graduationYear" && (
            <input
              id={`q-${q.key}`}
              type="number"
              min={1990}
              max={2030}
              value={questionnaire[q.key] ?? ""}
              onChange={(e) =>
                set(q.key, e.target.value ? Number(e.target.value) : undefined)
              }
              className="input"
              placeholder="למשל 2023"
            />
          )}
          {q.key === "donations46Total" && (
            <input
              id={`q-${q.key}`}
              type="number"
              min={0}
              step={100}
              value={questionnaire[q.key] ?? ""}
              onChange={(e) =>
                set(q.key, e.target.value ? Number(e.target.value) : undefined)
              }
              className="input"
              placeholder="0"
            />
          )}
          {q.key === "hasAdditionalIncomeNotIn106" && (
            <select
              id={`q-${q.key}`}
              value={questionnaire[q.key] === true ? "yes" : questionnaire[q.key] === false ? "no" : ""}
              onChange={(e) =>
                set(
                  q.key,
                  e.target.value === "yes"
                    ? true
                    : e.target.value === "no"
                      ? false
                      : undefined
                )
              }
              className="input"
              aria-required={!q.optional}
            >
              <option value="">בחר/י</option>
              <option value="no">לא</option>
              <option value="yes">כן</option>
            </select>
          )}
        </div>
      ))}

      <div className="wizard-actions">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          חזרה
        </button>
        <button type="button" className="btn btn-primary" onClick={onNext}>
          חשב אומדן
        </button>
      </div>
    </div>
  );
}
