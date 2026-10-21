<div dir="rtl">

# 19. ניתוח סיכונים (Risks)

* **Security Risk**: ללא חוקי Firestore מדויקים, כל גורם יכול למחוק את טבלת ה-`public_prompts`. חומרה: P0.
* **Cost Risk**: בהיעדר Rate Limiting על נקודות הקצה של `server.ts`, ניתן "לשאוב" את תקציב ה-GenAI (אלא אם ה-API Key המוטמע עצמו נמצא תחת תקרת הוצאות).
* **Maintenance Risk**: שבירה של `App.tsx` תפיל את כלל האפליקציה בגלל המרכזיות שלה.

</div>
