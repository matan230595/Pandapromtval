import React, { useState, useMemo } from 'react';
import { 
  X, Command, Search, Plus, Sparkles, Save, Play, BookOpen, 
  QrCode, FileDown, Layers, ArrowRight, CornerDownLeft, Eye, Share2, SlidersHorizontal, Settings, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShortcutBinding, formatShortcutKeys } from '../utils/customShortcuts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAction?: (actionKey: string) => void;
  customShortcuts?: Record<string, ShortcutBinding>;
  onOpenSettings?: () => void;
}

interface ShortcutItem {
  id: string;
  category: 'core' | 'nav' | 'view' | 'tools';
  categoryLabel: string;
  icon: React.ReactNode;
  keys: string[];
  label: string;
  description: string;
  actionKey?: string;
}

export const ShortcutsModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onAction,
  customShortcuts,
  onOpenSettings
}) => {
  const [search, setSearch] = useState('');
  const isMac = useMemo(() => typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform), []);

  const allShortcuts: ShortcutItem[] = useMemo(() => {
    const getKeys = (id: string, fallback: string[]): string[] => {
      if (customShortcuts && customShortcuts[id]) {
        return formatShortcutKeys(customShortcuts[id], isMac);
      }
      return fallback;
    };

    return [
      {
        id: 'copy',
        category: 'core',
        categoryLabel: 'פעולות ליבה ושמירה',
        icon: <Copy className="w-4 h-4 text-emerald-500" />,
        keys: getKeys('copy', ['Ctrl', 'C']),
        label: 'העתקת הפרומפט הנוכחי',
        description: 'מעתיק מיידית את תוכן הפרומפט הנוכחי ללוח הגזירים (Clipboard)',
        actionKey: 'copy'
      },
      {
        id: 'save',
        category: 'core',
        categoryLabel: 'פעולות ליבה ושמירה',
        icon: <Save className="w-4 h-4 text-emerald-500" />,
        keys: getKeys('save', ['Ctrl', 'S']),
        label: 'שמירה מהירה וסנכרון ענן',
        description: 'שומר את הפרומפט הנוכחי ומסנכרן ל-Firebase Firestore',
        actionKey: 'save'
      },
      {
        id: 'sandbox',
        category: 'core',
        categoryLabel: 'פעולות ליבה ושמירה',
        icon: <Play className="w-4 h-4 text-indigo-500" />,
        keys: getKeys('run', ['Ctrl', 'Enter']),
        label: 'שליחה ובדיקה ב-Sandbox',
        description: 'טוען ומריץ את הפרומפט מיידית בסימולטור Gemini Sandbox',
        actionKey: 'sandbox'
      },
      {
        id: 'new',
        category: 'core',
        categoryLabel: 'פעולות ליבה ושמירה',
        icon: <Plus className="w-4 h-4 text-blue-500" />,
        keys: getKeys('new', ['Ctrl', 'N']),
        label: 'יצירת פרומפט חדש',
        description: 'פותח את עורך הפרומפטים החכם ליצירת תבנית חדשה',
        actionKey: 'new'
      },
      {
        id: 'palette',
        category: 'core',
        categoryLabel: 'פעולות ליבה ושמירה',
        icon: <Command className="w-4 h-4 text-purple-500" />,
        keys: getKeys('palette', ['Ctrl', 'K']),
        label: 'Command Palette (תפריט פקודות)',
        description: 'פתיחת תפריט חיפוש פקודות ופעולות מערכת מהירות',
        actionKey: 'palette'
      },
      {
        id: 'search',
        category: 'nav',
        categoryLabel: 'ניווט וחיפוש',
        icon: <Search className="w-4 h-4 text-cyan-500" />,
        keys: getKeys('search', ['Ctrl', 'F']),
        label: 'פתיחה והתמקדות בשורת החיפוש',
        description: 'פותח את החיפוש ומסמן את הטקסט בכל מצב ומסך',
        actionKey: 'search'
      },
      {
        id: 'search-shift',
        category: 'nav',
        categoryLabel: 'ניווט וחיפוש',
        icon: <Search className="w-4 h-4 text-cyan-400" />,
        keys: ['Shift', 'Space'],
        label: 'חיפוש מיידי בספרייה',
        description: 'מעבר מהיר לשורת החיפוש בספריית הפרומפטים',
        actionKey: 'search'
      },
      {
        id: 'focus-mode',
        category: 'view',
        categoryLabel: 'תצוגה וחוויית קריאה',
        icon: <BookOpen className="w-4 h-4 text-amber-500" />,
        keys: ['Esc'],
        label: 'יציאה ממצב קריאה / סגירת חלונות',
        description: 'יוצא ממצב Focus Mode או סוגר חלונות קופצים',
        actionKey: 'esc'
      },
      {
        id: 'help',
        category: 'tools',
        categoryLabel: 'כלים וקיצורים',
        icon: <Sparkles className="w-4 h-4 text-rose-500" />,
        keys: ['Shift', '?'],
        label: 'תצוגת לוח קיצורים אינטראקטיבי',
        description: 'פותח את חלון קיצורי המקלדת החזותי הזה',
        actionKey: 'help'
      },
      {
        id: 'qr',
        category: 'tools',
        categoryLabel: 'כלים וקיצורים',
        icon: <QrCode className="w-4 h-4 text-indigo-500" />,
        keys: getKeys('qr', ['Ctrl', 'Q']),
        label: 'ייצוא קוד QR לסריקה במובייל',
        description: 'פותח חלון ייצוא QR לסריקה ושיתוף מיידי במכשיר נייד',
        actionKey: 'qr'
      },
      {
        id: 'share',
        category: 'tools',
        categoryLabel: 'כלים וקיצורים',
        icon: <Share2 className="w-4 h-4 text-purple-500" />,
        keys: getKeys('share', ['Ctrl', 'Shift', 'S']),
        label: 'שיתוף מתקדם ברשתות חברתיות וקישור ייחודי',
        description: 'שיתוף ישיר ל-Twitter, Facebook, WhatsApp, LinkedIn ויצירת קישור ייחודי',
        actionKey: 'share'
      },
      {
        id: 'template',
        category: 'tools',
        categoryLabel: 'כלים וקיצורים',
        icon: <SlidersHorizontal className="w-4 h-4 text-indigo-500" />,
        keys: getKeys('template', ['Alt', 'T']),
        label: 'מנוע תבניות ומילוי שדות חכמים',
        description: 'פותח טופס מילוי שדות חכמים והגדרת משתנים לפני העתקה',
        actionKey: 'template'
      }
    ];
  }, [customShortcuts, isMac]);

  const filteredShortcuts = useMemo(() => {
    if (!search.trim()) return allShortcuts;
    const q = search.toLowerCase();
    return allShortcuts.filter(s => 
      s.label.toLowerCase().includes(q) || 
      s.description.toLowerCase().includes(q) || 
      s.keys.some(k => k.toLowerCase().includes(q))
    );
  }, [allShortcuts, search]);

  const categories = useMemo(() => {
    const map = new Map<string, { label: string; items: ShortcutItem[] }>();
    filteredShortcuts.forEach(item => {
      if (!map.has(item.category)) {
        map.set(item.category, { label: item.categoryLabel, items: [] });
      }
      map.get(item.category)!.items.push(item);
    });
    return Array.from(map.entries());
  }, [filteredShortcuts]);

  if (!isOpen) return null;

  const handleItemClick = (item: ShortcutItem) => {
    if (item.actionKey && onAction) {
      onAction(item.actionKey);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.94, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* HUD Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/80 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Command className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    קיצורי מקלדת במערכת (Interactive HUD)
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-mono">
                      Shift + ?
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    שליטה מהירה, ניווט וסנכרון ענן במקש אחד. לחץ על פקודה להפעלה מיידית.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSettings();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition-colors"
                    title="התאם אישית קיצורים"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">התאמה אישית</span>
                  </button>
                )}
                <button 
                  onClick={onClose} 
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  title="סגור (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Input */}
            <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-[#161616]">
              <div className="relative">
                <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="סנן קיצורים לפי שם, מקש או פעולה... (למשל: שמור, העתק, חיפוש, Sandbox)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-white/10 rounded-2xl ps-10 pe-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
            
            {/* Shortcuts Content */}
            <div className="p-5 space-y-6 overflow-y-auto flex-1">
              {categories.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  לא נמצאו קיצורים התואמים את החיפוש.
                </div>
              ) : (
                categories.map(([categoryKey, category]) => (
                  <div key={categoryKey} className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                      {category.label}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {category.items.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className="group p-3 rounded-2xl border border-slate-200/60 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.02] hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-800/50 cursor-pointer transition-all flex flex-col justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                {item.icon}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate block">
                                  {item.label}
                                </span>
                              </div>
                            </div>
                            
                            {/* Keycaps */}
                            <div className="flex items-center gap-1 shrink-0">
                              {item.keys.map((k, j) => (
                                <React.Fragment key={j}>
                                  <kbd className="inline-flex items-center justify-center min-w-[26px] h-6 px-1.5 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#252525] rounded-md border border-slate-300 dark:border-white/10 shadow-xs font-mono group-hover:border-indigo-300">
                                    {k === 'Ctrl' ? (isMac ? '⌘' : 'Ctrl') : k}
                                  </kbd>
                                  {j < item.keys.length - 1 && <span className="text-slate-400 text-xs">+</span>}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                            {item.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-[#0f0f0f] flex flex-wrap justify-between items-center text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">טיפ:</span>
                <span>ניתן להתאים אישית כל קיצור מקלדת בפאנל ההגדרות.</span>
              </div>
              <div className="flex items-center gap-2">
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSettings();
                    }}
                    className="px-3.5 py-1.5 rounded-xl font-bold bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    הגדר קיצורים
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-5 py-1.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  סגור
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
