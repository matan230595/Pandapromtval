import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wand2, X, Check, Loader2, Folder as FolderIcon, Tag, Sparkles, 
  ArrowRight, ArrowLeft, CheckSquare, Square, RefreshCw, AlertCircle
} from 'lucide-react';
import { Prompt, Folder } from '../types';
import { apiFetch } from '../utils/api';

interface BulkOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  folders: Folder[];
  onApplyChanges: (updates: { id: string; changes: Partial<Prompt> }[]) => Promise<void>;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface OrganizationResult {
  id: string;
  suggestedFolderId: string;
  suggestedFolderName: string;
  suggestedTags: string[];
  improvedTitle?: string;
  reason?: string;
  selected: boolean;
}

export const BulkOrganizerModal: React.FC<BulkOrganizerModalProps> = ({
  isOpen,
  onClose,
  prompts,
  folders,
  onApplyChanges,
  showToast,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<OrganizationResult[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'unorganized'>('all');

  if (!isOpen) return null;

  const targetPrompts = filterMode === 'unorganized'
    ? prompts.filter(p => !p.folder || p.folder === 'all' || !p.tags || p.tags.length === 0)
    : prompts;

  const handleRunAnalysis = async () => {
    if (targetPrompts.length === 0) {
      showToast('לא נמצאו פרומפטים לארגון', 'info');
      return;
    }

    setIsAnalyzing(true);
    try {
      const key = localStorage.getItem("promptvault_gemini_key") || "";
      const res = await apiFetch("/api/gemini/bulk-organize", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(key ? { "x-gemini-api-key": key } : {})
        },
        body: JSON.stringify({
          prompts: targetPrompts.slice(0, 20), // Batch up to 20 for optimal response
          folders: folders.map(f => ({ id: f.id, name: f.name })),
          language: "he"
        })
      });

      if (!res.ok) throw new Error("Failed to analyze prompts");

      const data = await res.json();
      const mapped: OrganizationResult[] = (data.results || []).map((r: any) => ({
        ...r,
        selected: true
      }));

      setResults(mapped);
      showToast(`נותחו בהצלחה ${mapped.length} פרומפטים!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'שגיאה בהפעלת ארגון AI', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSelect = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const toggleSelectAll = () => {
    const allSelected = results.every(r => r.selected);
    setResults(prev => prev.map(r => ({ ...r, selected: !allSelected })));
  };

  const handleApply = async () => {
    const selectedResults = results.filter(r => r.selected);
    if (selectedResults.length === 0) {
      showToast('בחר לפחות פריט אחד להחלה', 'info');
      return;
    }

    setIsApplying(true);
    try {
      const updates = selectedResults.map(r => {
        const changes: Partial<Prompt> = {};
        if (r.suggestedFolderId) changes.folder = r.suggestedFolderId;
        if (r.suggestedTags && r.suggestedTags.length > 0) changes.tags = r.suggestedTags;
        if (r.improvedTitle) changes.title = r.improvedTitle;
        return { id: r.id, changes };
      });

      await onApplyChanges(updates);
      showToast(`השינויים הוחלו בהצלחה על ${updates.length} פרומפטים!`, 'success');
      onClose();
    } catch (err: any) {
      showToast('שגיאה בשמירת השינויים', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#121212] rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                ארגון ותיוג חכם ב-AI (Bulk AI Organizer)
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  Gemini Flash
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                סריקה וסיווג אוטומטי של פרומפטים לתיקיות מתאימות, יצירת תגיות מדויקות וליטוש שמות
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {results.length === 0 ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  מוכן לסדר את כספת הפרומפטים שלך?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  ה-AI יקרא את הפרומפטים שלך, יזהה את נושאיהם, יתאים אותם לתיקיות הקיימות שלך ויוסיף תגיות מקצועיות שיקלו על החיפוש והשליפה.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    filterMode === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  כל הפרומפטים ({prompts.length})
                </button>
                <button
                  onClick={() => setFilterMode('unorganized')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    filterMode === 'unorganized'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  רק לא מאורגנים/ללא תגיות ({prompts.filter(p => !p.folder || p.folder === 'all' || !p.tags || p.tags.length === 0).length})
                </button>
              </div>

              <button
                disabled={isAnalyzing || targetPrompts.length === 0}
                onClick={handleRunAnalysis}
                className="mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 mx-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>מנתח ומסווג פרומפטים...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>הפעל ארגון חכם ({targetPrompts.length} פריטים)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-purple-600"
                >
                  {results.every(r => r.selected) ? (
                    <CheckSquare className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>בחר הכל ({results.filter(r => r.selected).length}/{results.length})</span>
                </button>

                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="text-xs text-slate-400 hover:text-purple-500 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>נתח מחדש</span>
                </button>
              </div>

              <div className="space-y-3">
                {results.map((result) => {
                  const original = prompts.find(p => p.id === result.id);
                  if (!original) return null;
                  const currentFolderName = folders.find(f => f.id === original.folder)?.name || 'ללא תיקייה';

                  return (
                    <div
                      key={result.id}
                      onClick={() => toggleSelect(result.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        result.selected
                          ? 'border-purple-300 dark:border-purple-500/40 bg-purple-50/40 dark:bg-purple-950/20 shadow-sm'
                          : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {result.selected ? (
                            <CheckSquare className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {result.improvedTitle || original.title}
                            </h5>
                            {result.reason && (
                              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium shrink-0 bg-purple-100/60 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">
                                {result.reason}
                              </span>
                            )}
                          </div>

                          {/* Folder transition */}
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1 text-slate-400 line-through">
                              <FolderIcon className="w-3.5 h-3.5" />
                              <span>{currentFolderName}</span>
                            </div>
                            <span className="text-purple-500 font-bold">←</span>
                            <div className="flex items-center gap-1 text-purple-700 dark:text-purple-300 font-bold bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded">
                              <FolderIcon className="w-3.5 h-3.5" />
                              <span>{result.suggestedFolderName || result.suggestedFolderId}</span>
                            </div>
                          </div>

                          {/* Suggested Tags */}
                          {result.suggestedTags && result.suggestedTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {result.suggestedTags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium"
                                >
                                  <Tag className="w-2.5 h-2.5 text-purple-500" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {results.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
            <button
              onClick={() => setResults([])}
              className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              ביטול תוצאות
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
              >
                סגור
              </button>
              <button
                disabled={isApplying || results.filter(r => r.selected).length === 0}
                onClick={handleApply}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>מחיל שינויים...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>החל שינויים ({results.filter(r => r.selected).length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
