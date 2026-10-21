import { apiFetch } from '../utils/api';
import React, { useState } from 'react';
import { X, Wand2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (generatedPrompt: string) => void;
}

const STYLES = [
  { id: 'professional', label: 'מקצועי ורשמי' },
  { id: 'creative', label: 'יצירתי וסיפורי' },
  { id: 'direct', label: 'ישיר ותמציתי' },
  { id: 'academic', label: 'אקדמי ומחקרי' },
  { id: 'code', label: 'ממוקד קוד / טכני' }
];

export const PromptGeneratorModal: React.FC<Props> = ({ isOpen, onClose, onComplete }) => {
  const [style, setStyle] = useState(STYLES[0].id);
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!context.trim()) return;
    setIsGenerating(true);
    try {
      const selectedStyle = STYLES.find(s => s.id === style)?.label || style;
      const description = `סגנון: ${selectedStyle}. נושא/הקשר: ${context}`;
      
            const key = localStorage.getItem("promptvault_gemini_key") || "";
      const res = await apiFetch("/api/gemini/enhance", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(key ? { "x-gemini-api-key": key } : {})
        },
        body: JSON.stringify({ mode: "generate", description, language: "he" })
      });
      const data = await res.json();
      if (data.text) {
        onComplete(data.text);
        onClose();
      } else {
        throw new Error(data.error || "No text returned");
      }
    } catch (e) {
      // alert disabled in iframe
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={!isGenerating ? onClose : undefined}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Wand2 className="w-4 h-4" />
                </div>
                אשף יצירת פרומפטים (AI)
              </h3>
              <button onClick={onClose} disabled={isGenerating} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 md:p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">סגנון הפרומפט</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`px-3 py-2 text-sm font-medium rounded-xl border text-right transition-all ${style === s.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">נושא והקשר (מה אתה מנסה להשיג?)</label>
                <textarea 
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="לדוגמה: אני רוצה פרומפט שיעזור לי לכתוב פוסטים ללינקדאין על חדשנות טכנולוגית, שיהיו ויראליים ומעניינים..."
                  className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-slate-900 dark:text-slate-100 min-h-[120px] resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0a]/50 flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !context.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    מייצר...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    צור פרומפט
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
