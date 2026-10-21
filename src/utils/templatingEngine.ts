import { CustomPlaceholder } from '../types';

/**
 * Universal placeholder extraction regex:
 * Matches:
 * 1. {{variable}} or {{variable:type}} or {{variable:type:option1,option2}}
 * 2. $(variable)
 * 3. [VARIABLE_NAME] (uppercase alphanumeric with underscore, min 2 chars)
 * 4. <variable_name>
 */
export const PLACEHOLDER_REGEX = /\{\{([^}]+)\}\}|\$\(([^)]+)\)|\[([A-Z0-9_]{2,})\]|<([a-zA-Z0-9_]{2,})>/g;

export interface ExtractedPlaceholder extends CustomPlaceholder {
  sourceSyntax: 'doubleCurly' | 'dollarParen' | 'bracket' | 'angleBracket';
  rawMatch: string;
}

/**
 * Extracts all placeholders from template text and merges them with user-defined custom placeholders.
 */
export function extractPlaceholders(
  text: string,
  existingCustomDefs: CustomPlaceholder[] = []
): ExtractedPlaceholder[] {
  if (!text) return [];

  const defsMap = new Map<string, CustomPlaceholder>();
  existingCustomDefs.forEach(def => {
    defsMap.set(def.name.toLowerCase().trim(), def);
  });

  const foundPlaceholders = new Map<string, ExtractedPlaceholder>();
  const regex = new RegExp(PLACEHOLDER_REGEX.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const rawMatch = match[0];
    let key = '';
    let sourceSyntax: ExtractedPlaceholder['sourceSyntax'] = 'doubleCurly';
    let inlineType: CustomPlaceholder['type'] | undefined;
    let inlineOptions: string[] | undefined;

    if (match[1]) {
      // {{variable}} or {{variable:type:options}}
      const parts = match[1].split(':');
      key = parts[0].trim();
      sourceSyntax = 'doubleCurly';
      if (parts[1]) {
        const t = parts[1].trim().toLowerCase();
        if (['text', 'textarea', 'select', 'number', 'date'].includes(t)) {
          inlineType = t as CustomPlaceholder['type'];
        }
      }
      if (parts[2]) {
        inlineOptions = parts[2].split(',').map(o => o.trim()).filter(Boolean);
      }
    } else if (match[2]) {
      // $(variable)
      key = match[2].trim();
      sourceSyntax = 'dollarParen';
    } else if (match[3]) {
      // [VARIABLE]
      key = match[3].trim();
      sourceSyntax = 'bracket';
    } else if (match[4]) {
      // <variable>
      key = match[4].trim();
      sourceSyntax = 'angleBracket';
    }

    if (!key) continue;
    const lowerKey = key.toLowerCase();

    if (!foundPlaceholders.has(lowerKey)) {
      const existing = defsMap.get(lowerKey);

      // Guess human-friendly label
      const humanLabel = existing?.label || formatHumanLabel(key);

      foundPlaceholders.set(lowerKey, {
        id: existing?.id || `ph_${lowerKey}`,
        name: key,
        label: humanLabel,
        type: existing?.type || inlineType || guessPlaceholderType(key),
        defaultValue: existing?.defaultValue || (inlineOptions ? inlineOptions[0] : ''),
        options: existing?.options || inlineOptions || guessDefaultOptions(key),
        description: existing?.description || '',
        required: existing?.required ?? true,
        sourceSyntax,
        rawMatch
      });
    }
  }

  // Also include any custom defs defined for this prompt even if not yet in text
  existingCustomDefs.forEach(def => {
    const lowerKey = def.name.toLowerCase().trim();
    if (!foundPlaceholders.has(lowerKey)) {
      foundPlaceholders.set(lowerKey, {
        ...def,
        sourceSyntax: 'doubleCurly',
        rawMatch: `{{${def.name}}}`
      });
    }
  });

  return Array.from(foundPlaceholders.values());
}

/**
 * Renders template text by replacing all placeholders with user-provided values.
 */
export function renderTemplateText(
  text: string,
  values: Record<string, string>,
  options: { fallbackToDefault?: boolean; placeholderDefs?: CustomPlaceholder[] } = {}
): string {
  if (!text) return '';

  const defsMap = new Map<string, CustomPlaceholder>();
  (options.placeholderDefs || []).forEach(d => defsMap.set(d.name.toLowerCase(), d));

  return text.replace(PLACEHOLDER_REGEX, (rawMatch, p1, p2, p3, p4) => {
    let key = '';
    if (p1) key = p1.split(':')[0].trim();
    else if (p2) key = p2.trim();
    else if (p3) key = p3.trim();
    else if (p4) key = p4.trim();

    const lowerKey = key.toLowerCase();
    const userVal = values[key] ?? values[lowerKey];

    if (userVal !== undefined && userVal.trim() !== '') {
      return userVal;
    }

    if (options.fallbackToDefault) {
      const def = defsMap.get(lowerKey);
      if (def?.defaultValue) return def.defaultValue;
    }

    return rawMatch;
  });
}

/**
 * Helper to generate human-readable label from placeholder name.
 */
export function formatHumanLabel(name: string): string {
  const translations: Record<string, string> = {
    topic: 'נושא הפרומפט',
    audience: 'קהל יעד',
    target_audience: 'קהל יעד',
    tone: 'טון וסגנון כתיבה',
    language: 'שפת הפלט',
    role: 'תפקיד המודל (Persona)',
    goal: 'מטרת התוצאה',
    keywords: 'מילות מפתח',
    product_name: 'שם המוצר',
    company_name: 'שם החברה',
    industry: 'תעשייה / תחום',
    format: 'פורמט מבוקש',
    length: 'אורך מבוקש',
    constraints: 'מגבלות והנחיות',
    context: 'הקשר ורקע',
    question: 'שאלה / משימה',
    text: 'טקסט מקור',
    code: 'קוד מקור'
  };

  const lower = name.toLowerCase().replace(/[\s-]+/g, '_');
  if (translations[lower]) return translations[lower];

  // Title case from snake_case or camelCase
  return name
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, c => c.toUpperCase());
}

/**
 * Helper to guess type based on variable name.
 */
export function guessPlaceholderType(name: string): CustomPlaceholder['type'] {
  const lower = name.toLowerCase();
  if (lower.includes('date') || lower.includes('deadline')) return 'date';
  if (lower.includes('count') || lower.includes('number') || lower.includes('amount') || lower.includes('age')) return 'number';
  if (lower.includes('tone') || lower.includes('style') || lower.includes('format') || lower.includes('language')) return 'select';
  if (lower.includes('context') || lower.includes('code') || lower.includes('text') || lower.includes('description') || lower.includes('content') || lower.includes('background')) return 'textarea';
  return 'text';
}

/**
 * Helper to provide smart predefined options for select-type variables.
 */
export function guessDefaultOptions(name: string): string[] | undefined {
  const lower = name.toLowerCase();
  if (lower.includes('tone') || lower.includes('style')) {
    return ['מקצועי ורשמי', 'שיווקי ומניע לפעולה', 'קליל וידידותי', 'סמכותי ומדעי', 'יצירתי והומוריסטי'];
  }
  if (lower.includes('format')) {
    return ['סעיפים ומבנה נקודות', 'טבלה מפורטת', 'פסקאות מורחבות', 'קוד מוכן להרצה', 'מדריך צעד-אחר-צעד'];
  }
  if (lower.includes('language')) {
    return ['עברית', 'אנגלית (English)', 'ספרדית', 'ערבית'];
  }
  if (lower.includes('length')) {
    return ['קצר ותמציתי (עד 150 מילים)', 'בינוני (300-500 מילים)', 'מעמיק ומקיף (800+ מילים)'];
  }
  return undefined;
}
