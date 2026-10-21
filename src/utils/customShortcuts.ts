export interface ShortcutBinding {
  ctrl?: boolean;   // Ctrl on Windows/Linux, Cmd/Meta on Mac
  alt?: boolean;    // Alt / Option
  shift?: boolean;  // Shift
  key: string;      // Lowercase key identifier, e.g. 'c', 's', 'n', 'enter', 'f', 'q', 'k'
  code?: string;    // Key code fallback, e.g. 'KeyC', 'KeyS'
  displayKey: string; // Pretty name for UI: 'C', 'S', 'N', 'Enter', etc.
}

export interface ShortcutDefinition {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'navigation' | 'tools';
  categoryLabel: string;
  defaultBinding: ShortcutBinding;
}

export const DEFAULT_SHORTCUTS: Record<string, ShortcutDefinition> = {
  copy: {
    id: 'copy',
    name: 'העתקת הפרומפט הנבחר',
    description: 'מעתיק מיידית את תוכן הפרומפט הנוכחי ללוח הגזירים (Clipboard)',
    category: 'core',
    categoryLabel: 'פעולות ליבה ושמירה',
    defaultBinding: { ctrl: true, key: 'c', displayKey: 'C' }
  },
  save: {
    id: 'save',
    name: 'שמירה מהירה וסנכרון',
    description: 'שומר את הפרומפט הנוכחי ומסנכרן אוטומטית לענן Firebase',
    category: 'core',
    categoryLabel: 'פעולות ליבה ושמירה',
    defaultBinding: { ctrl: true, key: 's', displayKey: 'S' }
  },
  new: {
    id: 'new',
    name: 'יצירת פרומפט חדש',
    description: 'פותח את עורך הפרומפטים החכם ליצירת תבנית חדשה',
    category: 'core',
    categoryLabel: 'פעולות ליבה ושמירה',
    defaultBinding: { ctrl: true, key: 'n', displayKey: 'N' }
  },
  run: {
    id: 'run',
    name: 'בדיקה והרצה ב-Sandbox',
    description: 'מריץ ובודק את הפרומפט בסימולטור Gemini Sandbox',
    category: 'core',
    categoryLabel: 'פעולות ליבה ושמירה',
    defaultBinding: { ctrl: true, key: 'enter', displayKey: 'Enter' }
  },
  search: {
    id: 'search',
    name: 'פתיחה והתמקדות בחיפוש',
    description: 'פותח ומציב את הסמן ישירות בשורת החיפוש בכל מסך',
    category: 'navigation',
    categoryLabel: 'ניווט וחיפוש',
    defaultBinding: { ctrl: true, key: 'f', displayKey: 'F' }
  },
  palette: {
    id: 'palette',
    name: 'Command Palette (לוח פקודות)',
    description: 'פותח את תפריט הפקודות והחיפוש המהיר של המערכת',
    category: 'navigation',
    categoryLabel: 'ניווט וחיפוש',
    defaultBinding: { ctrl: true, key: 'k', displayKey: 'K' }
  },
  template: {
    id: 'template',
    name: 'מילוי שדות תבנית ומשתנים',
    description: 'פותח טופס למילוי ערכים דינמיים לפני העתקת הפרומפט',
    category: 'tools',
    categoryLabel: 'כלים ושיתוף',
    defaultBinding: { alt: true, key: 't', displayKey: 'T' }
  },
  qr: {
    id: 'qr',
    name: 'ייצוא קוד QR לסריקה',
    description: 'מציג קוד QR לסריקה ושיתוף מהיר במכשיר נייד',
    category: 'tools',
    categoryLabel: 'כלים ושיתוף',
    defaultBinding: { ctrl: true, key: 'q', displayKey: 'Q' }
  },
  share: {
    id: 'share',
    name: 'שיתוף מתקדם ברשתות חברתיות',
    description: 'פתיחת חלון שיתוף מהיר ל-Twitter, WhatsApp, LinkedIn ויצירת קישור',
    category: 'tools',
    categoryLabel: 'כלים ושיתוף',
    defaultBinding: { ctrl: true, shift: true, key: 's', displayKey: 'S' }
  }
};

const STORAGE_KEY = 'promptvault_keyboard_shortcuts';

/**
 * Load user configured shortcuts from localStorage, merging with defaults
 */
export function loadCustomShortcuts(): Record<string, ShortcutBinding> {
  const result: Record<string, ShortcutBinding> = {};
  
  // Set defaults first
  Object.keys(DEFAULT_SHORTCUTS).forEach(id => {
    result[id] = { ...DEFAULT_SHORTCUTS[id].defaultBinding };
  });

  if (typeof window === 'undefined') return result;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.keys(parsed).forEach(id => {
          if (result[id] && parsed[id] && parsed[id].key) {
            result[id] = {
              ctrl: !!parsed[id].ctrl,
              alt: !!parsed[id].alt,
              shift: !!parsed[id].shift,
              key: String(parsed[id].key).toLowerCase(),
              code: parsed[id].code,
              displayKey: parsed[id].displayKey || String(parsed[id].key).toUpperCase()
            };
          }
        });
      }
    }
  } catch (err) {
    console.warn('Failed to load custom keyboard shortcuts:', err);
  }

  return result;
}

/**
 * Save user custom shortcuts to localStorage
 */
export function saveCustomShortcuts(shortcuts: Record<string, ShortcutBinding>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
  } catch (err) {
    console.warn('Failed to save custom keyboard shortcuts:', err);
  }
}

/**
 * Reset all custom shortcuts to defaults
 */
export function resetCustomShortcuts(): Record<string, ShortcutBinding> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return loadCustomShortcuts();
}

/**
 * Format shortcut keys for UI display
 */
export function formatShortcutKeys(binding: ShortcutBinding, isMac: boolean = false): string[] {
  const parts: string[] = [];
  if (binding.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (binding.alt) parts.push(isMac ? '⌥ Option' : 'Alt');
  if (binding.shift) parts.push(isMac ? '⇧ Shift' : 'Shift');
  parts.push(binding.displayKey || binding.key.toUpperCase());
  return parts;
}

/**
 * Checks if a KeyboardEvent matches a ShortcutBinding
 */
export function matchesShortcut(e: KeyboardEvent, binding: ShortcutBinding): boolean {
  if (!binding || !binding.key) return false;

  const requiresCtrl = !!binding.ctrl;
  const requiresAlt = !!binding.alt;
  const requiresShift = !!binding.shift;

  const eventCtrl = e.ctrlKey || e.metaKey;
  const eventAlt = e.altKey;
  const eventShift = e.shiftKey;

  if (requiresCtrl !== eventCtrl) return false;
  if (requiresAlt !== eventAlt) return false;
  if (requiresShift !== eventShift) return false;

  const pressedKey = e.key ? e.key.toLowerCase() : '';
  const targetKey = binding.key.toLowerCase();

  if (pressedKey === targetKey) return true;

  // Handle special cases like Enter, Space, Escape
  if (targetKey === 'enter' && (pressedKey === 'enter' || e.code === 'Enter' || e.code === 'NumpadEnter')) return true;
  if (targetKey === 'space' && (pressedKey === ' ' || e.code === 'Space')) return true;
  if (targetKey === 'esc' && (pressedKey === 'escape' || e.code === 'Escape')) return true;

  // Key codes check (e.g. if Hebrew keyboard layout is active, check e.code)
  if (binding.code && e.code === binding.code) return true;

  return false;
}
