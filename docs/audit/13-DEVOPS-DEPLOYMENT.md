<div dir="rtl">

# 13. פיתוח ותהליכי פריסה (DevOps / Deployment)

## סביבת פיתוח (Dev)
מנוהלת דרך הסקריפט `npm run dev`. סקריפט זה מתניע את השרת (`tsx server.ts`), אשר בתורו מתניע את שרת הפיתוח של Vite (`vite.createServer`) ב-Middleware Mode. זה מאפשר לפתח גם צד שרת וגם צד לקוח תחת פורט אחיד. HMR מבוטל כרגע ברמת הקונפיגורציה כדי למנוע הבהובים.

## סביבת פריסה (Production)
ה-build מבוצע בשני שלבים (קריאה ל-`npm run build`):
1. **Frontend**: Vite קורא ל-`vite build` ומייצר תיקיית `dist/` מינימלית עם קבצים סטטיים ומכווצים.
2. **Backend**: esbuild מקמפל את `server.ts` ל-`dist/server.cjs` תוך מחיקת תלויות חיצוניות (External packages) כדי לשמור את הקובץ קטן.
כדי להפעיל בפרודקשן השרת מורץ עם הפקודה `node dist/server.cjs`.

אין עדיין Pipeline מסודר ב-GitHub Actions לבדיקות או פריסות אוטומטיות.

</div>
