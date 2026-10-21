import { apiFetch } from '../utils/api';
import React from 'react';
import { X, Copy, ArrowRightLeft, Play, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Prompt } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import Prism from 'prismjs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  onShowToast: (msg: string, type: 'success' | 'error') => void;
}

export const ComparePromptsView: React.FC<Props> = ({ isOpen, onClose, prompts, onShowToast }) => {
  if (!isOpen || prompts.length !== 2) return null;

  const [p1, p2] = prompts;
  const [testInput, setTestInput] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState(["", ""]);

  const handleRunABTest = async () => {
    setIsTesting(true);
    try {
      const [res1, res2] = await Promise.all([
        apiFetch("/api/gemini/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: p1.content + "\n\n" + testInput })
        }),
        apiFetch("/api/gemini/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: p2.content + "\n\n" + testInput })
        })
      ]);
      const data1 = await res1.json();
      const data2 = await res2.json();
      setResults([data1.text || "שגיאה", data2.text || "שגיאה"]);
    } catch (e) {
      onShowToast("שגיאה בהרצת הבדיקה", "error");
    }
    setIsTesting(false);
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex flex-col p-4 md:p-8"
        >
          <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-3xl w-full h-full flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10" dir="rtl">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111]">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <ArrowRightLeft className="w-6 h-6 text-blue-500" />
                השוואת פרומפטים
              </h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {[p1, p2].map((p, idx) => (
                <div key={p.id} className={`flex-1 flex flex-col ${idx === 0 ? 'border-b md:border-b-0 md:border-l' : ''} border-slate-200 dark:border-white/10 overflow-hidden`}>
                  <div className="p-6 bg-white dark:bg-[#111] shrink-0">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{p.title}</h3>
                      <button onClick={() => { navigator.clipboard.writeText(p.content); onShowToast("הועתק!", "success"); }} className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                        {p.platform}
                      </span>
                      {p.tags?.map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-md font-medium border border-slate-200 dark:border-white/10 text-slate-500">
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{p.description}</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-[#0a0a0a] min-h-0">
                    <div className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200" dir="auto">
                      {p.content}
                    </div>
                  </div>

                  {results[idx] && (
                    <div className="p-6 bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-indigo-100 dark:border-indigo-900/30 flex-1 overflow-y-auto min-h-0">
                      <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> תוצאת מודל
                      </h4>
                      <div className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200" dir="auto">
                        {results[idx]}
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-100 dark:bg-[#151515] border-t border-slate-200 dark:border-white/10 shrink-0">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">A/B Testing Sandbox (קלט למבחן)</label>
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="הזן משתנים או טקסט לבדיקה משותפת..."
                  className="flex-1 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                />
                <button 
                  onClick={handleRunABTest}
                  disabled={isTesting || !testInput.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                  {isTesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  הרץ בדיקה
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
