<div dir="rtl">

# DEPENDENCY MAP

## Frontend -> Backend
* `App.tsx`, `PromptTester.tsx` קוראים ל-`fetch('/api/gemini/...')`.
* הבקשות נשלחות ל-`server.ts`.

## Backend -> External APIs
* `server.ts` קורא ל-Gemini API בעזרת `@google/genai`.

## Frontend -> Database
* קריאות ישירות ל-Firebase Services (Firestore/Auth) מתבצעות מקומפוננטות כגון `CommunityView.tsx`, וייתכן מ-`App.tsx` עבור פרומפטים פרטיים.

</div>
