import React from 'react';
import { Trash2, FolderPlus, Download, X, Tags, Copy, ArrowRightLeft, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onMove: () => void;
  onRename?: () => void;
  onExport: () => void;
  onTag: () => void;
  onCopyList?: () => void;
  onCompare?: () => void;
}

export const FloatingActionBar: React.FC<Props> = ({
  selectedCount,
  onClear,
  onDelete,
  onMove,
  onExport,
  onRename,
  onTag,
  onCopyList,
  onCompare
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200/80 dark:border-white/10 max-w-[95vw] overflow-x-auto"
        >
          {/* Persistent Selected Count Indicator */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-extrabold rounded-xl text-xs sm:text-sm border border-indigo-200/60 dark:border-indigo-800/40 shadow-xs shrink-0">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-400"></span>
            </span>
            <span>{selectedCount} נבחרו</span>
          </div>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-0.5 shrink-0" />
          
          {onCopyList && (
            <button
              onClick={onCopyList}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-700 dark:text-slate-300 shrink-0"
              title="העתק את כל הפרומפטים הנבחרים כרשימה אחת"
            >
              <Copy className="w-4 h-4 text-indigo-500" />
              <span>העתק</span>
            </button>
          )}

          {selectedCount === 2 && onCompare && (
            <button
              onClick={onCompare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-colors shrink-0"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>השווה 2</span>
            </button>
          )}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-700 dark:text-slate-300 shrink-0"
            title="ייצא פריטים נבחרים כ-JSON"
          >
            <Download className="w-4 h-4 text-cyan-500" />
            <span>ייצא</span>
          </button>

          <button
            onClick={onTag}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-700 dark:text-slate-300 shrink-0"
            title="הוסף או הסר תגיות מכל הפריטים הנבחרים"
          >
            <Tags className="w-4 h-4 text-emerald-500" />
            <span>תגיות</span>
          </button>

          {onRename && (
            <button
              onClick={onRename}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-700 dark:text-slate-300 shrink-0"
            >
              <Edit3 className="w-4 h-4 text-amber-500" />
              <span>שנה שם</span>
            </button>
          )}
          <button
            onClick={onMove}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-700 dark:text-slate-300 shrink-0"
            title="העבר לתיקייה"
          >
            <FolderPlus className="w-4 h-4 text-blue-500" />
            <span>העבר</span>
          </button>

          {/* Delete Button with Shortcut Indicator */}
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors shrink-0 group"
            title="מחק את כל הפריטים הנבחרים (Ctrl+Delete)"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>מחק</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900/40 rounded text-red-700 dark:text-red-300 font-mono">
              Ctrl+Del
            </kbd>
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-0.5 shrink-0" />

          {/* Clear selection with Esc badge */}
          <button
            onClick={onClear}
            className="flex items-center gap-1 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors rounded-xl shrink-0"
            title="בטל בחירה (Esc)"
          >
            <X className="w-4 h-4" />
            <kbd className="hidden lg:inline px-1 py-0.5 text-[9px] bg-slate-100 dark:bg-white/10 rounded font-mono">Esc</kbd>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
