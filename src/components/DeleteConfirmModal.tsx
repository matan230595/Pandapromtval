import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
}

export const DeleteConfirmModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, title }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              מחיקת פרומפט
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              האם אתה בטוח שברצונך למחוק {title ? `את הפרומפט "${title}"` : 'את הפרומפט הזה'}?
              <br />
              <strong className="text-red-500 font-medium">פעולה זו אינה הפיכה!</strong>
            </p>
          </div>
          
          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0a]/50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> מחק פרומפט
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
