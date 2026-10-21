<div dir="rtl">

# 09. מסד הנתונים (Database)

המערכת משתמשת ב-Firebase Firestore כמסד הנתונים הראשי. מדובר במסד נתונים NoSQL, מבוסס מסמכים ואוספים (Collections and Documents).

## ישויות (Entities)

1. **Users (`users/{uid}`)**
   - אין יצירה מפורשת של מסמך המשתמש עצמו בקוד שראינו (למעט כנראה פרופיל), אך ה-UID של המשתמש מנוצל כאוסף-אב (Parent Collection).
2. **Prompts פרטיים (`users/{uid}/prompts`)**
   - המסמכים עצמם בתוך האוסף מתבססים על ממשק `Prompt`.
   - השדות המרכזיים: `title`, `content`, `tags`, `folder`, `favorite`, `useCount`, `history`.
3. **Folders (`users/{uid}/folders`)**
   - שדות: `id`, `name`, `icon`, `color`.
4. **Public Prompts (`public_prompts`)**
   - זהו אוסף ברמת השורש, המשמש את כלל הקהילה.
   - שדות נוספים: `authorId`, `authorName`, `likes` (מערך מזהי משתמשים), `commentsCount`.
5. **Comments (`public_prompts/{id}/comments`)**
   - תת-אוסף (Sub-collection) המאחסן תגובות של משתמשים על פרומפט קהילתי מסוים.

## סיכונים והמלצות
- **קריאות ועלויות**: במידה והאפליקציה מתרחבת, הבאה (fetching) של `public_prompts` ללא הגבלת כמות (Pagination) תוביל לתשלום מיותר ל-Google Cloud (עקב כמות Read Operations גדולה).
- **היעדר Data Migration**: כידוע, ב-Firestore קשה לבצע מיגרציה (שינוי מבנה) לנתונים היסטוריים. יש לוודא שהאפליקציה תמיד תומכת אחורנית בשדות חסרים (כגון `useCount` שלא היה קיים תמיד).

</div>
