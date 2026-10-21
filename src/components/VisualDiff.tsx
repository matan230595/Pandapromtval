import React from 'react';
import { diffWords } from 'diff';
import { PromptVersion } from '../types';

interface Props {
  oldVersion: PromptVersion;
  newVersion: PromptVersion;
}

export const VisualDiff: React.FC<Props> = ({ oldVersion, newVersion }) => {
  const diff = diffWords(oldVersion.content, newVersion.content);

  return (
    <div className="bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed" dir="auto">
      {diff.map((part, index) => {
        if (part.added) {
          return <span key={index} className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded px-1">{part.value}</span>;
        }
        if (part.removed) {
          return <span key={index} className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 rounded px-1 line-through opacity-70">{part.value}</span>;
        }
        return <span key={index} className="text-slate-700 dark:text-slate-300">{part.value}</span>;
      })}
    </div>
  );
};
