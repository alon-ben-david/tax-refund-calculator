# העלאה ל-GitHub וקבלת קישור לאפליקציה

## מה כבר בוצע

- נוצר `.gitignore` (כולל: `node_modules/`, `dist/`, `.env`, קבצי IDE ו-log).
- הופעל `git init`, נוספו כל הקבצים, בוצע commit ראשון על הענף `main`.
- ה-build רץ בהצלחה (`npm run build` → תיקיית `dist/`).

---

## שלב 1: יצירת ריפו ציבורי ב-GitHub

1. היכנס ל-[github.com](https://github.com) והתחבר.
2. לחץ על **"New repository"** (או **"+" → "New repository"**).
3. מלא:
   - **Repository name:** `tax-refund-calculator` (או שם אחר – אם תשנה, עדכן בהמשך).
   - **Public**.
   - **אל תסמן** "Add a README file".
   - **אל תסמן** "Add .gitignore".
   - **אל תסמן** "Choose a license".
4. לחץ **"Create repository"**.

---

## שלב 2: חיבור הריפו המקומי ו-push

בטרמינל, מתוך תיקיית הפרויקט:

```bash
cd "/Users/alonbendavid/החזר מס"

# החלף YOUR_USERNAME בשם המשתמש שלך ב-GitHub
git remote add origin https://github.com/YOUR_USERNAME/tax-refund-calculator.git

git push -u origin main
```

אם יצרת את הריפו עם שם אחר, החלף `tax-refund-calculator` בשם שבחרת.

אם Git מבקש התחברות – התחבר עם חשבון GitHub (או עם Personal Access Token אם יש 2FA).

---

## שלב 3: קבלת קישור קבוע (HTTPS) לשימוש מכל מחשב

אפשר לבחור **אחת** מהאפשרויות הבאות.

### אפשרות א': Vercel (מומלץ – קל ומהיר)

1. היכנס ל-[vercel.com](https://vercel.com) והתחבר (אפשר עם חשבון GitHub).
2. **Add New… → Project**.
3. ייבא את הריפו `tax-refund-calculator` מ-GitHub (אם צריך – אשר גישה ל-GitHub).
4. הגדרות:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Framework Preset:** Vite (אם מוצע).
5. **Deploy**.

אחרי הסיום תקבל קישור קבוע, למשל:

- `https://tax-refund-calculator-xxxx.vercel.app`

זה **הקישור הסופי** – אפשר לפתוח אותו מכל מחשב בדפדפן ולהשתמש באפליקציה.

---

### אפשרות ב': GitHub Pages

1. ב-GitHub: **Settings → Pages**.
2. תחת **Build and deployment**:
   - **Source:** בחר **GitHub Actions** (לא "Deploy from a branch").
3. ה-workflow כבר קיים בפרויקט: `.github/workflows/deploy.yml`. אחרי push ל-`main` ה-Action ירוץ אוטומטית. אפשר גם להריץ ידנית: **Actions** → **Deploy to GitHub Pages** → **Run workflow**.
4. ב-`vite.config.ts` כבר מוגדר `base: '/tax-refund-calculator/'` (חובה ל-GitHub Pages).
5. אם ה-deploy נכשל: וודא ש-**Settings → Pages → Source** הוא **GitHub Actions** (לא branch). הקישור אחרי הצלחה:

- `https://YOUR_USERNAME.github.io/tax-refund-calculator/`

---

## סיכום

| שלב | פעולה |
|-----|--------|
| 1 | יצירת ריפו ציבורי ב-GitHub (בלי README / .gitignore) |
| 2 | `git remote add origin ...` ו-`git push -u origin main` |
| 3 | פריסה: **Vercel** (מומלץ) או **GitHub Pages** |

**קישור סופי אחד לשימוש מכל מחשב:**

- **Vercel:** `https://[שם-הפרויקט]-xxxx.vercel.app` (יופיע אחרי ה-Deploy).
- **GitHub Pages:** `https://YOUR_USERNAME.github.io/tax-refund-calculator/`

שני הקישורים הם HTTPS ונגישים מכל מחשב בדפדפן.
