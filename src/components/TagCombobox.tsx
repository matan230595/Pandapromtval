import React, { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTagColor } from '../utils/colors';

interface Props {
  tags: string[];
  allTags: string[];
  onChange: (tags: string[]) => void;
}

export const TagCombobox: React.FC<Props> = ({ tags, allTags, onChange }) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTags = allTags.filter(
    (t) => t.toLowerCase().includes(input.toLowerCase()) && !(tags || []).includes(t)
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    if (tag.trim() && !(tags || []).includes(tag.trim())) {
      onChange([...(tags || []), tag.trim()]);
    }
    setInput('');
    setIsOpen(false);
  };

  const removeTag = (tag: string) => {
    onChange((tags || []).filter((t) => t !== tag));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="min-h-[42px] p-1.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
        {(tags || []).map((tag) => (
          <span
            key={tag}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium border ${getTagColor(tag).bg} ${getTagColor(tag).text} ${getTagColor(tag).border}`}
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(input);
            } else if (e.key === 'Backspace' && !input && (tags || []).length > 0) {
              removeTag((tags || [])[(tags || []).length - 1]);
            }
          }}
          placeholder={(tags || []).length === 0 ? "הוסף תגיות (לחיצה על Enter)..." : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm px-2 py-1 text-slate-900 dark:text-white"
        />
      </div>

      <AnimatePresence>
        {isOpen && (filteredTags.length > 0 || input.trim().length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {input.trim() && !allTags.includes(input.trim()) && !(tags || []).includes(input.trim()) && (
              <button
                onClick={() => addTag(input)}
                className="w-full text-start px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-white/5 font-medium border-b border-slate-100 dark:border-white/5"
              >
                צור תגית חדשה: "{input}"
              </button>
            )}
            {filteredTags.map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="w-full text-start px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
