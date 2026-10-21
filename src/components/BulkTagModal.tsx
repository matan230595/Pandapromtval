import React, { useState } from 'react';
import { Tags, X, Plus, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTagColor } from '../utils/colors';
import { Prompt } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  allTags: string[];
  count: number;
  onConfirm: (tagsToAdd: string[], tagsToRemove: string[]) => void;
  selectedPrompts?: Prompt[];
}

export const BulkTagModal: React.FC<Props> = ({ isOpen, onClose, allTags, count, onConfirm, selectedPrompts = [] }) => {
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [selectedToRemove, setSelectedToRemove] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleToggleAdd = (tag: string) => {
    if (selectedToAdd.includes(tag)) {
      setSelectedToAdd(selectedToAdd.filter(t => t !== tag));
    } else {
      setSelectedToAdd([...selectedToAdd, tag]);
    }
  };

  const handleToggleRemove = (tag: string) => {
    if (selectedToRemove.includes(tag)) {
      setSelectedToRemove(selectedToRemove.filter(t => t !== tag));
    } else {
      setSelectedToRemove([...selectedToRemove, tag]);
    }
  };

  const handleAddNewTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      const tag = newTag.trim();
      if (!selectedToAdd.includes(tag)) {
        setSelectedToAdd([...selectedToAdd, tag]);
      }
      setNewTag('');
    }
  };

  const handleExportJson = () => {
    const dataToExport = selectedPrompts.length > 0 ? selectedPrompts : [];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `prompts_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const allAvailableTags = Array.from(new Set([...(allTags || []), ...selectedToAdd]));

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
              ניהול תגיות מרוכז ({count} פריטים נבחרו)
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'add' 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#161616]' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              הוספת תגיות ({selectedToAdd.length})
            </button>
            <button
              onClick={() => setActiveTab('remove')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                activeTab === 'remove' 
                  ? 'border-red-600 text-red-600 dark:text-red-400 bg-white dark:bg-[#161616]' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              הסרת תגיות ({selectedToRemove.length})
            </button>
          </div>
          
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {activeTab === 'add' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">הקלד תגית חדשה להוספה</label>
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">בחר תגיות קיימות להוספה</label>
                  <div className="flex flex-wrap gap-2">
                    {allAvailableTags.map(tag => {
                      const isSelected = selectedToAdd.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleAdd(tag)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                            isSelected 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                              : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-400'
                          }`}
                        >
                          {isSelected && <span className="text-[10px]">✓</span>}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* JSON Export Backup Option */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    ייצא פרומפטים נבחרים ותגיות לקובץ JSON (גיבוי)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  בחר אילו תגיות ברצונך להסיר מכל הפרומפטים שנבחרו:
                </div>
                <div className="flex flex-wrap gap-2">
                  {(allTags || []).map(tag => {
                    const isSelected = selectedToRemove.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleRemove(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelected 
                            ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                            : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-red-400'
                        }`}
                      >
                        {isSelected && <span className="text-[10px]">✕</span>}
                        {tag}
                      </button>
                    );
                  })}
                  {(!allTags || allTags.length === 0) && (
                    <div className="text-sm text-slate-400">אין תגיות זמינות במערכת</div>
                  )}
                </div>
              </div>
            )}
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
              החל שינויים ({selectedToAdd.length + selectedToRemove.length})
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
