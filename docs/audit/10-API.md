<div dir="rtl">

# 10. ממשקי תכנות (API)

שרת ה-Express (`server.ts`) מגיש את ה-Endpoints הבאים לממשק הלקוח:

## Endpoints

1. **`POST /api/gemini/chat`**
   - **שימוש**: צ'אט (Playground) לבדיקת הפרומפט מול המודל.
   - **קלט**: `{ messages, systemInstruction, temperature, modelId }`
   - **פלט**: `{ text: string }`
2. **`POST /api/gemini/suggest-folder`**
   - **שימוש**: מיון אוטומטי של פרומפט חדש לתיקייה באמצעות Gemini (סיווג חכם).
   - **קלט**: `{ content, folders, promptsContext }`
   - **פלט**: `{ folderId: string, reason: string }`
3. **`POST /api/gemini/semantic-search`**
   - **שימוש**: חיפוש סמנטי (חיפוש לפי כוונה) מתוך רשימת פרומפטים קיימת.
   - **קלט**: `{ query, prompts }`
   - **פלט**: `{ results: string[] }` (מערך של מזהי פרומפטים תואמים).
4. **`POST /api/gemini/collection-chat`**
   - **שימוש**: שיחה עם "Vault Bot" ששואל שאלות על מאגר הפרומפטים האישי.
   - **קלט**: `{ messages, collectionData }`
5. **`POST /api/gemini/analyze-readability`**
   - **שימוש**: ניתוח ציון קריאות ומורכבות של פרומפט, מתן טיפים לשיפור.
6. **`POST /api/gemini/smart-import`**
   - **שימוש**: המרת טקסט/URL/PDF לאוסף של פרומפטים מובנים (JSON).

## סיכונים
- אין כרגע Rate Limiting. יוזר זדוני יכול להספים את ה-API של השרת, מה שיגרום לחריגה ממכסת ה-API של Gemini. נדרש להוסיף `express-rate-limit`.
- אין אימות (Auth Middleware) מול השרת. למרות שהמידע נשמר בפיירבייס, כל אחד שיגלה את ה-URL של השרת יכול להריץ שאילתות חינמיות על חשבון מפתח ה-Gemini של המערכת.

</div>
