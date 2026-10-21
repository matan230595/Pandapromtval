<div dir="rtl">

# PromptVault - The Ultimate AI Prompt Manager

PromptVault היא סביבת עבודה אולטימטיבית למפתחי AI המנהלת את כל מחזור החיים של הפרומפטים - משלב הניסוח, דרך בדיקת יעילות אל מול מודלים, ועד שמירה בתיקיות ושיתוף לקהילה הרחבה.

## תכונות מרכזיות (Features)
* **עריכה מתקדמת**: כתיבת פרומפטים עם Syntax Highlighting מלא לעברית ואנגלית (auto-dir).
* **AI Sandbox**: מגרש משחקים לבדיקת הפרומפטים שלכם "על רטוב" מול מודלי Gemini.
* **Smart Import**: ייבוא טקסט מקובץ PDF או אתר חיצוני לתוך מודל נתונים של פרומפט מסודר.
* **Visual Workflows**: שרשור משימות וירטואליות כך שהפלט של פרומפט א' מוזרק ישירות כקלט לפרומפט ב' על גבי מפת זרימה ויזואלית.
* **Community**: שיתוף, מתן לייקים ותגובות עם חברי הקהילה.

## טכנולוגיות
* **Frontend**: React 18, Vite, TailwindCSS, Motion, Recharts.
* **Backend**: Node.js, Express, @google/genai SDK.
* **Database & Auth**: Firebase.

## פיתוח מקומי (Development)
1. שכפלו את המאגר (Clone).
2. ודאו שיש לכם Node.js מותקן.
3. הריצו `npm install`.
4. ודאו קיומו של קובץ `.env` המכיל מפתח `GEMINI_API_KEY`.
5. הריצו `npm run dev`. זה ירים את שרת ה-Backend המתווך וישרת את ממשק הלקוח במקביל.
6. גשו ל-`http://localhost:3000`.

## פריסה (Deployment / Production)
* `npm run build` בונה את הלקוח לתיקיית `dist/` ומקמפל את השרת ל-`dist/server.cjs`.
* הפעלת השרת בייצור (Production): `npm run start` (מפעיל את קובץ ה-cjs המקומפל שמגיש מתוכו את ה-SPA).

</div>
