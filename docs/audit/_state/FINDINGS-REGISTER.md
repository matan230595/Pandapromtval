<div dir="rtl">

# FINDINGS REGISTER (מרשם ממצאי ביקורת ותיקונים)

| מזהה | חומרה | רכיב / קובץ | תיאור הליקוי | סטטוס | פתרון מיושם |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FIND-001** | **CRITICAL** | `src/firebase.ts` | חיבור Firestore ל-(default) במקום ה-Database ID הייעודי שהוקצה (`ai-studio-promptvault-552a43d2-a582-4d20-8e33-c1065b443c92`). גרם לחוסר סנכרון ושגיאות מסד. | **מתוקן (FIXED)** | ייבוא `firestoreDatabaseId` מ-`firebase-applet-config.json` והעברתו ל-`getFirestore(app, dbId)`. |
| **FIND-002** | **CRITICAL** | `src/App.tsx` (שורה 1412) | ניסיון כתיבה לאוסף `community_prompts` שלא קיים ב-`firestore.rules` ושונה מ-`public_prompts` הנקרא ב-`CommunityView.tsx`. חסימת פרסום לקהילה. | **מתוקן (FIXED)** | תיקון יעד הפרסום לאוסף הרשמי `public_prompts` התואם לכללי האבטחה ולקומפוננטת התצוגה. |
| **FIND-003** | **HIGH** | `src/App.tsx` (שורה 1245) | ניסיון עדכון לאוסף גלובלי לא חוקי `prompts` ב-AutoTag במקום נתיב המשתמש המבודד `users/{uid}/prompts/{id}`. | **מתוקן (FIXED)** | תיקון עדכון ה-Firestore לנתיב המשתמש המאומת `users/{user.uid}/prompts/{id}` ועדכון מקומי ב-State & LocalStorage. |
| **FIND-004** | **HIGH** | `server.ts` | חסימת בקשות AI של משתמשים אורחים / במצב פיתוח על ידי `authMiddleware` שהחזיר 401 גורף בהיעדר Bearer Token גם כאשר מוגדר מפתח Gemini בשרת/בלקוח. | **מתוקן (FIXED)** | עדכון `authMiddleware` לתמיכה באימות אסימון Firebase כאשר קיים, עם Fallback מורשה אם קיים מפתח Gemini בשרת או כותרת `x-gemini-api-key`. |
| **FIND-005** | **MEDIUM** | `src/App.tsx`, `PromptEditor.tsx`, `PromptTester.tsx`, `VisualWorkflow.tsx`, `SmartImportModal.tsx` | שימוש בפונקציות חלון חסומות ב-iFrame (`window.alert`, `window.prompt`, `window.confirm`) שגרמו לשגיאות או קפיאות ממשק. | **מתוקן (FIXED)** | הסרת כל קריאות ה-alert/prompt/confirm והחלפתן בהודעות Toast, באנרים וממשקי משוב מובנים ונגישים. |
| **FIND-006** | **MEDIUM** | `src/App.tsx` (`toggleFavorite`) | לחיצה על כוכב מועדף מתוך כרטיס ברשימה גרמה לשינוי של `selectedPromptId` וסגירת עריכה דרך `handleSave`. | **מתוקן (FIXED)** | בידוד פונקציית `toggleFavorite` לעדכון שקט וממוקד של השדה `favorite` בלבד במסד הנתונים וב-Store ללא פגיעה בחוויית הגלישה. |
| **FIND-007** | **LOW** | `docs/audit/` | חוסר תיעוד עדכני לממצאי הביקורת המלאה והשלבים שבוצעו. | **מתוקן (FIXED)** | עדכון מקיף של קובצי ה-Audit, מרשם הממצאים ומצב הסריקה. |

</div>
