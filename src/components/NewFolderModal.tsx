import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (folderName: string) => void;
}

export const NewFolderModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

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
          className="bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-blue-500" />
              תיקייה חדשה
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">שם התיקייה</label>
            <input 
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="לדוגמה: שיווק..."
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && name.trim()) {
                  onConfirm(name.trim());
                  setName('');
                  onClose();
                }
              }}
            />
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
                if (name.trim()) {
                  onConfirm(name.trim());
                  setName('');
                  onClose();
                }
              }}
              disabled={!name.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50"
            >
              צור
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
