import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../utils/api';
import { 
  Activity, Loader2, Sparkles, AlertCircle, CheckCircle2, 
  HelpCircle, ChevronDown, ChevronUp, RefreshCw, Layers, ShieldCheck, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReadabilityData {
  score: number;
  clarityScore?: number;
  complexityLevel?: string;
  roleDefined?: boolean;
  hasOutputConstraints?: boolean;
  hasVariables?: boolean;
  strengths?: string[];
  issues?: string[];
  suggestions?: string[];
}

interface Props {
  content: string;
  className?: string;
  variant?: 'compact' | 'full';
  onApplyImprovement?: (text: string) => void;
}

export const ReadabilityScore: React.FC<Props> = ({ 
  content, 
  className = '', 
  variant = 'compact'
}) => {
  const [aiData, setAiData] = useState<ReadabilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Real-time client-side heuristic evaluation for instant feedback
  const heuristic = useMemo(() => {
    if (!content || !content.trim()) {
      return {
        score: 0,
        clarityScore: 0,
        complexityLevel: 'ריק',
        roleDefined: false,
        hasOutputConstraints: false,
        hasVariables: false,
        wordCount: 0,
        tokenEstimate: 0,
        suggestions: ['הזן טקסט כדי לנתח את קריאות הפרומפט עבור מודל ה-AI']
      };
    }

    const trimmed = content.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const tokenEstimate = Math.ceil(trimmed.length / 3.8);

    // Heuristics
    const lower = trimmed.toLowerCase();
    const roleDefined = /(אתה|תפקידך|פעל כ|הינך|act as|you are|role:|your role|expert in)/i.test(trimmed);
    const hasOutputConstraints = /(פורמט|במבנה|markdown|json|רשימה|סעיפים|טבלה|פלט|format|output|constraints|tone:|סגנון)/i.test(trimmed);
    const hasVariables = /(\$\([a-zA-Z0-9_\u0590-\u05fe]+\)|\{[a-zA-Z0-9_\u0590-\u05fe]+\}|\[[a-zA-Z0-9_\u0590-\u05fe]+\])/.test(trimmed);

    let baseScore = 40;
    if (wordCount >= 10 && wordCount <= 300) baseScore += 20;
    else if (wordCount > 300) baseScore += 10;
    else baseScore -= 10;

    if (roleDefined) baseScore += 15;
    if (hasOutputConstraints) baseScore += 15;
    if (hasVariables) baseScore += 10;

    // Check sentence structure and line breaks
    const hasLineBreaks = trimmed.includes('\n');
    if (hasLineBreaks) baseScore += 5;

    const score = Math.max(10, Math.min(98, baseScore));
    const clarityScore = Math.max(15, Math.min(96, roleDefined && hasOutputConstraints ? score + 4 : score - 6));

    let complexityLevel = 'אופטימלית';
    if (wordCount < 12) complexityLevel = 'פשוטה וקצרה';
    else if (wordCount > 400) complexityLevel = 'גבוהה / ארוכה';
    else if (!roleDefined && !hasOutputConstraints) complexityLevel = 'בינונית / מעורפלת';

    const suggestions: string[] = [];
    if (!roleDefined) suggestions.push('הגדר תפקיד מפורש למודל (לדוגמה: "אתה מומחה תוכן...")');
    if (!hasOutputConstraints) suggestions.push('הגדר פורמט פלט מבוקש (Markdown, JSON או רשימה מסודרת)');
    if (!hasVariables) suggestions.push('שקול לשלב משתנים דינמיים כמו $(נושא) לשימוש חוזר');

    return {
      score,
      clarityScore,
      complexityLevel,
      roleDefined,
      hasOutputConstraints,
      hasVariables,
      wordCount,
      tokenEstimate,
      suggestions
    };
  }, [content]);

  // Combined score preferring deep AI analysis when available
  const activeScore = aiData?.score ?? heuristic.score;
  const activeClarity = aiData?.clarityScore ?? heuristic.clarityScore;
  const activeComplexity = aiData?.complexityLevel ?? heuristic.complexityLevel;
  const activeRole = aiData?.roleDefined ?? heuristic.roleDefined;
  const activeConstraints = aiData?.hasOutputConstraints ?? heuristic.hasOutputConstraints;
  const activeVariables = aiData?.hasVariables ?? heuristic.hasVariables;

  const scoreBadgeColor = useMemo(() => {
    if (activeScore >= 80) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40';
    if (activeScore >= 55) return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40';
    return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40';
  }, [activeScore]);

  const scoreTierText = useMemo(() => {
    if (activeScore >= 85) return 'מבנה מצוין לעיבוד AI';
    if (activeScore >= 70) return 'קריאות טובה מאוד';
    if (activeScore >= 50) return 'קריאות בינונית · מומלץ לחדד';
    return 'מורכב או חלקי · דורש שיפור';
  }, [activeScore]);

  const triggerDeepAnalysis = async () => {
    if (!content || content.trim().length < 15) return;
    setLoading(true);
    try {
      const key = localStorage.getItem("promptvault_gemini_key") || "";
      const res = await apiFetch('/api/gemini/analyze-readability', {
        method: 'POST',
        headers: { 
          "Content-Type": "application/json", 
          ...(key ? { "x-gemini-api-key": key } : {}) 
        },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const result = await res.json();
        setAiData(result);
      }
    } catch (e) {
      console.error("Deep readability analysis failed", e);
    } finally {
      setLoading(false);
    }
  };

  // Reset deep AI data when content changes significantly
  useEffect(() => {
    setAiData(null);
  }, [content]);

  if (!content || content.trim().length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`} dir="rtl">
      {/* Compact Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-[1.02] shadow-xs ${scoreBadgeColor}`}
        title="ציון קריאות ומבנה לעיבוד מודל AI"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Activity className="w-3.5 h-3.5" />
        )}
        <span>מדד קריאות AI:</span>
        <span className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-white/70 dark:bg-black/40 font-black">
          {activeScore}/100
        </span>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {/* Expandable Popover / Detailed Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full start-0 mt-2 w-80 md:w-96 bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-5 z-50 text-slate-800 dark:text-slate-100 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">איכות ומבנה לעיבוד AI</h4>
                  <p className="text-[11px] text-slate-400">{scoreTierText}</p>
                </div>
              </div>

              <div className="text-left">
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {activeScore}
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </div>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${activeScore}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    activeScore >= 80 ? 'bg-emerald-500' : activeScore >= 55 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>בהירות: {activeClarity}%</span>
                <span>מורכבות: {activeComplexity}</span>
              </div>
            </div>

            {/* AI Architecture Checklist */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                בדיקות מבנה למודל:
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-white/5">
                  {activeRole ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className={activeRole ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-500"}>
                    הגדרת תפקיד ופרסונה (Role Definition)
                  </span>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-white/5">
                  {activeConstraints ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className={activeConstraints ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-500"}>
                    אילוצי פלט ופורמט (Markdown, JSON וכד')
                  </span>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-white/5">
                  {activeVariables ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className={activeVariables ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-500"}>
                    משתנים דינמיים מופרדים (Variables)
                  </span>
                </div>
              </div>
            </div>

            {/* AI Actionable Suggestions */}
            {((aiData?.suggestions && aiData.suggestions.length > 0) || heuristic.suggestions.length > 0) && (
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/5">
                <h5 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  המלצות לדיוק והבנת המודל:
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {(aiData?.suggestions || heuristic.suggestions).slice(0, 3).map((sug, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span className="leading-snug">{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deep Analysis Action Button */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                ~{heuristic.tokenEstimate} טוקנים · {heuristic.wordCount} מילים
              </span>

              <button
                type="button"
                onClick={triggerDeepAnalysis}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>ניתוח AI מעמיק</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
