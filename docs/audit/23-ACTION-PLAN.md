<div dir="rtl">

# 23. תוכנית עבודה (Action Plan)

## PHASE 1 — Critical (Security & Auth)
**TASK-001** — יישום חוקי אבטחה של Firebase (Firestore Rules)
- **מטרה**: חסימת גישה לנתונים אישיים והגבלת מחיקת אוסף הקהילה.

**TASK-002** — אבטחת שרת ה-Express
- **מטרה**: וידוא שרק קריאות עם Authorization Header (Firebase ID Token) יכולות לגשת ל-`/api/gemini/*` וביצוע Validate ב-Backend כדי למנוע ניצול API Keys על ידי בוטים סוררים.

## PHASE 2 — Architecture (Refactoring)
**TASK-003** — פיצול הקובץ App.tsx
- **מטרה**: הוצאת הלוגיקה העסקית (ניהול Prompts ו-Folders) ל-Custom Hooks: `usePrompts.ts`, `useFolders.ts`. שבירת תצוגות (Views) לקבצים נפרדים לגמרי במקום קומפוננטות שמרונדרות פנימית.

## PHASE 3 — Performance
**TASK-004** — Code Splitting מבוסס ראוטינג / React Lazy
- **מטרה**: הקטנת הגודל של קובץ ה-JavaScript הראשי על ידי טעינה מאוחרת (Lazy loading) של ספריות כבדות כמו `recharts` ו-`reactflow`.

## סדר ביצוע
TASK-001 -> TASK-002 -> TASK-003 -> TASK-004

</div>
