<div dir="rtl">

# 20. המלצות (Recommendations)

* **P0 - אבטחה**: הוספת Firebase Security Rules חזקים למניעת מחיקת הקהילה מאיש זדוני, והוספת Middleware אימות ל-API של Express שיאשר רק קריאות של מי שנושא Token תקין של פיירבייס.
* **P1 - ארכיטקטורה**: שבירת `App.tsx` למודולים `usePrompts.ts`, `useFolders.ts` וכד', ופיצול תצוגות (Views) לקבצים נפרדים בתיקיית `views/` או בתוך הראוטר.
* **P2 - ביצועים**: פיצול ספריות ה-React (Code splitting) כגון העברת `reactflow` לטעינה דינאמית (Lazy load) רק כשהמשתמש פותח את מסך ה-Workflows.
* **P3 - חווית משתמש**: הוספת תמיכה במצב לא-מקוון (Offline) באמצעות `enableIndexedDbPersistence` של Firebase Firestore.

</div>
