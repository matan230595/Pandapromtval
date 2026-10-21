<div dir="rtl">

# 03. ארכיטקטורה (Architecture)

האפליקציה מיישמת **Client-Heavy SPA** משולב ב-**BFF (Backend For Frontend)**.

## שכבת הלקוח (Client)
* פועלת בתור React Single Page Application המוגש על ידי שרת ה-Node המרכזי.
* משתמשת בתבנית ה-React Hooks בהיקף נרחב, בעיקר `useState` ו-`useEffect`.
* **בעיה ארכיטקטונית ניכרת**: `App.tsx` הופך להיות מרכזיה (Monolithic Component) לכלל ה-State של המשתמש. אין שימוש ב-Context API או Redux. זה מוביל ל-Prop drilling (העברת props למטה לאורך עצי הקומפוננטות).

## שכבת הגישה לנתונים (Data Layer)
* גישה **היברידית**.
* **לנתוני תצורה מקומיים** (Theme, Language, Automation Rules) המערכת משתמשת ב-`localStorage`.
* **לנתוני הליבה** (Prompts, Folders, User Info) המערכת פונה ישירות מתוך ה-Client אל Firebase (BaaS) בעזרת אימות Auth. זהו מודל פיתוח מקובל ב-Firebase, המאפשר Real-time sync.

## שכבת השרת (Server / BFF)
* תפקידו העיקרי של `server.ts` הוא לשמש סוכן בטוח עבור התקשרות לעולם החיצון שבו נדרש סוד (API Key).
* הבקשות של הלקוח ליצירת תוכן נשלחות ל-`/api/gemini/*`.
* ב-Development: השרת עוטף את שרת ה-Vite בעזרת Middleware, וכך ניתן לקבל Hot Module Reload יחד עם פניות API מאותו הפורט בדיוק (פורט 3000 המאולץ).
* ב-Production: השרת מגיש קבצים סטטיים מהתיקייה `dist/`.

</div>
