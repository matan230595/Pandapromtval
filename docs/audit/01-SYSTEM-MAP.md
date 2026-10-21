<div dir="rtl">

# 01. מפת המערכת (System Map)

המערכת מחולקת ل-3 אזורים מרכזיים, שכולם עטופים יחד להגשה באמצעות קונטיינר אחד ב-Production:

## 1. צד לקוח (Frontend - React)
* **אחריות**: ניהול הממשק העשיר, state המשתמש, פעולות CRUD לפרומפטים, ניתוב תצוגות מדומה (View Controller).
* **מיקום פיזי**: תיקיית `src/` (מכיל `App.tsx` ו-`components/`).
* **אזורים מרכזיים בלקוח**:
  - `App.tsx`: מנהל התצוגות הראשי (Dashboard, Library, Community, Workflows).
  - `DashboardView`: הצגת תרשימים (Recharts).
  - `PromptTester`: בדיקת צ'אט, Sandbox כולל Audio API.
  - `CommunityView`: שיתוף והורדת פרומפטים מ/אל ציבור המשתמשים.

## 2. שרת תיווך (Backend - Express)
* **אחריות**: הגנה על Secret Keys (בעיקר `GEMINI_API_KEY`). מתן מענה לבקשות ה-Frontend שדורשות שימוש במודל השפה. הגשת קבצי ה-Build.
* **מיקום פיזי**: הקובץ `server.ts`.
* **אזורים מרכזיים בשרת**:
  - Middleware: הגשת Vite ב-Dev או `dist/` ב-Prod.
  - Endpoints: AI Routes (החזרת JSON).

## 3. מסדי נתונים וזהויות (Firebase)
* **אחריות**: שמירת נתוני האפליקציה באופן עמיד, ניהול גישה, זיהוי משתמש.
* **מיקום פיזי**: סביבת הענן של Firebase (Google Cloud). הגדרות בקובץ `src/firebase.ts`.
* **אזורים מרכזיים ב-DB**:
  - `users/{uid}/prompts`
  - `users/{uid}/folders`
  - `public_prompts`
  - `public_prompts/{id}/comments`

</div>
