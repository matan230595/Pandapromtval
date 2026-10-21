import React from 'react';
import { motion } from 'motion/react';
import { Activity, CheckCircle2, AlertTriangle, Sparkles, Wand2, BookOpen, ShieldCheck } from 'lucide-react';

interface Props {
  content: string;
  onApplyImprovement?: (improvedText: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
}

export const PromptReadabilityDashboard: React.FC<Props> = ({
  content,
  onApplyImprovement,
  showToast
}) => {
  if (!content || !content.trim()) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-[#18181b] rounded-xl border border-slate-200 dark:border-white/10 text-center text-xs text-slate-500">
        הזן טקסט פרומפט כדי להפעיל את לוח הבקרה וניתוח ה-NLP לקריאות ובהירות.
      </div>
    );
  }

  const trimmed = content.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = trimmed.split(/[.!?\n]+/).filter(Boolean);
  const sentenceCount = Math.max(1, sentences.length);
  const avgWordsPerSentence = Math.round(wordCount / sentenceCount);

  // NLP Heuristics for Hebrew & English
  const hasHebrew = /[\u0590-\u05fe]/.test(trimmed);
  const hasEnglish = /[a-zA-Z]/.test(trimmed);
  const hasRole = /(אתה|תפקידך|פעל כ|הינך|act as|you are|role:|your role|expert in)/i.test(trimmed);
  const hasConstraints = /(פורמט|במבנה|markdown|json|רשימה|סעיפים|טבלה|פלט|format|output|constraints|tone:|סגנון)/i.test(trimmed);
  const hasVariables = /(\$\([a-zA-Z0-9_\u0590-\u05fe]+\)|\{[a-zA-Z0-9_\u0590-\u05fe]+\}|\[[a-zA-Z0-9_\u0590-\u05fe]+\])/.test(trimmed);

  // Passive voice / complexity indicators
  const passiveIndicators = hasHebrew 
    ? (trimmed.match(/(נוצר|בוצע|פותח|תוכנן|נוהל|נקבע|נדרש)/g) || []).length
    : (trimmed.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/gi) || []).length;

  let readabilityScore = 70;
  if (avgWordsPerSentence > 25) readabilityScore -= 15;
  else if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 20) readabilityScore += 15;
  if (hasRole) readabilityScore += 10;
  if (hasConstraints) readabilityScore += 10;
  if (hasVariables) readabilityScore += 5;
  if (passiveIndicators > 2) readabilityScore -= 10;

  readabilityScore = Math.max(20, Math.min(99, readabilityScore));

  const issues: string[] = [];
  const suggestions: string[] = [];

  if (avgWordsPerSentence > 25) {
    issues.push('משפטים ארוכים מדי המקשים על הבנת המודל.');
    suggestions.push('פצל משפטים ארוכים למשפטים קצרים וממוקדים יותר.');
  } else {
    suggestions.push('אורך משפטים אופטימלי להבנת מודלי שפה.');
  }

  if (!hasRole) {
    issues.push('חסרה הגדרת תפקיד (Role Persona) ברורה.');
    suggestions.push('הוסף בתחילת הפרומפט: "אתה מומחה מוביל בתחום..."');
  }

  if (!hasConstraints) {
    issues.push('אין הגבלה מפורשת על מבנה הפלט.');
    suggestions.push('הגדר הנחיית פלט ברורה (לדוגמה: "החזר תשובה במבנה Markdown עם נקודות").');
  }

  if (passiveIndicators > 2) {
    issues.push('שימוש גבוה בלשון סביל (Passive Voice).');
    suggestions.push('עבור לניסוח פעיל ישיר כדי לשפר את חדות ההנחיות למודל.');
  }

  const handleAutoEnhance = () => {
    let enhanced = trimmed;
    if (!hasRole) {
      enhanced = `אתה מומחה בכיר ומקצועי בתחומך.\n\n` + enhanced;
    }
    if (!hasConstraints) {
      enhanced = enhanced + `\n\nאנא ספק את הפלט במבנה מסודר וברור ב-Markdown.`;
    }
    if (onApplyImprovement) {
      onApplyImprovement(enhanced);
    }
    showToast("הפרומפט שופר בהצלחה באמצעות מודל הניתוח!", "success");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">לוח בקרה קריאות ו-NLP (Readability & Clarity)</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">ניתוח מבנה משפטים, קול פעיל/סביל ובהירות מותאם לעברית ואנגלית</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-xl text-xs font-bold ${readabilityScore >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : readabilityScore >= 60 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
            ציון בהירות: {readabilityScore}/100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 dark:bg-[#121214] rounded-xl border border-slate-200/50 dark:border-white/5">
          <div className="text-xs text-slate-500">מספר מילים</div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-200">{wordCount}</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-[#121214] rounded-xl border border-slate-200/50 dark:border-white/5">
          <div className="text-xs text-slate-500">ממוצע מילים למשפט</div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-200">{avgWordsPerSentence}</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-[#121214] rounded-xl border border-slate-200/50 dark:border-white/5">
          <div className="text-xs text-slate-500">שפת זיהוי</div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-200">{hasHebrew && hasEnglish ? 'עברית / אנגלית' : hasHebrew ? 'עברית' : 'אנגלית'}</div>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-[#121214] rounded-xl border border-slate-200/50 dark:border-white/5">
          <div className="text-xs text-slate-500">הגדרת קול סביל</div>
          <div className={`text-base font-bold ${passiveIndicators > 2 ? 'text-amber-500' : 'text-emerald-500'}`}>{passiveIndicators} מופעים</div>
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300">תובנות והמלצות שיפור:</h5>
        <div className="space-y-1.5">
          {suggestions.map((sug, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#121214] p-2.5 rounded-lg border border-slate-100 dark:border-white/5">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>{sug}</span>
            </div>
          ))}
        </div>
      </div>

      {onApplyImprovement && (
        <button 
          onClick={handleAutoEnhance}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium shadow-md shadow-indigo-500/20 transition-all"
        >
          <Wand2 className="w-4 h-4" /> החל שיפור אוטומטי בהתבסס על ניתוח NLP
        </button>
      )}
    </motion.div>
  );
};
