import React from 'react';
import { diffWordsWithSpace } from 'diff';

interface Props {
  oldText: string;
  newText: string;
}

export const DiffViewer: React.FC<Props> = ({ oldText, newText }) => {
  const diffs = diffWordsWithSpace(oldText, newText);

  return (
    <div className="p-4 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-300 break-words overflow-x-auto">
      {diffs.map((part, index) => {
        if (part.added) {
          return (
            <span key={index} className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded px-0.5">
              {part.value}
            </span>
          );
        }
        if (part.removed) {
          return (
            <span key={index} className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 line-through rounded px-0.5 opacity-70">
              {part.value}
            </span>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </div>
  );
};
