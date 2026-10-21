import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Info, Cloud, Users, GitMerge } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'sync' | 'community' | 'version';

interface Props {
  message: string;
  type: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}

export const Toast: React.FC<Props> = ({ message, type, action, onClose }) => {
  useEffect(() => {
    const duration = action ? 5000 : 3000;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, action]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    sync: <Cloud className="w-5 h-5 text-indigo-500" />,
    community: <Users className="w-5 h-5 text-purple-500" />,
    version: <GitMerge className="w-5 h-5 text-amber-500" />
  };

  const bgs = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30',
    sync: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30',
    community: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30',
    version: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full border shadow-2xl glass-panel ${bgs[type]}`}
      dir="rtl"
        >
      {icons[type]}
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{message}</span>
      {action && (
        <button 
          onClick={() => { action.onClick(); onClose(); }}
          className="ml-2 px-3 py-1 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-white/10"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};
