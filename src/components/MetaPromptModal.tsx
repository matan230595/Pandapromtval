import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, X, Copy, Check, Loader2, ArrowRight, Wand2, 
  Lightbulb, Sliders, ChevronDown, Save, Edit3, Tag, Variable
} from 'lucide-react';
import { Prompt, Folder } from '../types';
import { apiFetch } from '../utils/api';

interface MetaPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToVault: (prompt: Prompt) => Promise<void>;
  onOpenInEditor: (prompt: Partial<Prompt>) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  folders: Folder[];
}

interface MetaPromptResult {
  title: string;
  platform: string;
  content: string;
  tags: string[];
  folderSuggestion?: string;
  variables: { name: string; description: string; sample: string }[];
  explanation: string;
}

const INSPIRATIONS = [
  "כתיבת פוסט לינקדאין שיווקי ומשכנע על השקת מוצר AI חדש",
  "ניתוח חוזה שכירות ואיתור סעיפים בעייתיים ומלכודות",
  "סקירת קוד פייתון מקצועית עם דגש על ביצועים, אבטחה ו-Clean Code",
  "בניית מערך שיעור אינטראקטיבי של 45 דקות בנושא בינה מלאכותית",
  "ניסוח מכתב פנייה מותאם אישית (Cover Letter) למשרת Full Stack"
];

export const MetaPromptModal: React.FC<MetaPromptModalProps> = ({
  isOpen,
  onClose,
  onSaveToVault,
  onOpenInEditor,
  showToast,
  folders
}) => {
  const [userIdea, setUserIdea] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('ChatGPT');
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<MetaPromptResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!userIdea.trim()) {
      showToast('אנא תאר את הרעיון שלך בשפת יומיום', 'info');
      return;
    }

    setIsGenerating(true);
    setResult(null);
    try {
      const key = localStorage.getItem("promptvault_gemini_key") || "";
      const res = await apiFetch("/api/gemini/meta-prompt", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(key ? { "x-gemini-api-key": key } : {})
        },
        body: JSON.stringify({
          userIdea: userIdea.trim(),
          targetPlatform,
          tone,
          language: "he"
        })
      });

      if (!res.ok) throw new Error("Failed to generate meta-prompt");

      const data: MetaPromptResult = await res.json();
      setResult(data);
      showToast('פרומפט מובנה נוצר בהצלחה!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'שגיאה ביצירת הפרומפט', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    showToast('הפרומפט הועתק ללוח!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const matchedFolder = folders.find(f => f.id === result.folderSuggestion)?.id || 'work';
      const newPrompt: Prompt = {
        id: "p_" + Date.now(),
        title: result.title || "פרומפט שנוצר ב-AI",
        content: result.content,
        platform: result.platform || targetPlatform,
        tags: result.tags || ["AI", "Generated"],
        folder: matchedFolder,
        favorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        useCount: 0,
        usageHistory: [],
        projectId: "default",
        language: "he"
      };

      await onSaveToVault(newPrompt);
      showToast('הפרומפט נשמר בהצלחה לכספת!', 'success');
      onClose();
    } catch (err: any) {
      showToast('שגיאה בשמירת הפרומפט', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEditor = () => {
    if (!result) return;
    onOpenInEditor({
      title: result.title,
      content: result.content,
      platform: result.platform || targetPlatform,
      tags: result.tags,
      folder: result.folderSuggestion || 'work'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#121212] rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                ארכיטקט פרומפטים חכם (Meta-Prompting)
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  Gemini 2.5 Pro
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                המר רעיון יומיומי פשוט לפרומפט מובנה, מדויק ורב-פעמי עם משתנים דינמיים
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              מה תרצה שהפרומפט יעשה? תאר במילים שלך:
            </label>
            <textarea
              value={userIdea}
              onChange={(e) => setUserIdea(e.target.value)}
              placeholder="לדוגמה: אני רוצה פרומפט שבודק קורות חיים ומתאים אותם למשרה ספציפית ומציע שאלות הכנה לראיון..."
              rows={3}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />

            {/* Inspiration Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                הצעות להשראה:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INSPIRATIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserIdea(item)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform and Tone Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  פלטפורמת יעד:
                </label>
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="ChatGPT">ChatGPT (OpenAI)</option>
                  <option value="Claude">Claude (Anthropic)</option>
                  <option value="Gemini">Gemini (Google)</option>
                  <option value="Midjourney">Midjourney</option>
                  <option value="General">כללי / אוניברסלי</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  טון וסגנון כתיבה:
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Professional">מקצועי ומדויק (Professional)</option>
                  <option value="Creative">יצירתי וסוחף (Creative)</option>
                  <option value="Concise">תמציתי וישיר (Concise)</option>
                  <option value="Academic">אקדמי ומעמיק (Academic)</option>
                  <option value="Persuasive">משכנע ושיווקי (Persuasive)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !userIdea.trim()}
              className="w-full mt-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>בונה פרומפט מושלם בטכניקות מתקדמות...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>צור פרומפט מקצועי מהרעיון שלי</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Preview */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {result.title}
                  </h4>
                  {result.explanation && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {result.explanation}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'הועתק' : 'העתק'}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Variables Breakdown */}
              {result.variables && result.variables.length > 0 && (
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                    <Variable className="w-3.5 h-3.5" />
                    משתנים דינמיים שנוספו לפרומפט:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {result.variables.map((v, i) => (
                      <div key={i} className="bg-white dark:bg-white/5 p-2 rounded-lg border border-indigo-100/50 dark:border-white/5">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">$({v.name})</span>
                        <div className="text-slate-500 dark:text-slate-400 mt-0.5">{v.description}</div>
                        {v.sample && <div className="text-slate-400 text-[10px] italic">דוגמה: {v.sample}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formatted Content */}
              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-slate-800" dir="auto">
                  {result.content}
                </pre>
              </div>

              {/* Tags */}
              {result.tags && result.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {result.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium"
                    >
                      <Tag className="w-2.5 h-2.5 text-indigo-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleOpenEditor}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-white/10"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ערוך בעורך הפרומפטים</span>
                </button>

                <button
                  disabled={isSaving}
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>שומר לכספת...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>שמור ישירות לכספת הפרומפטים</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
