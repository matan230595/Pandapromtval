import React, { useState } from 'react';
import { Prompt, PromptVersion } from '../types';
import { History, ChevronDown, Check, GitCommit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  prompt: Prompt;
  onUpdatePrompt: (updated: Prompt) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
}

export const PromptVersionDropdown: React.FC<Props> = ({ prompt, onUpdatePrompt, showToast }) => {
  const [isOpen, setIsOpen] = useState(false);

  const historyList: PromptVersion[] = prompt.history || [];
  const allVersions = [
    {
      versionId: 'current',
      versionName: prompt.currentVersionName || 'גרסה נוכחית (Active)',
      content: prompt.content,
      updatedAt: prompt.updatedAt || new Date().toISOString()
    },
    ...historyList
  ];

  const handleSelectVersion = (version: typeof allVersions[0]) => {
    if (version.content === prompt.content) {
      setIsOpen(false);
      return;
    }

    const updatedHistory = [
      {
        versionId: Date.now().toString(),
        versionName: `גרסה מוקדמת מ-${new Date().toLocaleDateString('he-IL')}`,
        content: prompt.content,
        updatedAt: new Date().toISOString()
      },
      ...historyList
    ];

    const updatedPrompt: Prompt = {
      ...prompt,
      content: version.content,
      history: updatedHistory,
      updatedAt: new Date().toISOString()
    };

    onUpdatePrompt(updatedPrompt);
    setIsOpen(false);
    showToast(`עברת בהצלחה לגרסה: ${version.versionName || 'גרסה נבחרת'}`, 'version');
  };

  return (
    <div className="relative" dir="rtl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-200/80 dark:border-white/10 shadow-xs"
        title="היסטוריית גרסאות"
      >
        <History className="w-4 h-4 text-indigo-500" />
        <span>גרסאות ({allVersions.length})</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute left-0 mt-2 w-72 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl py-2 z-50 text-right overflow-hidden"
            >
              <div className="px-3.5 py-2 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">היסטוריית סנפשוטים (Snapshots)</span>
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Firestore Sync</span>
              </div>

              <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                {allVersions.map((v, idx) => {
                  const isCurrent = v.content === prompt.content;
                  return (
                    <button
                      key={v.versionId || idx}
                      onClick={() => handleSelectVersion(v)}
                      className={`w-full text-right p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 ${
                        isCurrent 
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900/40' 
                          : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <GitCommit className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                          <span>{v.versionName || (idx === 0 ? 'גרסה נוכחית' : `גרסה #${allVersions.length - idx}`)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate font-mono">
                          {new Date(v.updatedAt || Date.now()).toLocaleString('he-IL')}
                        </div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
