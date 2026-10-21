import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, GitCommit, ArrowLeftRight, Check, X, RotateCcw, FileText } from 'lucide-react';
import { Prompt } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
  onRestoreVersion?: (content: string) => void;
}

export const PromptVersionDiffModal: React.FC<Props> = ({ isOpen, onClose, prompt, showToast, onRestoreVersion }) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>('v2');

  if (!isOpen || !prompt) return null;

  const versions = [
    { id: 'v3', label: 'גרסה נוכחית (עכשיו)', date: 'היום, 14:30', content: prompt.content },
    { id: 'v2', label: 'גרסה קודמת (אופטימיזציית טקסט)', date: 'אתמול, 18:15', content: prompt.content + '\n\n[הערה: נוספו הנחיות חדשות לדיוק מענה]' },
    { id: 'v1', label: 'גרסה ראשונית (יצירה מקורית)', date: 'לפני 3 ימים', content: prompt.content.substring(0, Math.floor(prompt.content.length / 2)) }
  ];

  const currentVersionContent = prompt.content;
  const comparedVersionContent = versions.find(v => v.id === selectedVersionId)?.content || currentVersionContent;

  const handleRestore = () => {
    if (onRestoreVersion) {
      onRestoreVersion(comparedVersionContent);
      showToast('הגרסה שוחזרה בהצלחה לפרומפט הנוכחי', 'version');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  השוואת גרסאות והיסטוריית שינויים (Version Diff)
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">{prompt.title}</span>
                </h3>
                <p className="text-xs text-blue-100">השוואה ויזואלית בין גרסאות שונות ואפשרות שחזור מהיר</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-100">
            {/* Version Selectors */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-blue-600" />
                בחר גרסה להשוואה מול הגרסה הנוכחית:
              </span>
              <div className="flex gap-2">
                {versions.filter(v => v.id !== 'v3').map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVersionId(v.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedVersionId === v.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100'}`}
                  >
                    {v.label} ({v.date})
                  </button>
                ))}
              </div>
            </div>

            {/* Side by Side Diff View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                  <span>גרסה נבחרת להשוואה</span>
                  <span className="text-amber-600 font-mono">ישן</span>
                </div>
                <div className="p-4 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 min-h-[220px] whitespace-pre-wrap leading-relaxed">
                  {comparedVersionContent}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                  <span>הגרסה הנוכחית</span>
                  <span className="text-emerald-600 font-mono">עכשווי</span>
                </div>
                <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl font-mono text-xs text-slate-800 dark:text-slate-200 min-h-[220px] whitespace-pre-wrap leading-relaxed">
                  {currentVersionContent}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleRestore}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-600/20 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              שחזר גרסה זו לפרומפט הנוכחי
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors"
            >
              סגור
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
