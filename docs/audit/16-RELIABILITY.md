<div dir="rtl">

# 16. אמינות (Reliability)

* המערכת נסמכת באופן קריטי על זמינות Firestore וזמינות Gemini API. 
* במידה ו-Firebase נופל או שאין אינטרנט, המערכת חוזרת ל-Fallback של LocalStorage. ה-Fallback הזה אינו מושלם (כי אין סינכרון חוזר-דו-כיווני אחרי חזרת רשת, זה נדרש פיתוח של Offline Sync אמיתי).

</div>
