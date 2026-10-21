import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GitMerge, Plus, Trash2, Play, ArrowRight, CheckCircle2, Loader2, X, Sparkles, Box, FileText } from 'lucide-react';
import { Prompt } from '../types';

interface ChainStep {
  id: string;
  promptId: string;
  inputVariable: string;
  outputKey: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
}

export const PromptChainBuilderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prompts,
  showToast
}) => {
  const [chainName, setChainName] = useState('שרשרת פרומפטים חדשה (Prompt Chain)');
  const [steps, setSteps] = useState<ChainStep[]>([
    { id: '1', promptId: prompts[0]?.id || '', inputVariable: 'input_text', outputKey: 'step1_result' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: Math.random().toString(36).substr(2, 9),
        promptId: prompts[0]?.id || '',
        inputVariable: `step${steps.length}_result`,
        outputKey: `step${steps.length + 1}_result`
      }
    ]);
  };

  const removeStep = (id: string) => {
    if (steps.length <= 1) {
      showToast("חייב להיות לפחות שלב אחד בשרשרת", "error");
      return;
    }
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleRunChain = () => {
    setIsRunning(true);
    setExecutionResult(null);
    setTimeout(() => {
      setIsRunning(false);
      const mockLogs = steps.map((step, idx) => {
        const p = prompts.find(pr => pr.id === step.promptId);
        return {
          stepIndex: idx + 1,
          promptTitle: p?.title || 'פרומפט ללא שם',
          inputUsed: idx === 0 ? 'קלט התחלתי של המשתמש' : `פלט של שלב ${idx}`,
          outputGenerated: `תוצאה מעובדת עבור שלב ${idx + 1} (${p?.categories?.[0] || p?.folder || 'כללי'})`
        };
      });
      setExecutionResult(mockLogs);
      showToast("שרשרת הפרומפטים הושלמה בהצלחה!", "success");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <GitMerge className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">בנאי שרשור פרומפטים (Prompt Chaining)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">שרשר מספר פרומפטים יחד ברצף, כך שהפלט של האחד ישמש כקלט לשלב הבא</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">שם השרשרת</label>
            <input 
              type="text" 
              value={chainName}
              onChange={(e) => setChainName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1e] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" /> שלבי השרשרת בסדר רציף
              </h3>
              <button 
                onClick={addStep}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> הוסף שלב לשרשרת
              </button>
            </div>

            {steps.map((step, idx) => {
              const selectedPrompt = prompts.find(p => p.id === step.promptId);
              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-50 dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-xl relative space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 bg-indigo-500/10 rounded-lg">
                      שלב #{idx + 1}
                    </span>
                    <button 
                      onClick={() => removeStep(step.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">בחר פרומפט מן המאגר</label>
                      <select 
                        value={step.promptId}
                        onChange={(e) => {
                          const updated = [...steps];
                          updated[idx].promptId = e.target.value;
                          setSteps(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1e] text-slate-900 dark:text-white text-xs"
                      >
                        {prompts.map(p => (
                          <option key={p.id} value={p.id}>{p.title} ({p.categories?.[0] || p.folder || 'כללי'})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">משתנה פלט (Output Key)</label>
                      <input 
                        type="text" 
                        value={step.outputKey}
                        onChange={(e) => {
                          const updated = [...steps];
                          updated[idx].outputKey = e.target.value;
                          setSteps(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1e] text-slate-900 dark:text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {selectedPrompt && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#121214] p-3 rounded-lg border border-slate-200 dark:border-white/5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">תוכן מקדים: </span>
                      {selectedPrompt.content.substring(0, 100)}...
                    </div>
                  )}

                  {idx < steps.length - 1 && (
                    <div className="flex justify-center my-2 text-indigo-500">
                      <ArrowRight className="w-5 h-5 rotate-90" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {executionResult && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
              <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> תוצאות הרצת השרשרת
              </h4>
              <div className="space-y-2">
                {executionResult.map((res, i) => (
                  <div key={i} className="p-3 bg-white dark:bg-[#121214] rounded-lg border border-emerald-500/10 text-xs space-y-1">
                    <div className="font-bold text-slate-800 dark:text-slate-200">שלב {res.stepIndex}: {res.promptTitle}</div>
                    <div className="text-slate-500">קלט: {res.inputUsed}</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-mono">פלט: {res.outputGenerated}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#18181b]">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            סגור
          </button>
          <button 
            onClick={handleRunChain}
            disabled={isRunning || prompts.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> מריץ שרשרת...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> הרץ שרשרת פרומפטים
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
