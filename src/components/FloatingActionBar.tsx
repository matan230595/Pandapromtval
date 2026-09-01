import React from 'react';
import { Trash2, FolderPlus, Download, X, Tags, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onMove: () => void;
  onExport: () => void;
  onTag: () => void;
  onCopyList?: () => void;
}

export const FloatingActionBar: React.FC<Props> = ({
  selectedCount,
  onClear,
  onDelete,
  onMove,
  onExport,
  onTag,
  onCopyList
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-white dark:bg-[#1a1a1a] shadow-2xl rounded-2xl border border-slate-200 dark:border-white/10"
        >
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-sm">
            {selectedCount} נבחרו
          </div>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />
          
          {onCopyList && (
            <button
              onClick={onCopyList}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-700 dark:text-slate-300"
            >
              <Copy className="w-4 h-4" /> העתק כרשימה
            </button>
          )}

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-700 dark:text-slate-300"
          >
            <Download className="w-4 h-4" /> יצא
          </button>

          <button
            onClick={onTag}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-700 dark:text-slate-300"
          >
            <Tags className="w-4 h-4" /> תגיות
          </button>

          <button
            onClick={onMove}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-700 dark:text-slate-300"
          >
            <FolderPlus className="w-4 h-4" /> העבר
          </button>

          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" /> מחק
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />

          <button
            onClick={onClear}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-xl"
            title="בטל בחירה"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
