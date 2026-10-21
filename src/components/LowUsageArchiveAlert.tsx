import React, { useMemo } from 'react';
import { Prompt } from '../types';
import { Archive, AlertCircle, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  prompts: Prompt[];
  onArchivePrompt: (id: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
}

export const LowUsageArchiveAlert: React.FC<Props> = ({ prompts, onArchivePrompt, showToast }) => {
  const lowUsagePrompts = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return prompts.filter(p => {
      if (p.archived) return false;
      const lastUsed = p.lastUsedAt ? new Date(p.lastUsedAt) : new Date(p.updatedAt);
      const hasBeenUsedBefore = (p.useCount || 0) >= 3;
      const isStale = lastUsed < oneMonthAgo;
      return hasBeenUsedBefore && isStale;
    }).slice(0, 3); // show top 3 stale prompts
  }, [prompts]);

  const [dismissedIds, setDismissedIds] = React.useState<string[]>([]);

  const activeAlerts = lowUsagePrompts.filter(p => !dismissedIds.includes(p.id));

  if (activeAlerts.length === 0) return null;

  return (
    <div className="mb-6 space-y-3" dir="rtl">
      {activeAlerts.map(prompt => (
        <motion.div
          key={prompt.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-xl shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                זיהינו ירידה בשימוש בפרומפט: "{prompt.title}"
                <span className="text-[10px] bg-amber-200/60 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-medium">לא היה שימוש בחודש האחרון</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                האם תרצה להעביר אותו לארכיון כדי לשמור על ספרייה נקייה ומסודרת?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                onArchivePrompt(prompt.id);
                showToast(`הפרומפט "${prompt.title}" הועבר לארכיון בהצלחה`, 'success');
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Archive className="w-3.5 h-3.5" />
              העבר לארכיון
            </button>
            <button
              onClick={() => setDismissedIds([...dismissedIds, prompt.id])}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              title="התעלם"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
