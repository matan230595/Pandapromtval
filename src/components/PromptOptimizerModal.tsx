import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Wand2, Check, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Gauge, Copy, CheckCircle2, ChevronLeft 
} from 'lucide-react';
import { Prompt } from '../types';
import { evaluatePromptQuality, BenchmarkResult } from '../utils/qualityBenchmark';
import { apiFetch } from '../utils/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onApplyOptimization: (updatedContent: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const PromptOptimizerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prompt,
  onApplyOptimization,
  onShowToast,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'comparison' | 'preview'>('comparison');

  const benchmark: BenchmarkResult = useMemo(() => {
    return evaluatePromptQuality(prompt?.content || '', prompt?.fewShotExamples?.length || 0);
  }, [prompt]);

  const optimizedBenchmark: BenchmarkResult | null = useMemo(() => {
    if (!optimizedContent) return null;
    return evaluatePromptQuality(optimizedContent, 1);
  }, [optimizedContent]);

  if (!isOpen || !prompt) return null;

  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    setOptimizedContent('');

    try {
      const optimizationPrompt = `אתה מהנדס פרומפטים בכיר מומחה ב-Prompt Engineering Best Practices.
משימתך לשדרג ולייעל את הפרומפט הבא לרמה של Production-Grade.

הפרומפט המקורי:
"""
${prompt.content}
"""

הנחיות לשדרוג:
1. הוסף הגדרת תפקיד (Role / System Persona) עוצמתית בראש הפרומפט.
2. הגדר בבירור את כל הפרמטרים והמשתנים בתבנית {{variable_name}}.
3. ציין פורמט פלט מבוקש חד-משמעי (למשל: סעיפים ברורים, טבלת Markdown או מבנה מסודר).
4. הוסף מגבלות שליליות (Negative Constraints) למניעת הזיות וקלישאות.
5. שמור על כוונת המשתמש המקורית ושפר את דיוק התוצאה.

החזר אך ורק את טקסט הפרומפט המשופר, ללא הסברים, ללא הקדמות וללא מרכאות מסביב.`;

      const res = await apiFetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: optimizationPrompt,
          model: 'gemini-3.8-flash'
        })
      });

      if (!res.ok) throw new Error('שגיאה בתקשורת עם ה-AI');
      const data = await res.json();
      const text = data.reply || data.content || data.text || '';
      setOptimizedContent(text.trim());
      onShowToast('הפרומפט שופר בהצלחה לרמת Production! 🪄', 'success');
    } catch (e: any) {
      console.error(e);
      onShowToast('שגיאה באופטימיזציית הפרומפט', 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApply = () => {
    if (!optimizedContent) return;
    onApplyOptimization(optimizedContent);
    onShowToast('הפרומפט המשופר נשמר בהצלחה! ✨', 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative z-10 w-full max-w-4xl bg-white dark:bg-[#141414] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-xl text-white shadow-md shadow-amber-500/20">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Auto-Optimizer & מדד יציבות</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                    Best Practices
                  </span>
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-md">
                  {prompt.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Score & Benchmark Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Score */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    ציון איכות מקורי
                  </span>
                  <span className={`text-2xl font-black ${benchmark.color}`}>
                    {benchmark.score}/100
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  רמה: {benchmark.level}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-white/5">
                  <span className={`flex items-center gap-1.5 ${benchmark.rolePresent ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> תפקיד (Role)
                  </span>
                  <span className={`flex items-center gap-1.5 ${benchmark.variablesCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> משתנים ({benchmark.variablesCount})
                  </span>
                  <span className={`flex items-center gap-1.5 ${benchmark.outputFormatPresent ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> פורמט פלט
                  </span>
                  <span className={`flex items-center gap-1.5 ${benchmark.constraintsPresent ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> מגבלות שליליות
                  </span>
                </div>
              </div>

              {/* Optimized Preview Score */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-br from-amber-500/5 to-transparent space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      ציון צפוי לאחר שדרוג
                    </span>
                    <span className="text-2xl font-black text-emerald-500">
                      {optimizedBenchmark ? `${optimizedBenchmark.score}/100` : '95+/100'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    ה-AI מוסיף אוטומטית הגדרת תפקיד בכירה, מבנה פלט ברור, משתני תבנית והגבלות למניעת הזיות.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isOptimizing}
                  onClick={handleRunOptimizer}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  {isOptimizing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>מנתח ומייצר שיפורים...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>בצע אופטימיזציה אוטומטית עכשיו</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Suggestions list */}
            {benchmark.suggestions.length > 0 && !optimizedContent && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>הצעות לשיפור לפי Best Practices</span>
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {benchmark.suggestions.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Side-by-Side Comparison */}
            {optimizedContent && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>השוואת הפרומפט לפני ואחרי</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                      מוכן להחלה
                    </span>
                  </h4>

                  <button
                    type="button"
                    onClick={handleApply}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>החל את הפרומפט המשופר</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      הגרסה המקורית
                    </span>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-xs font-sans text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                      {prompt.content}
                    </div>
                  </div>

                  {/* Optimized */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      הגרסה המשודרגת (Production Grade)
                    </span>
                    <div className="p-4 rounded-2xl bg-emerald-50/20 dark:bg-emerald-950/10 border-2 border-emerald-500/40 text-xs font-sans text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed font-medium">
                      {optimizedContent}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
