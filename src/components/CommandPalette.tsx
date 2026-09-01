import React, { useState, useEffect, useRef } from 'react';
import { Search, Folder as FolderIcon, Plus, X, Sparkles, Command, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prompt, Folder } from '../types';
import { getTagColor } from '../utils/colors';

interface Props {
  prompts: Prompt[];
  folders: Folder[];
  onSelectPrompt: (id: string) => void;
  onSelectFolder: (id: string) => void;
  onCreatePrompt: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

export const CommandPalette: React.FC<Props> = ({ prompts, folders, onSelectPrompt, onSelectFolder, onCreatePrompt, isOpen, setIsOpen, isDarkMode, toggleTheme }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredPrompts = prompts.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || (p.tags && p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))));
  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

  

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      >
        <motion.div 
          initial={{ scale: 0.98, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.98, opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-xl overflow-hidden"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-white/5">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="חפש פרומפט, תיקייה או פעולה..."
              className="flex-1 bg-transparent border-none outline-none px-4 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <div className="flex items-center gap-1 shrink-0">
              <kbd className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-white/10 rounded-md border border-slate-200 dark:border-white/5 shadow-sm">ESC</kbd>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {!query && (
              <div className="mb-2">
                <div className="px-3 py-1 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">פעולות מהירות</div>
                
                <button
                  onClick={() => { onCreatePrompt(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  צור פרומפט חדש
                </button>
                {toggleTheme && (
                  <button
                    onClick={() => { toggleTheme(); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-indigo-900/30 flex items-center justify-center text-amber-600 dark:text-indigo-400 shrink-0">
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </div>
                    {isDarkMode ? 'מעבר לתצוגת יום' : 'מעבר לתצוגת לילה'}
                  </button>
                )}

              </div>
            )}

            {filteredFolders.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">תיקיות</div>
                {filteredFolders.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { onSelectFolder(f.id); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <FolderIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    {f.name}
                  </button>
                ))}
              </div>
            )}

            {filteredPrompts.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">פרומפטים</div>
                {filteredPrompts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onSelectPrompt(p.id); setIsOpen(false); }}
                    className="w-full flex flex-col items-start px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-right"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.title}</span>
                    </div>
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 ml-6 overflow-hidden">
                        {p.tags.slice(0, 3).map(t => (
                          <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium border ${getTagColor(t).bg} ${getTagColor(t).text} ${getTagColor(t).border}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {query && filteredPrompts.length === 0 && filteredFolders.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-sm">
                לא נמצאו תוצאות ל"{query}"
              </div>
            )}
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
