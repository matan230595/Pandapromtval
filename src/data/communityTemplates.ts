import { Prompt } from '../types';

export interface CommunityTemplateItem {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  platform: 'ChatGPT' | 'Claude' | 'Gemini' | 'Universal';
  category: string;
  installs: number;
  author: string;
}

export const POPULAR_COMMUNITY_TEMPLATES: CommunityTemplateItem[] = [
  {
    id: 'comm-react-expert',
    title: 'מפתח React & TypeScript בכיר',
    description: 'יצירת קומפוננטות React מודרניות, נקיות ונגישות עם Tailwind CSS ו-TypeScript מדויק.',
    content: `אתה מהנדס Frontend בכיר ומומחה ל-React 18+, TypeScript ו-Tailwind CSS.
המשימה שלך היא לבנות קומפוננטה מלאה, מודולרית ונקייה בהתבסס על ההגדרה הבאה:
תיאור: $(DESCRIPTION)
דרישות ספציפיות: $(REQUIREMENTS)

כללים קריטיים:
1. ספק קוד TypeScript מלא ללא קיצורים.
2. השתמש ב-Tailwind CSS בלבד לעיצוב.
3. הקפד על נגישות (a11y) וטיפול שגיאות מלא.`,
    tags: ['React', 'TypeScript', 'Frontend', 'Coding'],
    platform: 'Claude',
    category: 'פיתוח תוכנה',
    installs: 2450,
    author: 'DevMaster'
  },
  {
    id: 'comm-seo-writer',
    title: 'כותב מאמרי SEO ובלוג מעמיק',
    description: 'כתיבת מאמרי עומק מותאמים למנועי חיפוש עם כותרות H2/H3, שאלות נפוצות וצפיפות מילות מפתח.',
    content: `אתה מומחה תוכן ו-SEO בינלאומי. כתוב מאמר מקיף ומעמיק עבור הנושא הבא:
נושא המאמר: $(TOPIC)
קהל יעד: $(AUDIENCE)
מילות מפתח עיקריות: $(KEYWORDS)
טון דיבור: $(TONE)

הנחיות מבנה:
- כותרת מושכת (Title Tag) ותקציר Meta Description.
- פתיח מסקרן עם שאלת וו (Hook).
- כותרות משנה H2 ו-H3 מסודרות.
- פסקת סיכום עם הנעה לפעולה (CTA) ברורה.`,
    tags: ['SEO', 'תוכן', 'שיווק', 'Writing'],
    platform: 'ChatGPT',
    category: 'שיווק ותוכן',
    installs: 1890,
    author: 'ContentPro'
  },
  {
    id: 'comm-meeting-summary',
    title: 'סיכום פגישות ומסמכים ניהוליים',
    description: 'המרת תמליל פגישה או מסמך ארוך לפרוטוקול מקצועי עם משימות (Action Items) ואחראים.',
    content: `אתה עוזר ניהולי בכיר (Executive Assistant). סכם את הפגישה / המסמך הבא:
טקסט הפגישה:
$(TRANSCRIPT)

פורמט הפלט המבוקש:
1. **תקציר מנהלים (Executive Summary)**: 2-3 משפטים מתמצתים.
2. **החלטות מרכזיות שהתקבלו**: רשימה ממוספרת.
3. **משימות להמשך (Action Items)**: טבלה עם [משימה | אחראי | תאריך יעד].
4. **נושאים לדיון הבא**: נקודות פתוחות.`,
    tags: ['פגישות', 'ניהול', 'פרודוקטיביות'],
    platform: 'Gemini',
    category: 'פרודוקטיביות',
    installs: 1620,
    author: 'ProductivityLead'
  },
  {
    id: 'comm-code-security',
    title: 'סקירת קוד, אבטחה וביצועים (Code Audit)',
    description: 'בדיקת קוד מעמיקה לגילוי פרצות אבטחה, צווארי בקבוק וביצועים לפי OWASP.',
    content: `פעל כארכיטקט תוכנה ומומחה אבטחת מידע (AppSec / OWASP).
סקור את קטע הקוד הבא:
\`\`\`$(LANGUAGE)
$(CODE)
\`\`\`

ספק דוח מובנה:
1. **סיכום איכות ואבטחה**: ציון מדד איכות מ-1 עד 10.
2. **פרצות אבטחה וסיכונים פוטנציאליים**: (SQL Injection, XSS, ReDoS וכד').
3. **בעיות ביצועים וזיכרון**: סיבוכיות זמן וריצה.
4. **גרסה מתוקנת ומשופרת של הקוד**: קוד מוכן להעתקה.`,
    tags: ['Security', 'Audit', 'CleanCode'],
    platform: 'Claude',
    category: 'אבטחת מידע',
    installs: 1380,
    author: 'SecAuditor'
  },
  {
    id: 'comm-linkedin-viral',
    title: 'פוסט לינקדאין ויראלי ומקצועי',
    description: 'ניסוח פוסטים מושכים ואישיים ללינקדאין עם פורמט שבירת שורות ואחוזי המרה גבוהים.',
    content: `אתה אסטרטג מיתוג אישי ומוביל דעה בלינקדאין עם מאות אלפי עוקבים.
כתוב פוסט לינקדאין משפיע המבוסס על התובנה / הסיפור הבא:
נושא/סיפור: $(STORY)
לקח מרכזי: $(LESSON)

הנחיות:
- שורת פתיחה (Hook) חזקה שלא נחתכת לפני ה-"see more".
- שורות קצרות ורווחי פסקאות לקריאה נוחה במובייל.
- טון אותנטי, צנוע אך מלא ידע.
- שאלת מעורבות לסיום (Engagement question).
- 3 תגיות (#) רלוונטיות.`,
    tags: ['LinkedIn', 'שיווק', 'SocialMedia'],
    platform: 'ChatGPT',
    category: 'שיווק ותוכן',
    installs: 2100,
    author: 'BrandArchitect'
  }
];
