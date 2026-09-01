import React, { useState } from 'react';
import { Tags, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTagColor } from '../utils/colors';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  allTags: string[];
  count: number;
  onConfirm: (tagsToAdd: string[], tagsToRemove: string[]) => void;
}

export const BulkTagModal: React.FC<Props> = ({ isOpen, onClose, allTags, count, onConfirm }) => {
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleToggleAdd = (tag: string) => {
    if (selectedToAdd.includes(tag)) {
      setSelectedToAdd(selectedToAdd.filter(t => t !== tag));
    } else {
      setSelectedToAdd([...selectedToAdd, tag]);
      setSelectedToRemove(selectedToRemove.filter(t => t !== tag));
    }
  };

  const handleToggleRemove = (tag: string) => {
    if (selectedToRemove.includes(tag)) {
      setSelectedToRemove(selectedToRemove.filter(t => t !== tag));
    } else {
      setSelectedToRemove([...selectedToRemove, tag]);
      setSelectedToAdd(selectedToAdd.filter(t => t !== tag));
    }
  };

  const handleAddNewTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      const tag = newTag.trim();
      if (!allTags.includes(tag) && !selectedToAdd.includes(tag)) {
        setSelectedToAdd([...selectedToAdd, tag]);
      } else if (allTags.includes(tag)) {
        handleToggleAdd(tag);
      }
      setNewTag('');
    }
  };

  const allAvailableTags = Array.from(new Set([...allTags, ...selectedToAdd]));

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tags className="w-4 h-4 text-blue-500" />
              עריכת תגיות ({count} פריטים)
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">הוסף תגית חדשה</label>
              <input 
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={handleAddNewTag}
                placeholder="הקלד שם תגית ולחץ Enter..."
                className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תגיות זמינות</label>
              <div className="flex flex-wrap gap-2">
                {allAvailableTags.map(tag => {
                  const colors = getTagColor(tag);
                  const isAdding = selectedToAdd.includes(tag);
                  const isRemoving = selectedToRemove.includes(tag);
                  
                  return (
                    <div key={tag} className={`flex items-center rounded-lg border text-sm transition-colors ${
                      isAdding ? 'border-green-500/50 bg-green-50 dark:bg-green-500/10' : 
                      isRemoving ? 'border-red-500/50 bg-red-50 dark:bg-red-500/10' : 
                      'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5'
                    }`}>
                      <button 
                        onClick={() => handleToggleAdd(tag)}
                        className={`px-3 py-1.5 font-medium transition-colors ${
                          isAdding ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="הוסף לכל הנבחרים"
                      >
                        {isAdding ? '+ ' : ''}{tag}
                      </button>
                      <div className="w-px h-4 bg-slate-200 dark:bg-white/10" />
                      <button 
                        onClick={() => handleToggleRemove(tag)}
                        className={`px-2 py-1.5 transition-colors ${
                          isRemoving ? 'text-red-600 dark:text-red-400' : 'text-slate-400 hover:text-red-500'
                        }`}
                        title="הסר מכל הנבחרים"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
                {allAvailableTags.length === 0 && (
                  <div className="text-sm text-slate-400">אין תגיות זמינות</div>
                )}
              </div>
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
              <strong>מקרא:</strong> לחץ על שם התגית כדי <strong>להוסיף</strong> אותה לפריטים. לחץ על ה-X לידה כדי <strong>להסיר</strong> אותה מהפריטים.
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0a]/50 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              ביטול
            </button>
            <button
              onClick={() => {
                onConfirm(selectedToAdd, selectedToRemove);
                onClose();
                setSelectedToAdd([]);
                setSelectedToRemove([]);
              }}
              disabled={selectedToAdd.length === 0 && selectedToRemove.length === 0}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50"
            >
              החל שינויים
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
