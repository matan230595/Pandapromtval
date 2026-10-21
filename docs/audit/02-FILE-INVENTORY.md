<div dir="rtl">

# 02. מלאי קבצים (File Inventory)

רשימת הקבצים המרכזיים במערכת לאחר סינון של artifacts וכלי agent שונים (קבצי `.cjs` הושמטו ממסמך זה כיוון שאינם משתתפים ב-Build האמיתי):

## שורש (Root)
* `package.json` / `package-lock.json` - הגדרות ספריות וסקריפטים.
* `server.ts` - שרת ה-Backend ב-Express.
* `vite.config.ts` - הגדרות בילדר, זיהוי React + Tailwind.
* `tsconfig.json` - חוקי TypeScript.
* `index.html` - תבנית כניסה לאפליקציית ה-SPA.
* `firebase-applet-config.json` / `metadata.json` - קבצי הגדרות תצורה לאייג'נט המארח.

## Source (src/)
* `main.tsx` - טעינת האפליקציה אל ה-DOM.
* `App.tsx` - ה-View Controller הראשי, שומר את מצב המערכת ומתקשר עם Firebase (כ-2900 שורות).
* `types.ts` - המגדיר המרכזי למבני נתונים (Interfaces כגון `Prompt`, `Folder`, `PublicPrompt`).
* `firebase.ts` - אתחול והגדרת חיבור ה-SDK של פיירבייס.
* `index.css` - עיצוב גלובלי וטעינת ה-Tailwind.

## Components (src/components/)
תיקייה זו מכילה 35+ קבצי TSX. הבולטים בהם:
* `CommunityView.tsx` - טוען את קהילת הפרומפטים הציבוריים והתגובות.
* `DashboardView.tsx` - ממשק סטטיסטי ומפת החום.
* `PromptTester.tsx` - קומפוננטת הצ'אט/בדיקת קלט עם תמיכה בדיבוב קולי ושרשור.
* `VisualWorkflow.tsx` - ציור מפות חשיבה (זרימת פרומפטים) מבוסס reactflow.
* `ComparePromptsView.tsx` - כלי השוואת A/B בין שני פרומפטים או גרסאות.
* `SmartVariablesModal.tsx` - ניתוח והזנת משתנים חכמים בתוך פרומפט (למשל `$(VAR)`).
* `Toast.tsx` - מערכת התראות מותאמת אישית ללקוח.
* מודאלים מרובים: `AuthModal`, `BulkRenameModal`, `DeleteConfirmModal` ועוד.

</div>
