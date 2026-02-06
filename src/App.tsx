/**
 * Landing page with embedded calculator wizard.
 * RTL Hebrew; sections: Hero, How it works, Calculator (wizard), FAQ, Footer.
 */

import { useRef } from "react";
import { WizardContainer } from "@/components/wizard/WizardContainer";

function getSafeWindow(): Window | null {
  try {
    return typeof window !== "undefined" ? window : null;
  } catch {
    return null;
  }
}

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);

  const scrollToCalculator = () => {
    getSafeWindow()?.document
      .getElementById("calculator")
      ?.scrollIntoView({ behavior: "smooth" });
    getSafeWindow() && (getSafeWindow()!.location.hash = "calculator");
  };

  return (
    <div ref={rootRef} className="app" dir="rtl">
      <header className="hero" id="hero">
        <h1>בדקו אומדן החזר מס לשכיר/ה לפי טופס 106 — תוך דקות</h1>
        <p className="subtitle">
          מחשבון שמסכם את נתוני ה־106 שלכם, משלים רק את מה שחסר, ומראה אומדן החזר +
          רמת אמינות והסבר מה משפיע על התוצאה.
        </p>
        <p className="micro-copy">
          החזר מס מגישים אחרי תום שנת המס.
        </p>
        <div className="ctas">
          <button
            type="button"
            className="btn btn-primary"
            onClick={scrollToCalculator}
          >
            התחילו בדיקה
          </button>
        </div>
        <p className="fine-print">ללא התחייבות. אומדן לצורך מידע כללי.</p>
      </header>

      <section className="section how-it-works" id="how-it-works">
        <h2>איך זה עובד</h2>
        <ol className="steps-list">
          <li>בוחרים שנת מס ומספר טפסי 106</li>
          <li>מעתיקים 3–5 שדות מרכזיים מה־106 (או מעלים קובץ)</li>
          <li>מקבלים אומדן החזר + Confidence + מה צריך להכין להגשה</li>
        </ol>
      </section>

      <section
        className="section calculator-section"
        id="calculator"
        aria-labelledby="calculator-title"
      >
        <h2 id="calculator-title">המחשבון (אומדן החזר מס)</h2>
        <div className="wizard-wrap">
          <WizardContainer />
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <h2>שאלות נפוצות</h2>
        <dl className="faq-list">
          <dt>כמה שנים אחורה אפשר לבקש החזר?</dt>
          <dd>בדרך כלל עד 6 שנים מתום שנת המס.</dd>
          <dt>האם זה כולל ביטוח לאומי?</dt>
          <dd>לא. זה מסלול נפרד של ביטוח לאומי; כאן מחשבים מס הכנסה.</dd>
          <dt>למה אתם מבקשים שאלות על ילדים/תואר?</dt>
          <dd>כי נקודות זיכוי משתנות לפי נסיבות ושנה.</dd>
          <dt>מה אם יש לי סעיף 102 או מענק פרישה?</dt>
          <dd>זה בדרך כלל מורכב יותר; נציג דגל ונבקש מסמכים נוספים.</dd>
        </dl>
      </section>

      <footer className="footer" id="footer">
        <p className="disclaimer">
          מידע כללי ואומדן בלבד; אינו ייעוץ מס ואינו מחליף בדיקה מקצועית או החלטת
          רשות המסים.
        </p>
        <p className="disclaimer">
          הגשת בקשה להחזר מס אפשרית רק לאחר תום שנת המס ולרוב עד 6 שנים מתום שנת
          המס.
        </p>
        <p className="disclaimer">
          חישוב זה מתייחס למס הכנסה בלבד ואינו כולל ביטוח לאומי/מס בריאות.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={scrollToCalculator}
        >
          בדקו אומדן החזר
        </button>
      </footer>
    </div>
  );
}
