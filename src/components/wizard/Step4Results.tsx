/**
 * Step 4: Results — headline, breakdown, details expand/collapse, CTAs.
 */

import { useState } from "react";
import type { CalculationResult, WizardState } from "@/types/wizard";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Props = {
  result: CalculationResult;
  inputs: WizardState;
  onEditData: () => void;
  onStartOver: () => void;
};

export function Step4Results({
  result,
  inputs,
  onEditData,
  onStartOver,
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const formatCurrency = (n: number) =>
    n.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " ₪";

  return (
    <div className="wizard-step step4 results">
      <h2 className="step-title">אומדן החזר מס</h2>

      <div className="result-headline" role="status" aria-live="polite">
        <span className="result-summary">{result.resultSummary}</span>
      </div>
      <p className="result-disclaimer">
        זהו אומדן על בסיס הנתונים שהזנת. ההחזר בפועל נקבע לאחר בדיקת רשות המסים.
      </p>

      <div className={cx("confidence-badge", result.confidence)}>
        <span>רמת אמינות: </span>
        <strong>
          {result.confidence === "high"
            ? "גבוהה"
            : result.confidence === "medium"
              ? "בינונית"
              : "נמוכה"}
        </strong>
        <p className="confidence-desc">
          Confidence גבוה = רוב הנתונים הקריטיים קיימים ואין סימני מורכבות ב-106.
          אם חסר מידע (תרומות/תואר/ילדים), האומדן עשוי להיות נמוך מהמציאות.
        </p>
      </div>

      <section className="breakdown" aria-label="פירוט חישוב">
        <h3>פירוט</h3>
        <ul className="breakdown-list">
          {result.breakdownItems.map((item) => (
            <li key={item.key} className="breakdown-item">
              <span className="breakdown-title">{item.title}</span>
              <span className="breakdown-amount">
                {item.amount >= 0 ? formatCurrency(item.amount) : `-${formatCurrency(-item.amount)}`}
              </span>
              <p className="breakdown-explanation">{item.explanation}</p>
            </li>
          ))}
        </ul>
      </section>

      {result.warnings.length > 0 && (
        <div className="warnings" role="alert">
          <h3>הערות ואזהרות</h3>
          <ul>
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="details-toggle">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setDetailsOpen(!detailsOpen)}
          aria-expanded={detailsOpen}
          aria-controls="results-details"
        >
          {detailsOpen ? "הסתר פרטים" : "הצג פרטים"}
        </button>
      </div>

      {detailsOpen && (
        <div id="results-details" className="results-details">
          <h3>הנחות ונתונים שנכללו</h3>
          <ul className="assumptions-list">
            {result.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
          <h3>כללים (תמצית)</h3>
          <ul>
            <li>מס לפי מדרגות שנת המס; מעל סף — מס נוסף 3%.</li>
            <li>זיכוי נקודות זיכוי = נקודות × ערך נקודה שנתי.</li>
            <li>תרומות סעיף 46: זיכוי 35%, עד 30% מההכנסה החייבת.</li>
            <li>חבות = מס ברוטו − זיכויים; החזר = מס שנוכה − חבות (אם חיובי).</li>
          </ul>
          <h3>נתוני קלט (סיכום)</h3>
          <p>שנת מס: {inputs.step1?.year}. מספר טפסי 106: {inputs.step2?.length ?? 0}.</p>
          <p>
            הכנסה חייבת כולל:{" "}
            {inputs.step2
              ?.reduce((s, f) => s + f.taxableIncome, 0)
              .toLocaleString("he-IL")}{" "}
            ₪. מס שנוכה כולל:{" "}
            {inputs.step2
              ?.reduce((s, f) => s + f.incomeTaxWithheld, 0)
              .toLocaleString("he-IL")}{" "}
            ₪.
          </p>
        </div>
      )}

      <div className="wizard-actions result-ctas">
        <button type="button" className="btn btn-secondary" onClick={onEditData}>
          עריכת נתונים
        </button>
        <button type="button" className="btn btn-primary" onClick={onStartOver}>
          התחל מחדש
        </button>
      </div>
    </div>
  );
}
