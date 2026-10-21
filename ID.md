<div dir="rtl">

# תעודת זהות למערכת (ID)

* **שם:** PromptVault (או "כספת הפרומפטים")
* **סוג:** Web Application (Single Page Application + Express Backend)
* **מטרת על:** ניהול, בדיקה, שמירה, ושיתוף של פרומפטים מבוססי AI, כולל שימוש בכלים חכמים כמו הכתבה קולית, שרשראות (Workflows) ועוד.
* **בעיה:** פרומפטים בדרך כלל מפוזרים בין אפליקציות שונות, קשה לעקוב אחר גרסאות, לבדוק אותם ולשתף אותם בקלות.
* **משתמשים:** מפתחי בינה מלאכותית, Prompt Engineers, משתמשים כבדים בכלים כמו ChatGPT, Gemini או Claude.
* **מצב:** MVP מתקדם / Pre-Production. (עובר Build, פועל ללא שגיאות קריטיות).
* **Stack:** 
  * Frontend: React 18, Vite, TailwindCSS, Motion, Recharts, React Flow.
  * Backend: Node.js, Express.js.
  * Database/Auth: Firebase Firestore, Firebase Authentication.
  * AI: Gemini SDK (`@google/genai`).
* **Architecture:** תצורת Full-stack. ה-Frontend מתקשר למסד נתונים (Firebase) ישירות עבור נתונים בסיסיים ו-Auth, ונעזר בשרת Express לצורך תקשורת מאובטחת ל-Gemini API (כדי לא לחשוף מפתחות API ללקוח).
* **Frontend:** React + Tailwind, UI רספונסיבי, תמיכה בתצוגת יום/לילה, שילוב אנימציות. נשען על קובץ `App.tsx` גדול מאוד.
* **Backend:** Express עוטף בקשות AI למגוון יישומים: עריכה סמנטית, המלצת תיקיות, עוזר וירטואלי מובנה (Chat Sandbox), יבוא חכם ועוד. מגיש גם את קבצי ה-Client ב-production.
* **Database:** Firestore (Google Cloud). ישויות: משתמשים (`users`), תיקיות, פרומפטים. פרומפטים ציבוריים ב-`public_prompts`.
* **Infrastructure:** ריצה ב-Docker או שירותי ענן (כגון Google Cloud Run ע"ג כלי הפלטפורמה). פורט 3000 קשיח.
* **APIs:** 
  - `POST /api/gemini/chat`
  - `POST /api/gemini/suggest-folder`
  - `POST /api/gemini/collection-chat`
  - `POST /api/gemini/analyze-readability`
  - `POST /api/gemini/smart-import`
* **Integrations:** Firebase Auth (Google Provider + Email/Password).
* **Authentication:** Firebase Auth. משולב בצד הלקוח (Client-side Login).
* **Authorization:** מתבצע לרוב על ידי גישה ישירה ל-Collections משויכים ב-Firestore (`users/{userId}/...`). דורש וידוא חוקי Firestore.
* **Deployment:** מתבצע כקונטיינר אחיד המריץ Node.js על `dist/server.cjs` המגיש גם את ה-Frontend ב-`dist/`.
* **Environments:** Development (Vite HMR/Middleware) / Production (Express static file serving).
* **Entry Points:** `server.ts` (Backend), `src/main.tsx` (Frontend).
* **Critical Components:** `App.tsx` (מנהל State מרכזי), `PromptTester.tsx` (בדיקת פרומפטים מול AI), `DashboardView.tsx` (מידע וסטטיסטיקות).
* **Critical Flows:**
  1. יצירת ועריכת פרומפט.
  2. הרצת בדיקה בפרומפט (Sandbox).
  3. שיתוף פרומפט לקהילה.
  4. יצירת "שרשרת" (Visual Workflow) להפעלת פרומפטים ברצף.
* **Security Model:** מפתחות API (כגון GEMINI_API_KEY) נמצאים רק ב-Backend. גישה ל-DB כרוכה ב-Firebase Auth.
* **Dependencies:** `@google/genai`, `firebase`, `react`, `reactflow`, `recharts`, `express`.
* **Tests:** כרגע אין קבצי בדיקות אוטומטיות מבוססות (כמו Jest/Cypress). ההסתמכות היא על Type Checking (`tsc`) ו-Build.
* **Monitoring:** אין אינטגרציה רשמית לניטור (כגון Sentry). 
* **Backups:** מנוהל על ידי שירותי Firestore המנוהלים.
* **Known Issues:** הקובץ `App.tsx` שוקל קרוב ל-3000 שורות. חוב טכני כבד עלול להקשות על תחזוקה. 
* **Technical Debt:** מבנה אחיד מאוד ב-`App.tsx`, אין Context או Redux לניהול Global State, מה שיוצר המון Prop Drilling.
* **Production Readiness:** Partial. ה-Build עובר בהצלחה והמערכת פועלת, אך יש לשפר ארכיטקטורה, להוסיף טסטים ולכתוב חוקי Firestore Security.

---

### המערכת במשפט אחד
מערכת ניהול, שיתוף, ובדיקה מתקדמת לפרומפטים (Prompt Vault) עבור משתמשי בינה מלאכותית, המשלבת כלי פיתוח חזקים כגון בדיקות AI אוטומטיות ושרשראות קלטים.

### המערכת ב-30 שניות
PromptVault הוא כלי עבודה למשתמשים ומפתחים העובדים באופן רצוף עם פרומפטים. המערכת שומרת, מסווגת ומנתחת פרומפטים בעזרת AI. היא מאפשרת כתיבת פרומפטים ויצירת צינורות מידע (Workflows) בהם פרומפט אחד מזין את הבא אחריו. היא מספקת Insights חכמים לגבי דפוסי השימוש (באמצעות דאשבורדים עתירי נתונים ומפות חום). הממשק כולו ב-React מותאם לעברית (RTL), והגב שלו הוא Express Proxy שמסתיר את מפתח ה-Gemini, בעוד המידע נשמר ב-Firebase.

### המערכת ב-5 דקות
ראה הרחבה בקובץ ה-Architecture וה-Executive Summary שיווצרו במסגרת ה-Audit.

### התמונה המלאה
המערכת מורכבת מ-Frontend עשיר מאוד (מאות שורות קוד לקומפוננטות UI שונות שיושבות תחת `App.tsx`), עם תמיכה ביבוא חכם מקבצי PDF (דרך URL או Base64), יצירת חלופות מול מודלים, זיהוי קולי לבדיקות ועוד. המטרה היא להוות ה"Github" או ה"Postman" של כותבי פרומפטים למודלים גדולים, עם סביבת עבודה אחידה שמכילה גם את הקוד (פרומפט) וגם את הבדיקה שלו (Tester).

</div>
