
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Search, ChevronDown, ChevronRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTagColor } from '../utils/colors';

interface Props {
  tags?: string[];
  allTags?: string[];
  onChange?: (tags: string[]) => void;
  
  // For filter mode
  selectedTag?: string;
  onSelectTag?: (tag: string) => void;
}

export const TagCombobox: React.FC<Props> = ({ tags, allTags, onChange, selectedTag, onSelectTag }) => {
  const isFilterMode = !!onSelectTag;
  
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const availableTags = allTags || tags || [];

  const filteredTags = availableTags.filter((t) => {
    if (!t) return false;
    if (!t.toLowerCase().includes(input.toLowerCase())) return false;
    if (!isFilterMode && (tags || []).includes(t)) return false;
    return true;
  });

  // Group tags hierarchically
  const groupedTags = useMemo<Record<string, string[]>>(() => {
    const groups: Record<string, string[]> = { Root: [] };
    
    filteredTags.forEach(tag => {
      if (tag.includes('/')) {
        const parts = tag.split('/');
        const parent = parts[0].trim();
        if (!groups[parent]) groups[parent] = [];
        groups[parent].push(tag);
      } else {
        groups.Root.push(tag);
      }
    });
    
    // Sort
    Object.keys(groups).forEach(k => groups[k].sort());
    return groups;
  }, [filteredTags]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (tag: string) => {
    if (isFilterMode && onSelectTag) {
      onSelectTag(tag);
      setIsOpen(false);
    } else if (onChange) {
      if (tag.trim() && !(tags || []).includes(tag.trim())) {
        onChange([...(tags || []), tag.trim()]);
      }
      setInput('');
      setIsOpen(false);
    }
  };

  const removeTag = (tag: string) => {
    if (onChange) {
      onChange((tags || []).filter((t) => t !== tag));
    }
  };
  
  const toggleGroup = (e: React.MouseEvent, group: string) => {
    e.stopPropagation();
    setExpandedGroups(prev => ({...prev, [group]: !prev[group]}));
  };

  if (isFilterMode) {
    return (
      <div className="relative" ref={containerRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2.5 rounded-xl border flex items-center justify-center transition-colors bg-white dark:bg-[#111] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 gap-2 min-w-[120px]"
        >
          <Tag className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium">{selectedTag === 'all' ? 'כל התגיות' : selectedTag}</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
        
        <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 top-full right-0 mt-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden w-64 max-h-80 overflow-y-auto"
          >
            <div className="p-2 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white dark:bg-[#1a1a1a] z-10">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="חיפוש תגיות..."
                  className="w-full bg-slate-50 dark:bg-white/5 rounded-lg pr-9 pl-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
            
            <button
              onClick={() => handleSelect('all')}
              className={`w-full text-start px-4 py-2.5 text-sm transition-colors ${selectedTag === 'all' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              כל התגיות
            </button>
            
            {Object.entries(groupedTags).map(([groupName, groupTags]: [string, any]) => {
              if (groupTags.length === 0) return null;
              
              if (groupName === 'Root') {
                return groupTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSelect(tag)}
                    className={`w-full text-start px-4 py-2 text-sm transition-colors ${selectedTag === tag ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  >
                    {tag}
                  </button>
                ));
              }
              
              const isExpanded = expandedGroups[groupName] !== false; // Default true
              return (
                <div key={groupName} className="border-t border-slate-50 dark:border-white/5">
                  <button 
                    onClick={(e) => toggleGroup(e, groupName)}
                    className="w-full text-start px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-between"
                  >
                    {groupName}
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: 'auto' }} 
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        {groupTags.map(tag => {
                          const childName = tag.substring(tag.indexOf('/') + 1);
                          return (
                            <button
                              key={tag}
                              onClick={() => handleSelect(tag)}
                              className={`w-full text-start pr-8 pl-4 py-2 text-sm transition-colors flex items-center gap-2 ${selectedTag === tag ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${getTagColor(tag).bg}`} />
                              {childName}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    );
  }

  // Multi-select combobox mode
  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="min-h-[42px] p-1.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
        {(tags || []).map((tag) => (
          <span
            key={tag}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-medium border ${getTagColor(tag).bg} ${getTagColor(tag).text} ${getTagColor(tag).border}`}
          >
            {tag.includes('/') ? tag.substring(tag.indexOf('/') + 1) : tag}
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
              handleSelect(input);
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
            {input.trim() && !(allTags || []).includes(input.trim()) && !(tags || []).includes(input.trim()) && (
              <button
                onClick={() => handleSelect(input)}
                className="w-full text-start px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-white/5 font-medium border-b border-slate-100 dark:border-white/5"
              >
                צור תגית חדשה: "{input}"
              </button>
            )}
            
            {Object.entries(groupedTags).map(([groupName, groupTags]: [string, any]) => {
              if (groupTags.length === 0) return null;
              
              if (groupName === 'Root') {
                return groupTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSelect(tag)}
                    className="w-full text-start px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    {tag}
                  </button>
                ));
              }
              
              const isExpanded = expandedGroups[groupName] !== false;
              return (
                <div key={groupName} className="border-t border-slate-50 dark:border-white/5">
                  <button 
                    onClick={(e) => toggleGroup(e, groupName)}
                    className="w-full text-start px-4 py-1.5 text-xs font-bold text-slate-500 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-between"
                  >
                    {groupName}
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: 'auto' }} 
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        {groupTags.map(tag => {
                          const childName = tag.substring(tag.indexOf('/') + 1);
                          return (
                            <button
                              key={tag}
                              onClick={() => handleSelect(tag)}
                              className="w-full text-start pr-8 pl-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${getTagColor(tag).bg}`} />
                              {childName}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
