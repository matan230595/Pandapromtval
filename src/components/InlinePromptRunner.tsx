import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Play, Sparkles, Copy, Check, Clock, Coins, Globe, Code2, Languages, Sliders, RotateCcw, Bot, AlertCircle, ChevronDown, CheckCircle2 
} from 'lucide-react';
import { Prompt } from '../types';
import { calculateExecutionCost, estimateTokenCount } from '../utils/costEstimator';
import { apiFetch } from '../utils/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const InlinePromptRunner: React.FC<Props> = ({
  isOpen,
  onClose,
  prompt,
  onShowToast,
}) => {
  const [model, setModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-pro-preview'>('gemini-3.8-flash');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // Extension Plugins Toggles
  const [plugins, setPlugins] = useState({
    webSearch: false,
    codeFormatter: false,
    hebrewTranslator: false,
    toneEnhancer: false,
  });

  // Extract variables
  const variables = useMemo(() => {
    if (!prompt?.content) return [];
    const matches = prompt.content.match(/\{\{([a-zA-Z0-9_\u0590-\u05FF\s]+)\}\}/g) || [];
    return Array.from(new Set(matches.map(m => m.replace(/[{}]/g, '').trim())));
  }, [prompt]);

  // Initialize variable defaults
  useEffect(() => {
    if (variables.length > 0) {
      const initial: Record<string, string> = {};
      variables.forEach(v => {
        initial[v] = variableValues[v] || '';
      });
      setVariableValues(initial);
    }
  }, [variables]);

  // Compute final compiled prompt
  const compiledPrompt = useMemo(() => {
    if (!prompt?.content) return '';
    let result = prompt.content;
    Object.entries(variableValues).forEach(([k, v]) => {
      const regex = new RegExp(`\\{\\{${k}\\}\\}`, 'g');
      result = result.replace(regex, v || `[${k}]`);
    });

    // Apply plugin instructions if enabled
    if (plugins.webSearch) {
      result += '\n\n[הנחיית הרחבה: בצע חיפוש מעודכן ואמת נתונים עובדתיים נכונים להיום].';
    }
    if (plugins.codeFormatter) {
      result += '\n\n[הנחיית הרחבה: הצג קוד עם הערות הסבר מפורטות בעברית ועיצוב נקי].';
    }
    if (plugins.hebrewTranslator) {
      result += '\n\n[הנחיית הרחבה: ודא שהתשובה מנוסחת בעברית רהוטה וטבעית].';
    }
    if (plugins.toneEnhancer) {
      result += '\n\n[הנחיית הרחבה: נסח את התשובה בטון מקצועי, חד, משכנע וקצר ללא מריחות].';
    }

    return result;
  }, [prompt, variableValues, plugins]);

  // Live Token & Cost Estimation
  const costEst = useMemo(() => {
    return calculateExecutionCost(compiledPrompt, output, model);
  }, [compiledPrompt, output, model]);

  if (!isOpen || !prompt) return null;

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setLatencyMs(null);
    const startTime = performance.now();

    try {
      const res = await apiFetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: compiledPrompt,
          model: model === 'gemini-3.1-pro-preview' ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash',
          systemInstruction: prompt.platform ? `אתה מומחה מנוסה ל-${prompt.platform}. ענה בצורה הטובה ביותר לפרומפט הבא.` : undefined
        })
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);

      if (!res.ok) {
        throw new Error('שגיאה בתקשורת עם השרת');
      }

      const data = await res.json();
      const answer = data.reply || data.content || data.text || 'לא התקבלה תשובה';
      setOutput(answer);
      onShowToast(`הפרומפט רץ בהצלחה תוך ${elapsed}ms! ⚡`, 'success');
    } catch (e: any) {
      console.error(e);
      setOutput(`שגיאה בהרצה: ${e.message || 'אנא ודא שמפתח ה-API מוגדר כראוי.'}`);
      onShowToast('שגיאה בהרצת הפרומפט', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    onShowToast('הפלט הועתק ללוח!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Slide-over Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="relative z-10 w-full max-w-xl h-full bg-white dark:bg-[#121212] shadow-2xl flex flex-col border-s border-slate-200 dark:border-white/10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Play className="w-4 h-4 fill-white ms-0.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>הרצה מהירה (Inline Runner)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                    Sandbox
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                  {prompt.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Model & Specs Bar */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500">מודל:</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as any)}
                  className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="gemini-3.8-flash">⚡ Gemini 1.5 Flash (מהיר וחסכוני)</option>
                  <option value="gemini-3.1-pro-preview">🧠 Gemini 1.5 Pro (חשיבה עמוקה)</option>
                </select>
              </div>

              {/* Real-time Token & Cost badge */}
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1" title="טוקנים משוערים">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>~{costEst.totalTokens} טוקנים</span>
                </span>
                <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400" title="עלות משוערת להרצה">
                  <span>{costEst.formattedUSD}</span>
                </span>
              </div>
            </div>

            {/* Variable Inputs */}
            {variables.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-500" />
                    <span>משתני הפרומפט ({variables.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const empty: Record<string, string> = {};
                      variables.forEach(v => empty[v] = '');
                      setVariableValues(empty);
                    }}
                    className="text-[11px] text-slate-400 hover:text-red-500 font-medium"
                  >
                    נקה ערכים
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {variables.map((v) => (
                    <div key={v} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <span className="font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                          {`{{${v}}}`}
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder={`הזן ערך עבור ${v}...`}
                        value={variableValues[v] || ''}
                        onChange={(e) => setVariableValues({ ...variableValues, [v]: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extensions / Plugins Bar */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>הרחבות ופלאגינים (Plugins)</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlugins({ ...plugins, webSearch: !plugins.webSearch })}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    plugins.webSearch
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-700 dark:text-blue-300 font-bold'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Globe className={`w-3.5 h-3.5 ${plugins.webSearch ? 'text-blue-500' : 'text-slate-400'}`} />
                  <span className="truncate">חיפוש ברשת</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlugins({ ...plugins, codeFormatter: !plugins.codeFormatter })}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    plugins.codeFormatter
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Code2 className={`w-3.5 h-3.5 ${plugins.codeFormatter ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="truncate">מנתח קוד</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlugins({ ...plugins, hebrewTranslator: !plugins.hebrewTranslator })}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    plugins.hebrewTranslator
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-700 dark:text-purple-300 font-bold'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Languages className={`w-3.5 h-3.5 ${plugins.hebrewTranslator ? 'text-purple-500' : 'text-slate-400'}`} />
                  <span className="truncate">תרגום עברית</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlugins({ ...plugins, toneEnhancer: !plugins.toneEnhancer })}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    plugins.toneEnhancer
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-700 dark:text-amber-300 font-bold'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${plugins.toneEnhancer ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span className="truncate">חידוד נימה</span>
                </button>
              </div>
            </div>

            {/* Run Button */}
            <button
              type="button"
              disabled={isRunning}
              onClick={handleRun}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>מריץ את הפרומפט ב-AI...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>הפעל פרומפט עכשיו</span>
                </>
              )}
            </button>

            {/* Output Display */}
            {output && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      פלט התוצאה
                    </span>
                    {latencyMs && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold">
                        {latencyMs}ms
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyOutput}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'הועתק!' : 'העתק פלט'}</span>
                  </button>
                </div>

                <div 
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-sans leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap select-text max-h-72 overflow-y-auto shadow-inner"
                  dir="auto"
                >
                  {output}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
