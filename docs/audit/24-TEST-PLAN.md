<div dir="rtl">

# 24. תוכנית בדיקות עתידית (Test Plan)

| TEST-ID | Scope | Method | Expected |
|---|---|---|---|
| TST-01 | API Endpoint `/chat` | Unit / E2E | החזרת 401 עבור בקשה ללא טוקן אימות (אחרי ביצוע TASK-002). |
| TST-02 | Firestore Security | Integration / Emulator | כתיבה ל-`users/123/prompts` באמצעות Token של `user-456` נכשלת עם Permission Denied. |
| TST-03 | Component Rendering | Unit (Jest) | `PromptTester` מרנדר הודעות שגויות בצורה בטוחה ללא XSS. |
| TST-04 | Core CRUD | UI / Cypress | משתמש יוצר פרומפט, עורך אותו, מוחק, והוא מוסר מה-UI ומה-Firestore במקביל. |

</div>
