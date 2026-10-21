import React from 'react';
import { Bookmark, Hash, ChevronLeft } from 'lucide-react';

interface BookmarkItem {
  id: string;
  title: string;
  level: number;
  lineIndex: number;
}

interface Props {
  content: string;
  onJumpToSection: (lineIndex: number) => void;
}

export const PromptBookmarks: React.FC<Props> = ({ content, onJumpToSection }) => {
  const bookmarks: BookmarkItem[] = React.useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    const items: BookmarkItem[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      // Check for markdown headers (#, ##, ###) or explicit bookmarks like [סימניה: ...] or [bookmark: ...]
      if (trimmed.startsWith('#')) {
        const level = trimmed.match(/^#+/)?.[0].length || 1;
        const title = trimmed.replace(/^#+\s*/, '');
        if (title) {
          items.push({ id: `bm-${idx}`, title, level, lineIndex: idx });
        }
      } else if (/^\[(סימניה|bookmark|סעיף):/i.test(trimmed)) {
        const title = trimmed.replace(/^\[(סימניה|bookmark|סעיף):\s*/i, '').replace(/\]$/, '');
        if (title) {
          items.push({ id: `bm-${idx}`, title, level: 2, lineIndex: idx });
        }
      }
    });

    return items;
  }, [content]);

  if (bookmarks.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
        <Bookmark className="w-4 h-4 mx-auto mb-1 opacity-40 text-indigo-500" />
        <span>אין סימניות או כותרות בטקסט זה. ניתן להוסיף כותרות (מתחילות ב-#) או סימניות [סימניה: שורת מטרה] כדי לנוצל את הניווט המהיר.</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3" dir="rtl">
      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-white/5 text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
        <Bookmark className="w-4 h-4 text-indigo-500" />
        <span>סימניות וניווט מהיר ({bookmarks.length})</span>
      </div>
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {bookmarks.map((bm, index) => (
          <button
            key={bm.id}
            onClick={() => onJumpToSection(bm.lineIndex)}
            className="w-full text-right px-3 py-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-5 h-5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-mono shrink-0">
                {index + 1}
              </span>
              <span className="truncate">{bm.title}</span>
            </div>
            <ChevronLeft className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
