import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { Folder } from '../types';
import { Sparkles, Loader2, Check, Folder as FolderIcon, Tag, ArrowRight, CheckCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  content: string;
  currentFolderId: string;
  currentTags: string[];
  folders: Folder[];
  allTags: string[];
  onApplyFolder: (folderId: string) => void;
  onApplyTags: (tags: string[]) => void;
  onApplyAll: (folderId: string, tags: string[], suggestedTitle?: string) => void;
  className?: string;
}

interface SuggestionResult {
  suggestedFolderId: string | null;
  suggestedFolderName: string | null;
  folderReason: string;
  suggestedTags: string[];
  suggestedTitle?: string;
}

export const AiMetadataSuggestions: React.FC<Props> = ({
  content,
  currentFolderId,
  currentTags,
  folders,
  allTags,
  onApplyFolder,
  onApplyTags,
  onApplyAll,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [applied, setApplied] = useState(false);

  const handleFetchSuggestions = async () => {
    if (!content || !content.trim()) return;
    setIsLoading(true);
    setApplied(false);

    try {
      const key = localStorage.getItem("promptvault_gemini_key") || "";
      const res = await apiFetch('/api/gemini/suggest-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(key ? { 'x-gemini-api-key': key } : {})
        },
        body: JSON.stringify({
          content,
          folders: folders.filter(f => f.id !== 'all' && f.id !== 'archive' && f.id !== 'community'),
          existingTags: allTags
        })
      });

      if (res.ok) {
        const data: SuggestionResult = await res.json();
        setResult(data);
        setSelectedTags(data.suggestedTags || []);
      }
    } catch (err) {
      console.error("Failed to suggest folder and tags", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleApplyAll = () => {
    if (!result) return;
    const targetFolderId = result.suggestedFolderId || currentFolderId;
    const mergedTags = Array.from(new Set([...currentTags, ...selectedTags]));
    onApplyAll(targetFolderId, mergedTags, result.suggestedTitle);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  const hasContent = content && content.trim().length >= 10;

  return (
    <div className={`rounded-2xl border border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-br from-indigo-50/70 to-purple-50/40 dark:from-indigo-950/20 dark:to-purple-950/10 p-4 transition-all ${className}`} dir="rtl">
      {/* Header & Trigger Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              התאמת תיקייה ותגיות ב-AI
            </h4>
            <p className="text-[10px] text-slate-400">
              סיווג אוטומטי של הפרומפט לפי התוכן
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFetchSuggestions}
          disabled={isLoading || !hasContent}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-indigo-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>מנתח תוכן...</span>
            </>
          ) : result ? (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>הצע מחדש</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>הצע עכשיו</span>
            </>
          )}
        </button>
      </div>

      {/* Suggestion Results Body */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-3.5 pt-3 border-t border-indigo-100/80 dark:border-indigo-900/40 space-y-3"
          >
            {/* Folder Suggestion */}
            {result.suggestedFolderId && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-[#161616]/80 border border-slate-200/60 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <FolderIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span>תיקייה מומלצת:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold underline decoration-indigo-300">
                        {result.suggestedFolderName || folders.find(f => f.id === result.suggestedFolderId)?.name || result.suggestedFolderId}
                      </span>
                    </div>
                    {result.folderReason && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{result.folderReason}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onApplyFolder(result.suggestedFolderId!)}
                  disabled={currentFolderId === result.suggestedFolderId}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition-colors self-start sm:self-auto disabled:opacity-50"
                >
                  {currentFolderId === result.suggestedFolderId ? 'מוגדר ✓' : 'החל תיקייה'}
                </button>
              </div>
            )}

            {/* Tag Suggestions */}
            {result.suggestedTags && result.suggestedTags.length > 0 && (
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#161616]/80 border border-slate-200/60 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                    <span>תגיות מוצעות (בחר תגיות לשיוך):</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const merged = Array.from(new Set([...currentTags, ...selectedTags]));
                      onApplyTags(merged);
                    }}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    החל תגיות שנבחרו
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {result.suggestedTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    const isAlreadyInPrompt = currentTags.includes(tag);

                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isAlreadyInPrompt 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/30'
                            : isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {isAlreadyInPrompt ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : isSelected ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <span>+</span>
                        )}
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick 1-Click Apply All Button */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleApplyAll}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 dark:text-black text-white text-xs font-bold transition-all shadow-xs"
              >
                {applied ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    <span>ההצעות הוחלו בהצלחה!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-300 dark:text-indigo-600" />
                    <span>החל הכל (תיקייה + תגיות) בלחיצה אחת</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
