<div dir="rtl">

# CHANGELOG

*יעודכן במהלך הביצוע.*

</div>

TASK-001
נוסף: קובץ `firestore.rules` וכללי אבטחה קשוחים
נוסף: קובץ `firebase-blueprint.json` לתיעוד סכמת הנתונים
שונה: תצורה בשרת ה-Firestore
השפעה: אוסף הקהילה ונתוני המשתמשים מוגנים כעת מפני גישה זדונית.

TASK-002
נוסף: Middleware `authMiddleware` בשרת ה-Express עם `firebase-admin` לאימות טוקנים.
שונה: הגדרת מונקי-פאצ'ינג ל-`fetch` ב-`src/main.tsx` כדי להוסיף Authorization Header לכל קריאות `/api/gemini/`.
השפעה: ה-API מוגן כעת משימוש על ידי בוטים ודורש משתמש מחובר ל-Firebase.

TASK-003
נוסף: קומפוננטת `PromptEditor` בקובץ נפרד
נוסף: קומפוננטת `AppSidebar` בקובץ נפרד
שונה: `App.tsx` קוצר משמעותית והקוד הפך למודולרי וקריא יותר.
השפעה: שיפור משמעותי בארכיטקטורת המערכת ומניעת God Component.

TASK-004
נוסף: שימוש ב-`React.lazy` ו-`Suspense` לטעינת רכיבים כבדים (CommunityView, DashboardView, ועוד).
שונה: ייבוא סטטי הוחלף בייבוא דינמי.
השפעה: שיפור בזמני טעינה (TTI) וחלוקה נכונה של הבאנדל (Code Splitting).
