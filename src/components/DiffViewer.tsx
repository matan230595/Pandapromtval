import React, { useState, useMemo } from 'react';
import { diffWordsWithSpace, diffLines } from 'diff';
import { Columns, AlignJustify, Plus, Minus, FileText } from 'lucide-react';

interface Props {
  oldText: string;
  newText: string;
  oldLabel?: string;
  newLabel?: string;
}

export const DiffViewer: React.FC<Props> = ({ 
  oldText, 
  newText, 
  oldLabel = 'גרסה קודמת', 
  newLabel = 'גרסה נוכחית' 
}) => {
  const [viewMode, setViewMode] = useState<'inline' | 'split'>('inline');

  const diffs = useMemo(() => {
    return diffWordsWithSpace(oldText || '', newText || '');
  }, [oldText, newText]);

  const stats = useMemo(() => {
    let addedWords = 0;
    let removedWords = 0;
    diffs.forEach(part => {
      const wordsCount = part.value.trim().split(/\s+/).filter(Boolean).length;
      if (part.added) addedWords += wordsCount;
      if (part.removed) removedWords += wordsCount;
    });
    const charDelta = (newText?.length || 0) - (oldText?.length || 0);
    return { addedWords, removedWords, charDelta };
  }, [diffs, oldText, newText]);

  return (
    <div className="flex flex-col space-y-3">
      {/* Diff Controls & Metrics Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#111] rounded-xl border border-slate-200 dark:border-white/10 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
            <Plus className="w-3 h-3" />
            <span>{stats.addedWords} מילים נוספו</span>
          </div>
          <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
            <Minus className="w-3 h-3" />
            <span>{stats.removedWords} מילים הוסרו</span>
          </div>
          <div className="text-slate-400 hidden sm:block">
            הפרש תווים: {stats.charDelta > 0 ? `+${stats.charDelta}` : stats.charDelta}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('inline')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              viewMode === 'inline'
                ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlignJustify className="w-3 h-3" />
            <span>משולב (Inline)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>זה לצד זה (Split)</span>
          </button>
        </div>
      </div>

      {/* Render Diff Body */}
      {viewMode === 'inline' ? (
        <div 
          className="p-4 bg-slate-50 dark:bg-[#0c0c0c] border border-slate-200 dark:border-white/10 rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-300 break-words overflow-x-auto max-h-[500px] overflow-y-auto"
          dir="auto"
        >
          {diffs.map((part, index) => {
            if (part.added) {
              return (
                <span key={index} className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold rounded px-1 border border-emerald-300 dark:border-emerald-800/40">
                  {part.value}
                </span>
              );
            }
            if (part.removed) {
              return (
                <span key={index} className="bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 line-through rounded px-1 border border-rose-300 dark:border-rose-800/40 opacity-75">
                  {part.value}
                </span>
              );
            }
            return <span key={index}>{part.value}</span>;
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
          {/* Old Text Container */}
          <div className="flex flex-col rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-[#0c0c0c]">
            <div className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-bold border-b border-rose-200 dark:border-rose-900/30">
              {oldLabel}
            </div>
            <div className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300 overflow-x-auto flex-1" dir="auto">
              {oldText}
            </div>
          </div>

          {/* New Text Container */}
          <div className="flex flex-col rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-[#0c0c0c]">
            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold border-b border-emerald-200 dark:border-emerald-900/30">
              {newLabel}
            </div>
            <div className="p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300 overflow-x-auto flex-1" dir="auto">
              {newText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
