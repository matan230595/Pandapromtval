<div dir="rtl">

# Claude / Agent Operating Manual: PromptVault

## מהי המערכת
PromptVault היא מערכת מתקדמת מבוססת-Web (React + Vite + Express + Firebase) שנועדה למפתחי AI ול-Prompt Engineers. היא משמשת לארגון, בדיקה, השוואה, עריכה ושיתוף של פרומפטים.

## חוקים למפתח (אייג'נט / Claude / Gemini)

* **שפה**: עברית (RTL). כל רכיבי ה-UI אמורים להשתמש ב-`dir="rtl"`. חלק מהשדות הרגישים לטקסט מעורב צריכים להשתמש ב-`dir="auto"`.
* **API Keys**: אסור בתכלית האיסור לחשוף API Keys ב-Frontend (`import.meta.env`). מפתחות כמו `GEMINI_API_KEY` יושבים אך ורק ב-Backend (Express, ב-`server.ts`). הפרונטנד תמיד ניגש דרך `/api/...`.
* **עבודה עם Firebase**: כל פניה לנתונים פרטיים נעשית דרך הקולקציה של המשתמש: `users/{userId}/...`.
* **App.tsx החסום**: הקובץ `App.tsx` הוא כרגע כמעט 3000 שורות. **לפני כל שינוי בו**, עליך לחשוב פעמיים האם ניתן ליצור קומפוננטה נפרדת בתיקיית `components/` ולייבא אותה! 
* **Tailwind**: עיצוב נעשה רק דרך Utility classes. יש להמנע מכתיבת קבצי CSS.
* **חוקי תלויות (Dependencies)**: היזהר מהתקנת ספריות כבדות. אם התקנת ספריה חדשה, ודא שהיא מינימלית ככל האפשר.

## צעדים לאחר כל שינוי קוד (Definition of Done)
1. הרצת השלמות טיפוסיות (Typescript): `npm run lint` (`tsc --noEmit`).
2. וידוא רינדור תקין של ה-Build: `npm run build`.
3. רפרש של ה-Dev Server (או שימוש בכלים הרלוונטיים) לוודא שהאפליקציה עולה.
4. וידוא שום אזהרת שגיאה בקונסול לא נוספה עקב השינוי.

</div>
