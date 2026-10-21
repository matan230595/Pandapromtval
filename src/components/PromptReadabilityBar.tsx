import React, { useState, useMemo } from 'react';
import { 
  Activity, Sparkles, Loader2, AlertCircle, CheckCircle2, 
  HelpCircle, ChevronDown, ChevronUp, Zap, Wand2, Check, ArrowRight, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../utils/api';

interface Props {
  content: string;
  onApplySimplifiedText: (newText: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
}

interface ReadabilityMetrics {
  score: number;
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  longSentencesCount: number;
  grade: 'excellent' | 'good' | 'moderate' | 'complex';
  gradeText: string;
  badgeClass: string;
  tips: string[];
}

export const PromptReadabilityBar: React.FC<Props> = ({
  content,
  onApplySimplifiedText,
  showToast
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [simplifiedProposal, setSimplifiedProposal] = useState<string | null>(null);

  // Live real-time analysis as the user writes
  const metrics = useMemo<ReadabilityMetrics>(() => {
    const trimmed = (content || '').trim();
    if (!trimmed) {
      return {
        score: 100,
        wordCount: 0,
        sentenceCount: 0,
        avgSentenceLength: 0,
        longSentencesCount: 0,
        grade: 'excellent',
        gradeText: 'ממתין לטקסט',
        badgeClass: 'text-slate-500 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10',
        tips: ['התחל לכתוב את הנחיות הפרומפט כדי לקבל מדד קריאות בזמן אמת.']
      };
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Split sentences by '.', '?', '!', or double newlines
    const rawSentences = trimmed.split(/[\n.?!]+/).map(s => s.trim()).filter(s => s.length > 0);
    const sentenceCount = Math.max(1, rawSentences.length);

    // Calculate sentence lengths
    let longSentencesCount = 0;
    rawSentences.forEach(s => {
      const sentenceWords = s.split(/\s+/).filter(Boolean).length;
      if (sentenceWords > 24) {
        longSentencesCount++;
      }
    });

    const avgSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10;

    // Check formatting and structure cues
    const hasNumberedList = /(\n\s*\d+[\.\)]|\n\s*[-*•])/.test(trimmed);
    const hasRole = /(אתה|תפקידך|פעל כ|הינך|act as|you are|role:)/i.test(trimmed);
    const hasOutputFormat = /(פורמט|במבנה|markdown|json|רשימה|סעיפים|טבלה|פלט|format|output)/i.test(trimmed);
    const hasLineBreaks = trimmed.includes('\n');

    // Base score calculation
    let calculatedScore = 100;

    // Penalize long sentences (LLMs lose precision on run-on sentences)
    if (avgSentenceLength > 30) calculatedScore -= 30;
    else if (avgSentenceLength > 22) calculatedScore -= 18;
    else if (avgSentenceLength > 16) calculatedScore -= 8;

    if (longSentencesCount > 0) {
      calculatedScore -= Math.min(25, longSentencesCount * 8);
    }

    // Wall of text penalty
    if (wordCount > 60 && !hasLineBreaks) {
      calculatedScore -= 20;
    }

    // Rewards for clear structural elements
    if (hasNumberedList) calculatedScore += 8;
    if (hasRole) calculatedScore += 6;
    if (hasOutputFormat) calculatedScore += 6;

    const finalScore = Math.max(15, Math.min(98, calculatedScore));

    const tips: string[] = [];
    if (longSentencesCount > 0) {
      tips.push(`זוהו ${longSentencesCount} משפטים ארוכים (מעל 24 מילים) - פצל אותם להנחיות קצרות ומדויקות.`);
    }
    if (wordCount > 60 && !hasLineBreaks) {
      tips.push('הטקסט כתוב כגוש רציף - הוסף מעברי שורה כדי לסייע למודל ה-AI להפריד בין שלבים.');
    }
    if (!hasNumberedList && wordCount > 40) {
      tips.push('מומלץ להשתמש בסעיפים ממוספרים (1, 2, 3) עבור רצף פעולות נדרש.');
    }
    if (!hasRole && wordCount > 20) {
      tips.push('הוספת הגדרת תפקיד קצרה בתחילת הפרומפט ("אתה מומחה ל...") תחדד את התוצאה.');
    }
    if (!hasOutputFormat && wordCount > 25) {
      tips.push('ציין פורמט פלט רצוי (למשל: "החזר תשובה כרשימת בולטים" או "במבנה Markdown").');
    }

    if (tips.length === 0) {
      tips.push('ניסוח הפרומפט ברור, קריא וקל לעיבוד ע"י מודלי שפה!');
    }

    let grade: 'excellent' | 'good' | 'moderate' | 'complex' = 'excellent';
    let gradeText = 'קריאות מצוינת - ברור ופשוט';
    let badgeClass = 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800';

    if (finalScore < 50) {
      grade = 'complex';
      gradeText = 'מורכב ומסורבל - כדאי לפשט';
      badgeClass = 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800';
    } else if (finalScore < 70) {
      grade = 'moderate';
      gradeText = 'מורכבות בינונית - ניתן לפשט';
      badgeClass = 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800';
    } else if (finalScore < 85) {
      grade = 'good';
      gradeText = 'קריאות טובה';
      badgeClass = 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800';
    }

    return {
      score: finalScore,
      wordCount,
      sentenceCount,
      avgSentenceLength,
      longSentencesCount,
      grade,
      gradeText,
      badgeClass,
      tips
    };
  }, [content]);

  // AI-Powered Prompt Simplification
  const handleSimplifyPrompt = async () => {
    if (!content || content.trim().length < 10) {
      showToast('הזן לפחות כמה מילים כדי לפשט את ההנחיות', 'info');
      return;
    }

    setIsSimplifying(true);
    setSimplifiedProposal(null);

    try {
      const key = localStorage.getItem("promptvault_gemini_key") || "";
      const promptInstruction = `אתה מהנדס פרומפטים מומחה. תפקידך לפשט הנחיות פרומפט מורכבות ומסורבלות כך שיהיו ברורות, ישירות, קצרות וקלות ביותר לעיבוד על ידי מודל שפה (LLM).
כללים:
1. שמור על כל המשמעות, הדרישות והאילוצים המקוריים של המשתמש.
2. פצל משפטים ארוכים ומפותלים למשפטים קצרים וממוקדים.
3. השתמש ברשימת סעיפים או שלבים במידת הצורך.
4. השתמש בפעלים ישירים בציווי ("כתוב", "סכם", "הפק") במקום ניסוחים פסיביים.
5. אל תוסיף הקדמות או הסברים חיצוניים. החזר רק את הפרומפט המפשט ישירות.`;

      const res = await apiFetch("/api/gemini/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          ...(key ? { "x-gemini-api-key": key } : {}) 
        },
        body: JSON.stringify({
          systemInstruction: promptInstruction,
          messages: [{ role: "user", content: `אנא פשט וחדד את הנחיות הפרומפט הבא:\n\n${content}` }]
        })
      });

      const data = await res.json();
      if (data.text) {
        setSimplifiedProposal(data.text.trim());
        setIsExpanded(true);
        showToast('ההנחיות פושטו בהצלחה! באפשרותך לבדוק ולהחיל.', 'success');
      } else {
        showToast('לא התקבלה תשובה מ-Gemini', 'error');
      }
    } catch (err) {
      console.error('Simplification error:', err);
      showToast('אירעה שגיאה בפישוט ההנחיות', 'error');
    } finally {
      setIsSimplifying(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-[#141414] overflow-hidden transition-all text-xs">
      {/* Top Main Bar */}
      <div className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>מדד קריאות ופשטות ההנחיות:</span>
          </div>

          {/* Dynamic Score Badge */}
          <div className={`px-2.5 py-1 rounded-xl border font-bold flex items-center gap-1.5 shadow-2xs ${metrics.badgeClass}`}>
            <span className="font-mono font-black">{metrics.score}/100</span>
            <span className="text-[11px]">({metrics.gradeText})</span>
          </div>

          {/* Key Stat Chips */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>מילים: {metrics.wordCount}</span>
            <span>·</span>
            <span>ממוצע מילים למשפט: {metrics.avgSentenceLength}</span>
            {metrics.longSentencesCount > 0 && (
              <>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  {metrics.longSentencesCount} משפטים ארוכים
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 justify-end">
          {/* 1-Click AI Simplify Button */}
          <button
            type="button"
            onClick={handleSimplifyPrompt}
            disabled={isSimplifying || !content || content.trim().length < 10}
            className="px-3 py-1.5 rounded-xl font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="פשט אוטומטית משפטים מורכבים והנחיות מסורבלות בעזרת AI"
          >
            {isSimplifying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>פשט הנחיות (AI)</span>
          </button>

          {/* Expand Details Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
            title={isExpanded ? "הסתר טיפים לפישוט" : "הצג טיפים לשיפור קריאות"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Tips & Simplification Proposal Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#111] p-3.5 sm:p-4 space-y-3"
          >
            {/* Real-time Tips List */}
            <div>
              <div className="font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>טיפים לשיפור קריאות והבנת מודל ה-AI בזמן אמת:</span>
              </div>
              <ul className="space-y-1">
                {metrics.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-xs">
                    <span className="text-indigo-500 font-bold shrink-0 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Simplified Proposal View */}
            {simplifiedProposal && (
              <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>הצעה מפושטת וממוקדת:</span>
                  </div>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                    קריאות משופרת ל-AI
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-[#181818] border border-purple-100 dark:border-purple-900/40 text-xs font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto" dir="auto">
                  {simplifiedProposal}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSimplifiedProposal(null)}
                    className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-bold text-xs"
                  >
                    בטל
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onApplySimplifiedText(simplifiedProposal);
                      setSimplifiedProposal(null);
                      showToast('הפרומפט עודכן לנוסח המפושט!', 'success');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>החל פישוט על הפרומפט</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
