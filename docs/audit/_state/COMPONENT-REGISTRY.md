<div dir="rtl">

# COMPONENT REGISTRY

*יתעדכן בהמשך הסריקה העמוקה.*

## Frontend (React)
- **App.tsx**: הליבה של האפליקציה. מנהל State כללי של פרומפטים, תיקיות, וניווט פנימי.
- **DashboardView**: תצוגת לוח הבקרה עם סטטיסטיקות ומפות חום.
- **CommunityView**: מסך הקהילה (שיתוף פרומפטים).
- **PromptTester**: צ'אט מול Gemini, כולל זיהוי קולי ותמיכה בשרשור.
- **VisualWorkflow**: ממשק drag-and-drop של React Flow ליצירת שרשראות פרומפטים.
- **Toast**: מערכת התראות מותאמות.

## Backend (Express)
- **server.ts / Express App**: מתווך בין ה-Client לבין Gemini API (מניעת חשיפת המפתח). כולל endpoints כמו `/api/gemini/chat`, `/api/gemini/suggest-folder`, `/api/gemini/semantic-search`, `/api/gemini/smart-import`.

## Database (Firebase)
- **Firestore**: מאחסן יוזרים, פרומפטים קהילתיים, תגובות, לייקים, וכנראה נתוני משתמש אישיים.
- **Auth**: מנוהל באמצעות Firebase Auth (Google Provider / Email).

</div>
