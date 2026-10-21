import React, { useState } from 'react';
import { Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  onConfirm: (pattern: string, startNumber: number) => void;
}

export const BulkRenameModal: React.FC<Props> = ({ isOpen, onClose, count, onConfirm }) => {
  const [pattern, setPattern] = useState('Prompt {n}');
  const [startNumber, setStartNumber] = useState(1);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-500" />
              שינוי שם גורף ({count} פרומפטים)
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תבנית שם (השתמש ב- {"{n}"} למספור)</label>
              <input 
                type="text"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
                placeholder="לדוגמה: Prompt {n}"
                className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                dir="auto"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">מספר התחלתי</label>
              <input 
                type="number"
                min="1"
                value={startNumber}
                onChange={e => setStartNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
              />
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">תצוגה מקדימה:</p>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mt-1">{pattern.replace('{n}', startNumber.toString())}</p>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0a]/50 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={() => {
                if (pattern.trim()) {
                  onConfirm(pattern.trim(), startNumber);
                  onClose();
                }
              }}
              disabled={!pattern.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-colors"
            >
              שנה שם
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
