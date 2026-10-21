<div dir="rtl">

# 08. מודל אבטחה (Security)

## סודות (Secrets) ומפתחות (Keys)
* המערכת משתמשת בקובץ `.env` בצד השרת להזנת `GEMINI_API_KEY`. השרת תוכנן בצורה נכונה כך שהוא מהווה חוצץ מול הדפדפן.
* **אזהרה**: יש לוודא שהמפתח לא דולף לפרונט דרך ה-`import.meta.env`.

## הרשאות (Authorization) ב-Firebase
* הקוד בפרונטנד כותב ל-`users/${uid}/prompts`.
* **כדי שמערכת תהיה מאובטחת**, נדרש ליישם בחשבון ה-Firestore בענן חוקים דומים לאלו:
  ```
  match /users/{userId}/{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
  ```
* אם החוקים בענן מאפשרים לכל אחד לכתוב, המערכת פרוצה ל-IDOR או שינוי נתוני אחרים.

## זריקות (Injections) וטיפול בקלט
* **HTML/XSS**: React מטפלת במניעת XSS באופן נייטיב בהזרקת טקסט. עם זאת, שימוש לא מבוקר בטקסטים (לדוגמה, ביבוא מקבצים או URL) ללא Sanitize מלא ב-`Smart Import` יכול להיות מסוכן אם תמצא דרך לעקוף את מנגנון הריאקט (למשל `dangerouslySetInnerHTML`, שלא קיים בבירור אבל מצריך וידוא בכל הקוד).

</div>
