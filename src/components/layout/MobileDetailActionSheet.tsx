import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Share2,
  Mail,
  FileCode,
  Link,
  FileDown,
  QrCode,
  Camera,
  Download,
  SlidersHorizontal,
  FolderOpen,
  CopyPlus,
  Lock,
  Unlock,
  Globe,
  History,
  Trash2,
  BookOpen,
  Bell
} from 'lucide-react';
import { Prompt } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt;
  onSetReminder?: () => void;
  onCopyMarkdown: () => void;
  onShareSocial: () => void;
  onCopyPublicLink: () => void;
  onSendEmail: () => void;
  onExportCardImage: () => void;
  onExportPDF: () => void;
  onShowQr: () => void;
  onExportJSON: () => void;
  onOpenTemplate: () => void;
  onMoveFolder: () => void;
  onDuplicate: () => void;
  onToggleReadOnly: () => void;
  onPublishCommunity: () => void;
  onToggleHistory: () => void;
  hasHistory: boolean;
  onDelete: () => void;
  onReadingMode: () => void;
}

export const MobileDetailActionSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  prompt,
  onSetReminder,
  onCopyMarkdown,
  onShareSocial,
  onCopyPublicLink,
  onSendEmail,
  onExportCardImage,
  onExportPDF,
  onShowQr,
  onExportJSON,
  onOpenTemplate,
  onMoveFolder,
  onDuplicate,
  onToggleReadOnly,
  onPublishCommunity,
  onToggleHistory,
  hasHistory,
  onDelete,
  onReadingMode,
}) => {
  if (!isOpen) return null;

  const handleAction = (fn: () => void) => {
    onClose();
    setTimeout(() => {
      fn();
    }, 120);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative z-10 bg-white dark:bg-[#151515] rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-slate-200 dark:border-white/10"
        >
          {/* Drag Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
            <div className="min-w-0 pr-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                פעולות ואפשרויות
              </h3>
              <p className="text-xs text-slate-500 truncate">{prompt.title}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Actions List */}
          <div className="overflow-y-auto px-4 py-3 space-y-4 flex-1">
            {/* Task & Reminder */}
            {onSetReminder && (
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
                  <span>תזכורת משימה</span>
                  {prompt.reminder && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold">
                      {prompt.reminder.isCompleted ? 'הושלם ✓' : 'תזכורת פעילה ⏰'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleAction(onSetReminder)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold text-start transition-all ${
                    prompt.reminder
                      ? prompt.reminder.isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className={`w-4 h-4 ${prompt.reminder ? 'text-amber-500 fill-current' : 'text-slate-500'}`} />
                    <span>{prompt.reminder ? 'ערוך או נהל תזכורת לפרומפט זה' : 'הגדר תזכורת והתראה (Notification)'}</span>
                  </div>
                  {prompt.reminder?.dateTime && (
                    <span className="text-[10px] opacity-80 font-mono">
                      {new Date(prompt.reminder.dateTime).toLocaleDateString('he-IL')}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* 1. Sharing & Exporting */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                שיתוף וייצוא
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAction(onShareSocial)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-bold text-start hover:opacity-90"
                >
                  <Share2 className="w-4 h-4 shrink-0 text-purple-500" />
                  <span className="truncate">שיתוף ברשתות</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onCopyPublicLink)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-bold text-start hover:opacity-90"
                >
                  <Link className="w-4 h-4 shrink-0 text-blue-500" />
                  <span className="truncate">העתק קישור</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onExportCardImage)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold text-start hover:opacity-90"
                >
                  <Camera className="w-4 h-4 shrink-0 text-indigo-500" />
                  <span className="truncate">כרטיס מעוצב (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onShowQr)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold text-start hover:opacity-90"
                >
                  <QrCode className="w-4 h-4 shrink-0 text-indigo-500" />
                  <span className="truncate">סריקת QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onExportPDF)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold text-start hover:opacity-90"
                >
                  <FileDown className="w-4 h-4 shrink-0 text-rose-500" />
                  <span className="truncate">ייצוא PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onCopyMarkdown)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold text-start hover:opacity-90"
                >
                  <FileCode className="w-4 h-4 shrink-0 text-slate-500" />
                  <span className="truncate">העתק Markdown</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onSendEmail)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold text-start hover:opacity-90"
                >
                  <Mail className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span className="truncate">שלח במייל</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onExportJSON)}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold text-start hover:opacity-90"
                >
                  <Download className="w-4 h-4 shrink-0 text-cyan-500" />
                  <span className="truncate">ייצוא JSON</span>
                </button>
              </div>
            </div>

            {/* 2. Organization & Workflow */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                כלים וארגון
              </div>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleAction(onOpenTemplate)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                    <span>מנוע תבניות - מילוי משתנים</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Alt+T</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onReadingMode)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span>מצב קריאה והאזנה (Focus Mode)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onMoveFolder)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-4 h-4 text-amber-500" />
                    <span>העבר לתיקייה אחרת</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onPublishCommunity)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <span>פרסם לקהילה (Public Vault)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(onDuplicate)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CopyPlus className="w-4 h-4 text-blue-500" />
                    <span>שכפל פרומפט זה</span>
                  </div>
                </button>

                {hasHistory && (
                  <button
                    type="button"
                    onClick={() => handleAction(onToggleHistory)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <History className="w-4 h-4 text-amber-500" />
                      <span>היסטוריית גרסאות ו-Diff</span>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleAction(onToggleReadOnly)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {prompt.isReadOnly ? (
                      <Unlock className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-red-500" />
                    )}
                    <span>{prompt.isReadOnly ? 'בטל נעילה לעריכה' : 'נעל לקריאה בלבד'}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Danger Zone */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleAction(onDelete)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>מחק פרומפט זה</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
