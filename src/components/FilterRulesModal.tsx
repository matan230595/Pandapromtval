import React, { useState } from 'react';
import { X, Plus, Trash2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AutomationRule, Folder } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  rules: AutomationRule[];
  setRules: (rules: AutomationRule[]) => void;
  folders: Folder[];
}

export const FilterRulesModal: React.FC<Props> = ({ isOpen, onClose, rules, setRules, folders }) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newFolderId, setNewFolderId] = useState('');
  const [newMatchIn, setNewMatchIn] = useState<'tags' | 'content' | 'both'>('tags');

  if (!isOpen) return null;

  const handleAddRule = () => {
    if (!newKeyword.trim() || !newFolderId) return;
    
    const rule: AutomationRule = {
      id: (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)),
      keyword: newKeyword.trim().toLowerCase(),
      targetFolderId: newFolderId,
      matchIn: newMatchIn,
      isActive: true
    };
    
    setRules([...rules, rule]);
    setNewKeyword('');
  };

  const handleRemoveRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-[#111] rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-white/10 max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-500" />
            כללי אוטומציה (Auto-Routing)
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl mb-6 shrink-0">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">צור כלל חדש</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="מילת מפתח (למשל: 'שיווק')"
              value={newKeyword}
              onChange={e => setNewKeyword(e.target.value)}
              className="flex-1 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <select
              value={newMatchIn}
              onChange={e => setNewMatchIn(e.target.value as any)}
              className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="tags">בתגיות</option>
              <option value="content">בתוכן הפרומפט</option>
              <option value="both">גם וגם</option>
            </select>
            <select
              value={newFolderId}
              onChange={e => setNewFolderId(e.target.value)}
              className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="">בחר תיקיית יעד...</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <button 
              onClick={handleAddRule}
              disabled={!newKeyword.trim() || !newFolderId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" /> הוסף
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[200px]">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 px-1">כללים פעילים</h4>
          {rules.length === 0 ? (
             <div className="text-center py-10 text-slate-400 text-sm">
               לא הוגדרו כללי אוטומציה.<br/>הוסף כללים כדי למיין פרומפטים אוטומטית לפי מילות מפתח.
             </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {rules.map(rule => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between p-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={rule.isActive}
                          onChange={() => toggleRule(rule.id)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">"{rule.keyword}"</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({rule.matchIn === 'tags' ? 'תגיות' : rule.matchIn === 'content' ? 'תוכן' : 'תגיות ותוכן'})
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-sm font-medium px-2 py-1 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300">
                        {folders.find(f => f.id === rule.targetFolderId)?.name || 'תיקייה נמחקה'}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleRemoveRule(rule.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end shrink-0 pt-4 border-t border-slate-100 dark:border-white/5">
          <button onClick={onClose} className="px-6 py-2 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 dark:text-black text-white rounded-xl font-bold transition-colors">
            סגור
          </button>
        </div>
      </motion.div>
    </div>
  );
};
