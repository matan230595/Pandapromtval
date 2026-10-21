import React from 'react';
import { AlarmClock, X, Check, Clock } from 'lucide-react';
import { Prompt } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  prompt: Prompt | null;
  onClose: () => void;
  onSnooze: (minutes: number) => void;
}

export const DueReminderModal: React.FC<Props> = ({ prompt, onClose, onSnooze }) => {
  if (!prompt) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          <div className="bg-amber-500 p-6 flex flex-col items-center justify-center text-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-1 text-white/70 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <AlarmClock className="w-12 h-12 mb-3 animate-[pulse_2s_ease-in-out_infinite]" />
            <h3 className="text-xl font-bold">תזכורת לפרומפט!</h3>
          </div>
          
          <div className="p-6 text-center">
            <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">הגיע הזמן להשתמש בפרומפט:</p>
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-8">{prompt.title}</h4>
            
            <div className="space-y-3">
              <button 
                onClick={onClose}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Check className="w-5 h-5" />
                הבנתי, תודה
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onSnooze(15)}
                  className="py-2.5 px-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-colors text-sm"
                >
                  <Clock className="w-4 h-4" />
                  נודניק (15 דק')
                </button>
                <button 
                  onClick={() => onSnooze(60)}
                  className="py-2.5 px-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-colors text-sm"
                >
                  <Clock className="w-4 h-4" />
                  נודניק (שעה)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
