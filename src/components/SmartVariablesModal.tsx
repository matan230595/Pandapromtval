import React, { useState, useMemo, useEffect } from 'react';
import { X, Copy, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
}

export const SmartVariablesModal: React.FC<Props> = ({ isOpen, onClose, originalText }) => {
  const variables = useMemo(() => {
    const regex = /\$\(([^)]+)\)|\{\{([^}]+)\}\}/g;
    const vars = new Set<string>();
    let match;
    while ((match = regex.exec(originalText)) !== null) {
      const varName = match[1] || match[2];
      if (varName) vars.add(varName);
    }
    return Array.from(vars);
  }, [originalText]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValues({});
      setCopied(false);
    }
  }, [isOpen]);

  const previewText = useMemo(() => {
    let text = originalText;
    variables.forEach(v => {
      const regex = new RegExp(`\\$\\(${v}\\)|\\{\\{${v}\\}\\}`, 'g');
      text = text.replace(regex, values[v] || `[${v}]`);
    });
    return text;
  }, [originalText, variables, values]);

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1500);
  };

  

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          dir="rtl"
        >
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">משתנים חכמים</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">מלא את החסר כדי להשלים את הפרומפט</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              {variables.map(v => (
                <div key={v}>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">{v}</label>
                  <input
                    type="text"
                    value={values[v] || ''}
                    onChange={e => setValues({ ...values, [v]: e.target.value })}
                    placeholder={`הזן ${v}...`}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">תצוגה מקדימה</label>
              <div className="flex-1 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl p-4 font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300 overflow-y-auto whitespace-pre-wrap selection:bg-blue-200 dark:selection:bg-blue-900/50">
                {previewText}
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0a]/50 flex justify-end">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition-all shadow-sm ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {copied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
              {copied ? "הועתק!" : "העתק פרומפט סופי"}
            </button>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
