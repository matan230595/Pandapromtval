import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-dev',
    name: 'פיתוח ותוכנה',
    color: '#3b82f6', // blue
    icon: 'Code2',
    description: 'פרומפטים לפיתוח קוד, ארכיטקטורה ו-Debugging',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-marketing',
    name: 'שיווק ותוכן',
    color: '#ec4899', // pink
    icon: 'Megaphone',
    description: 'קמפיינים, פוסטים לרשתות, בלוגים וקופי',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-productivity',
    name: 'פרודוקטיביות וניהול',
    color: '#10b981', // emerald
    icon: 'CheckSquare',
    description: 'סיכומי פגישות, תעדוף משימות ותכנון שבועי',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-creative',
    name: 'עיצוב ומדיה',
    color: '#8b5cf6', // purple
    icon: 'Palette',
    description: 'יצירת תמונות (Midjourney/DALL-E), סטוריבורד וקריאייטיב',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-research',
    name: 'מחקר ודאטה',
    color: '#f59e0b', // amber
    icon: 'Search',
    description: 'ניתוח נתונים, סקירות שוק והשוואת מידע',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cat-support',
    name: 'שירות ותמיכה',
    color: '#06b6d4', // cyan
    icon: 'MessageSquare',
    description: 'תשובות ללקוחות, מיילים רשמיים ופתרון בעיות',
    createdAt: new Date().toISOString()
  }
];

const STORAGE_KEY = 'promptvault_categories';

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load categories from localStorage:', err);
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories to localStorage:', err);
  }
}

export function getCategoryColor(categoryNameOrId: string, categories: Category[]): string {
  const found = categories.find(c => c.id === categoryNameOrId || c.name.toLowerCase() === categoryNameOrId.toLowerCase());
  return found?.color || '#6366f1';
}
