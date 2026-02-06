/**
 * Wizard container: step indicator, Back/Next, state persistence.
 * Embedded flow — no external navigation.
 */

import { useCallback, useReducer } from "react";
import { Step1YearAndForms } from "./Step1YearAndForms";
import { Step2Form106Data } from "./Step2Form106Data";
import { Step3Questionnaire } from "./Step3Questionnaire";
import { Step4Results } from "./Step4Results";
import type { WizardState, WizardStep } from "@/types/wizard";
import { validateStep1, validateStep2 } from "@/calculator/validations";
import { calculate } from "@/calculator/engine";

const STEPS: WizardStep[] = [1, 2, 3, 4];

const initialWizardState: WizardState = {
  currentStep: 1,
  step1: { year: 2024, formCount: 1 },
  step2: null,
  questionnaire: {},
  validationErrors: {},
  result: null,
};

type WizardAction =
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "SET_STEP1"; payload: WizardState["step1"] }
  | { type: "SET_STEP2"; payload: WizardState["step2"] }
  | { type: "SET_QUESTIONNAIRE"; payload: Partial<WizardState["questionnaire"]> }
  | { type: "SET_VALIDATION"; payload: Record<string, string> }
  | { type: "SET_RESULT"; payload: WizardState["result"] }
  | { type: "RESET" };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "SET_STEP1":
      return { ...state, step1: action.payload };
    case "SET_STEP2":
      return { ...state, step2: action.payload };
    case "SET_QUESTIONNAIRE":
      return { ...state, questionnaire: { ...state.questionnaire, ...action.payload } };
    case "SET_VALIDATION":
      return { ...state, validationErrors: action.payload };
    case "SET_RESULT":
      return { ...state, result: action.payload };
    case "RESET":
      return initialWizardState;
    default:
      return state;
  }
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function WizardContainer() {
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);

  const goNext = useCallback(() => {
    if (state.currentStep === 1) {
      const err = validateStep1(state.step1);
      if (Object.keys(err).length > 0) {
        dispatch({ type: "SET_VALIDATION", payload: err });
        return;
      }
      dispatch({ type: "SET_VALIDATION", payload: {} });
      dispatch({ type: "SET_STEP2", payload: buildInitialStep2(state.step1!) });
      dispatch({ type: "SET_STEP", step: 2 });
    } else if (state.currentStep === 2) {
      const err = validateStep2(state.step2 ?? []);
      if (Object.keys(err).length > 0) {
        dispatch({ type: "SET_VALIDATION", payload: err });
        return;
      }
      dispatch({ type: "SET_VALIDATION", payload: {} });
      dispatch({ type: "SET_STEP", step: 3 });
    } else if (state.currentStep === 3) {
      try {
        const result = calculate(buildEngineInput(state));
        dispatch({ type: "SET_RESULT", payload: result });
        dispatch({ type: "SET_STEP", step: 4 });
      } catch (e) {
        dispatch({
          type: "SET_VALIDATION",
          payload: { _system: "אירעה שגיאה בחישוב. נא לבדוק את הנתונים." },
        });
      }
    }
  }, [state]);

  const goBack = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: "SET_STEP", step: (state.currentStep - 1) as WizardStep });
      dispatch({ type: "SET_VALIDATION", payload: {} });
    }
  }, [state.currentStep]);

  const goToStep2 = useCallback(() => {
    dispatch({ type: "SET_STEP", step: 2 });
  }, []);

  const startOver = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const canNext =
    state.currentStep === 1
      ? !!state.step1 &&
        state.step1.year >= 2020 &&
        state.step1.year <= 2025 &&
        state.step1.formCount >= 1 &&
        state.step1.formCount <= 20
      : true;

  return (
    <div className="wizard" role="region" aria-label="מחשבון אומדן החזר מס">
      <nav aria-label="שלבי המחשבון" className="step-indicator">
        {STEPS.map((step) => (
          <div
            key={step}
            className={cx(
              "step-dot",
              state.currentStep === step && "active",
              state.currentStep > step && "done"
            )}
            aria-current={state.currentStep === step ? "step" : undefined}
          >
            {step}
          </div>
        ))}
      </nav>

      {state.currentStep === 1 && (
        <Step1YearAndForms
          step1={state.step1}
          errors={state.validationErrors}
          onStep1Change={(payload) => dispatch({ type: "SET_STEP1", payload })}
          onNext={goNext}
          canNext={canNext}
          onBack={null}
        />
      )}
      {state.currentStep === 2 && state.step2 && (
        <Step2Form106Data
          forms={state.step2}
          errors={state.validationErrors}
          onFormsChange={(payload) => dispatch({ type: "SET_STEP2", payload })}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {state.currentStep === 3 && (
        <Step3Questionnaire
          questionnaire={state.questionnaire}
          onQuestionnaireChange={(payload) =>
            dispatch({ type: "SET_QUESTIONNAIRE", payload })
          }
          onNext={goNext}
          onBack={goBack}
          step2={state.step2}
          step1={state.step1}
        />
      )}
      {state.currentStep === 4 && state.result && (
        <Step4Results
          result={state.result}
          inputs={state}
          onEditData={goToStep2}
          onStartOver={startOver}
        />
      )}
    </div>
  );
}

function buildInitialStep2(step1: { year: number; formCount: number }) {
  return Array.from({ length: step1.formCount }, () => ({
    taxableIncome: 0,
    incomeTaxWithheld: 0,
    creditPointsGranted: 0,
  }));
}

function buildEngineInput(state: WizardState) {
  const { step1, step2, questionnaire } = state;
  if (!step1 || !step2) throw new Error("Missing step1 or step2");
  return {
    year: step1.year,
    forms: step2,
    questionnaire: Object.keys(questionnaire).length ? questionnaire : undefined,
  };
}
