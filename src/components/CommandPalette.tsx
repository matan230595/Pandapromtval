import React, { useState, useEffect, useRef } from 'react';
import { Search, Folder, Plus, FileText } from 'lucide-react';
import { Prompt, Folder as FolderType } from '../types';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  prompts: Prompt[];
  folders: FolderType[];
  onSelectPrompt: (id: string) => void;
  onSelectFolder: (id: string) => void;
  onCreatePrompt: () => void;
}

export const CommandPalette: React.FC<Props> = ({ 
  isOpen, 
  setIsOpen, 
  prompts, 
  folders, 
  onSelectPrompt, 
  onSelectFolder, 
  onCreatePrompt 
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase();
  
  const filteredPrompts = prompts
    .filter(p => (p.title || "").toLowerCase().includes(q) || (p.content || "").toLowerCase().includes(q))
    .slice(0, 5);
    
  const filteredFolders = folders
    .filter(f => f.name.toLowerCase().includes(q))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
      <div className="w-full max-w-2xl bg-white dark:bg-[#111] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-white/10">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש פרומפט או תיקייה (Ctrl+K)..."
            className="flex-1 bg-transparent border-none outline-none px-4 text-slate-800 dark:text-slate-200 text-lg placeholder-slate-400"
            dir="auto"
          />
          <div className="text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-white/10 rounded px-1.5 py-0.5">ESC</div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.length > 0 && filteredPrompts.length === 0 && filteredFolders.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              לא נמצאו תוצאות עבור "{query}"
            </div>
          )}

          {filteredFolders.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase">תיקיות</div>
              {filteredFolders.map(f => (
                <button
                  key={f.id}
                  onClick={() => { onSelectFolder(f.id); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-right"
                >
                  <Folder className="w-5 h-5 text-blue-500 shrink-0" />
                  <div className="font-bold text-slate-800 dark:text-slate-200">{f.name}</div>
                </button>
              ))}
            </div>
          )}

          {filteredPrompts.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase">פרומפטים</div>
              {filteredPrompts.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onSelectPrompt(p.id); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-right"
                >
                  <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.title}</div>
                    <div className="text-xs text-slate-500 truncate">{p.description || p.content.substring(0, 50)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div>
            <div className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase">פעולות</div>
            <button
              onClick={() => { onCreatePrompt(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-right"
            >
              <Plus className="w-5 h-5 text-green-500 shrink-0" />
              <div className="font-bold text-slate-800 dark:text-slate-200">צור פרומפט חדש...</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
