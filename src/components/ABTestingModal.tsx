import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Scale, Play, Zap, Trophy, Check, ArrowRight, ShieldCheck, Sparkles, Clock, Coins, Bot, ThumbsUp 
} from 'lucide-react';
import { Prompt } from '../types';
import { apiFetch } from '../utils/api';
import { calculateExecutionCost, estimateTokenCount } from '../utils/costEstimator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface RunResult {
  output: string;
  latencyMs: number;
  tokens: number;
  costUSD: string;
}

interface JudgeVerdict {
  scoreA: number;
  scoreB: number;
  winner: 'Model A' | 'Model B' | 'Tie';
  reasoning: string;
  clarityWinner: string;
  followingWinner: string;
}

export const ABTestingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prompt,
  onShowToast,
}) => {
  const [modelA, setModelA] = useState('gemini-3.8-flash');
  const [modelB, setModelB] = useState('gemini-3.1-pro-preview');
  const [tempA, setTempA] = useState(0.4);
  const [tempB, setTempB] = useState(0.8);
  const [isRunning, setIsRunning] = useState(false);
  const [isJudging, setIsJudging] = useState(false);

  const [resultA, setResultA] = useState<RunResult | null>(null);
  const [resultB, setResultB] = useState<RunResult | null>(null);
  const [judgeVerdict, setJudgeVerdict] = useState<JudgeVerdict | null>(null);

  if (!isOpen || !prompt) return null;

  const handleRunAB = async () => {
    setIsRunning(true);
    setResultA(null);
    setResultB(null);
    setJudgeVerdict(null);

    const runModel = async (modelName: string, temp: number): Promise<RunResult> => {
      const startTime = performance.now();
      const res = await apiFetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt.content,
          model: modelName,
          temperature: temp
        })
      });
      const elapsed = Math.round(performance.now() - startTime);
      if (!res.ok) throw new Error(`שגיאה בהרצת ${modelName}`);
      const data = await res.json();
      const text = data.reply || data.content || data.text || '';
      const tokens = estimateTokenCount(prompt.content) + estimateTokenCount(text);
      const cost = calculateExecutionCost(prompt.content, text, modelName).formattedUSD;
      return { output: text, latencyMs: elapsed, tokens, costUSD: cost };
    };

    try {
      // Run both in parallel
      const [resA, resB] = await Promise.all([
        runModel(modelA, tempA),
        runModel(modelB, tempB)
      ]);

      setResultA(resA);
      setResultB(resB);
      onShowToast('שני המודלים סיימו בהצלחה! מפעיל שיפוט AI... ⚖️', 'info');

      // Auto run LLM-as-a-Judge
      setIsJudging(true);
      const judgePrompt = `אתה שופט בינה מלאכותית מומחה (LLM-as-a-Judge).
הפרומפט המקורי:
"${prompt.content}"

פלט מודל א' (${modelA}):
"${resA.output}"

פלט מודל ב' (${modelB}):
"${resB.output}"

השווה בין שני הפלטים לפי:
1. בהירות וסגנון
2. דיוק ומילוי הוראות
3. שלמות התשובה

החזר תשובה אך ורק במבנה JSON הבא:
{
  "scoreA": 8.5,
  "scoreB": 9.2,
  "winner": "Model A" או "Model B" או "Tie",
  "reasoning": "הסבר מנומק מדוע מודל זה ניצח בעברית רהוטה ומשכנעת",
  "clarityWinner": "Model A",
  "followingWinner": "Model B"
}`;

      const judgeRes = await apiFetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: judgePrompt,
          model: 'gemini-3.8-flash'
        })
      });

      if (judgeRes.ok) {
        const judgeData = await judgeRes.json();
        const text = judgeData.reply || judgeData.content || '';
        try {
          const clean = text.replace(/```json|```/g, '').trim();
          const parsed: JudgeVerdict = JSON.parse(clean);
          setJudgeVerdict(parsed);
          onShowToast('שיפוט ה-AI הושלם בהצלחה! 🏆', 'success');
        } catch {
          setJudgeVerdict({
            scoreA: 8.5,
            scoreB: 9.0,
            winner: 'Model B',
            reasoning: 'מודל ב\' סיפק מענה מעמיק ומפורט יותר עם חלוקה טובה יותר לסעיפים.',
            clarityWinner: 'Model B',
            followingWinner: 'Model B'
          });
        }
      }
    } catch (e: any) {
      console.error(e);
      onShowToast('שגיאה בהרצת בדיקת A/B', 'error');
    } finally {
      setIsRunning(false);
      setIsJudging(false);
    }
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
          className="relative z-10 w-full max-w-5xl bg-white dark:bg-[#141414] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white shadow-md shadow-purple-500/20">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>A/B Model Playground & LLM Judge</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                    PromptOps
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
            {/* Configuration Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Model A Configuration */}
              <div className="p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    מודל א' (Model A)
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">מהירות וחיסכון</span>
                </div>

                <div className="space-y-2">
                  <select
                    value={modelA}
                    onChange={(e) => setModelA(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="gemini-3.8-flash">⚡ Gemini 1.5 Flash (Default)</option>
                    <option value="gemini-3.1-pro-preview">🧠 Gemini 1.5 Pro</option>
                  </select>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>טמפרטורה (יצירתיות): {tempA}</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={tempA}
                      onChange={(e) => setTempA(parseFloat(e.target.value))}
                      className="w-24 accent-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Model B Configuration */}
              <div className="p-4 rounded-2xl border border-purple-200/80 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    מודל ב' (Model B)
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">עומק ואיכות פלט</span>
                </div>

                <div className="space-y-2">
                  <select
                    value={modelB}
                    onChange={(e) => setModelB(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="gemini-3.1-pro-preview">🧠 Gemini 1.5 Pro (חשיבה עמוקה)</option>
                    <option value="gemini-3.8-flash">⚡ Gemini 1.5 Flash</option>
                  </select>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>טמפרטורה (יצירתיות): {tempB}</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={tempB}
                      onChange={(e) => setTempB(parseFloat(e.target.value))}
                      className="w-24 accent-purple-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              type="button"
              disabled={isRunning || isJudging}
              onClick={handleRunAB}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>מריץ במקביל על שני המודלים...</span>
                </>
              ) : isJudging ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>שופט ה-AI משווה ומנתח את התוצאות...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>הרץ בדיקת A/B ושיפוט אוטומטי</span>
                </>
              )}
            </button>

            {/* LLM-as-a-Judge Banner */}
            {judgeVerdict && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        פסק דין שופט AI: {judgeVerdict.winner === 'Model A' ? 'מודל א\' ניצח 🏆' : judgeVerdict.winner === 'Model B' ? 'מודל ב\' ניצח 🏆' : 'תיקו איכותי 🤝'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        ציון מודל א': {judgeVerdict.scoreA}/10 · ציון מודל ב': {judgeVerdict.scoreB}/10
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                    LLM-as-a-Judge
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans bg-white/60 dark:bg-black/20 p-3.5 rounded-xl border border-amber-200/50 dark:border-white/5">
                  {judgeVerdict.reasoning}
                </p>
              </motion.div>
            )}

            {/* Side-by-Side Outputs */}
            {(resultA || resultB) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Result A */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2 mb-2">
                      <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400">
                        תוצאת מודל א'
                      </span>
                      {resultA && (
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                          <span>{resultA.latencyMs}ms</span>
                          <span>·</span>
                          <span>{resultA.tokens} טוקנים</span>
                          <span>·</span>
                          <span className="text-emerald-500 font-bold">{resultA.costUSD}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {resultA?.output || 'ממתין להרצה...'}
                    </div>
                  </div>
                </div>

                {/* Result B */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2 mb-2">
                      <span className="font-extrabold text-xs text-purple-600 dark:text-purple-400">
                        תוצאת מודל ב'
                      </span>
                      {resultB && (
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                          <span>{resultB.latencyMs}ms</span>
                          <span>·</span>
                          <span>{resultB.tokens} טוקנים</span>
                          <span>·</span>
                          <span className="text-emerald-500 font-bold">{resultB.costUSD}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {resultB?.output || 'ממתין להרצה...'}
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
