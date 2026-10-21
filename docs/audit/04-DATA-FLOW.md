<div dir="rtl">

# 04. ניתוח זרימת נתונים (Data Flow)

## FLOW-001: סנכרון פרומפטים מול הענן
**Trigger:** משתמש מתחבר (Login).  
**Entry point:** `App.tsx` (useEffect).  
**Steps:**
1. Firebase Auth מחזיר משתמש מאומת.
2. `App.tsx` מפעיל `onSnapshot` מול אוסף `users/{uid}/prompts`.
3. בכל שינוי בענן, הפונקציה מופעלת וה-Local state של `prompts` מתעדכן.
**Failure paths:** אין גישה לאינטרנט -> ממשיך להשתמש ב-`localStorage` באופן חלקי. (אין מנגנון אופליין רשמי, פרט ל-cache של פיירבייס שאולי פעיל).

## FLOW-002: שמירת פרומפט / עריכה
**Trigger:** לחיצה על "שמור" בעורך.  
**Entry point:** פונקציה `handleSave` ב-`App.tsx`.  
**Steps:**
1. ה-State מתעדכן מקומית (Optimistic UI) במערך `prompts`.
2. במידה ויש משתמש מחובר, מתבצעת קריאה ל-`setDoc` מול Firestore עבור אותו פרומפט.
3. סטטוס מסומן כ-"saved".

## FLOW-003: הרצת פרומפט מול מודל (Sandbox)
**Trigger:** לחיצה על "שלח" או "שופט AI" במסך `PromptTester`.  
**Entry point:** `handleSend` / `handleJudge`.  
**Steps:**
1. עדכון הממשק בלחיצה (הוספת הודעת המשתמש למערך ההודעות, הפעלת Loader).
2. הלקוח (Frontend) קורא לנקודת הקצה `POST /api/gemini/chat`.
3. השרת מקבל את המידע, שולף משתנה סביבה (או מהדר - כרגע נראה שקיים fallback ל-localStorage עבור המפתח? נדרוש לבדוק ב-`VisualWorkflow.tsx` - מצאתי שורות שמנסות לקרוא מה-localStorage).
4. השרת פונה אל שרתי גוגל (`@google/genai`).
5. התשובה חוזרת כ-JSON ומוצגת בממשק.

</div>
