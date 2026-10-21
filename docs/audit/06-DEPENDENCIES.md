<div dir="rtl">

# 06. תלויות (Dependency Map)

## Client Dependencies
* **React / ReactDOM**: תשתית ממשק המשתמש.
* **ReactFlow**: ניהול תצוגת Workflows.
* **Recharts**: בניית מפות חום וגרפים בדאשבורד.
* **Lucide-React**: אייקונים עקביים.
* **Motion**: אנימציות נכנסות ויוצאות (Framer Motion).
* **TailwindCSS**: ספריית העיצוב המרכזית (כולל Vite Plugin).
* **Firebase SDK**: התחברות מהירה לענן גוגל.

## Server Dependencies
* **Express**: שרת מתווך.
* **@google/genai**: אינטראקציה מול שירותי Gemini.
* **esbuild / Vite**: בניית הפרויקט והרצתו במצב פיתוח (middleware mode).

## ניתוח סיכונים
* צימוד חזק (Tight Coupling) של `App.tsx` לכל ה-SDK של פיירבייס.
* תלות בקיומו של אינדקס Firestore אם מבוצעים חיפושים מתקדמים (דבר שעשוי לקרות ב-`CommunityView`).

</div>
