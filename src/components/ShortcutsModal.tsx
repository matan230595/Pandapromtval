import React from 'react';
import { X, Command, Search, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { icon: <Command className="w-4 h-4" />, keys: ['Ctrl', 'K'], label: 'פתיחת תפריט פעולות (Command Palette)' },
    { icon: <Plus className="w-4 h-4" />, keys: ['Ctrl', 'N'], label: 'יצירת פרומפט חדש' },
    { icon: <Search className="w-4 h-4" />, keys: ['Ctrl', 'F'], label: 'חיפוש פרומפטים' },
    { icon: <Sparkles className="w-4 h-4" />, keys: ['Shift', '?'], label: 'פתיחת מסך עזרה זה' },
    { icon: <X className="w-4 h-4" />, keys: ['Esc'], label: 'סגירת חלונות / ביטול בחירה' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 w-full max-w-md overflow-hidden"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Command className="w-4 h-4 text-blue-500" />
                קיצורי מקלדת
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-2">
              {shortcuts.map((sc, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-white/5 last:border-0">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      {sc.icon}
                    </div>
                    {sc.label}
                  </div>
                  <div className="flex items-center gap-1">
                    {sc.keys.map((k, j) => (
                      <React.Fragment key={j}>
                        <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/10 rounded-md border border-slate-200 dark:border-white/10 shadow-sm font-mono">
                          {k === 'Ctrl' ? '⌘/Ctrl' : k}
                        </kbd>
                        {j < sc.keys.length - 1 && <span className="text-slate-400 text-xs">+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0a]/50 flex justify-center">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                הבנתי, תודה!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
