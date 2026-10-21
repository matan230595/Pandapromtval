<div dir="rtl">

# 12. תשתיות (Infrastructure)

המערכת פשוטה מאוד ברמת התשתית:
* **Host Environment**: Docker Container המריץ תהליך של Node.js, אשר נקבע להיות בפורט 3000 בלבד (מאולץ על ידי סביבת האייג'נט המארחת).
* **BaaS (Backend as a Service)**: הענן של Firebase מנהל את כל הקשור לשמירת הנתונים וניהול משתמשים. המשמעות היא צמצום כמות ה-Boilerplate לניהול DB (אין צורך להקים Postgres או לנהל מיגרציות SQL).
* **AI Access**: נעשה באמצעות שירותי הענן הרשמיים של Google Gen AI.

</div>
