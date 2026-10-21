import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Check, Edit2, Folder as FolderIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  folderName: string;
  onConfirmSaveAnyway: () => void;
  onFocusTitle: () => void;
}

export const DuplicateTitleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  folderName,
  onConfirmSaveAnyway,
  onFocusTitle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white dark:bg-[#181818] border border-amber-200 dark:border-amber-900/50 rounded-3xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 space-y-5"
      >
        {/* Header with Warning Icon */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              התראת שם כפול בתיקייה
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              בדיקת תקינות שמירה (Validation Check)
            </p>
          </div>
        </div>

        {/* Message Details */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <p className="leading-relaxed">
            שים לב: בתיקייה <span className="font-bold text-amber-800 dark:text-amber-300">"{folderName}"</span> כבר קיים פרומפט עם הכותרת:
          </p>
          <div className="font-bold text-slate-900 dark:text-white p-2.5 rounded-xl bg-white dark:bg-[#121212] border border-amber-200/60 dark:border-amber-900/30 truncate">
            &quot;{title}&quot;
          </div>
          <p className="text-[11px] text-slate-500">
            מומלץ לתת כותרת ייחודית כדי למנוע בלבול בעת חיפוש, סיווג ושימוש עתידי.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onFocusTitle();
            }}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Edit2 className="w-4 h-4" />
            <span>ערוך ושנה שם</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirmSaveAnyway();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold text-xs transition-colors"
          >
            שמור בכל זאת
          </button>
        </div>
      </motion.div>
    </div>
  );
};
