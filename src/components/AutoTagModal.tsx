import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Tag, Check, Loader2, X, Folder as FolderIcon } from 'lucide-react';
import { Prompt, Category } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  categories: Category[];
  allTags: string[];
  onApplyTags: (newTags: string[], category: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
}

export const AutoTagModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prompt,
  categories,
  allTags,
  onApplyTags,
  showToast
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggestedCategory, setSuggestedCategory] = useState<string>('כללי');

  if (!isOpen || !prompt) return null;

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const text = (prompt.title + ' ' + prompt.content).toLowerCase();
      
      const detectedTags: string[] = [];
      if (text.includes('code') || text.includes('typescript') || text.includes('react') || text.includes('קוד') || text.includes('תוכנה')) {
        detectedTags.push('פיתוח', 'קוד', 'TypeScript');
      }
      if (text.includes('content') || text.includes('write') || text.includes('blog') || text.includes('תוכן') || text.includes('כתיבה')) {
        detectedTags.push('כתיבה', 'שיווק', 'תוכן');
      }
      if (text.includes('seo') || text.includes('search') || text.includes('קידום')) {
        detectedTags.push('SEO', 'שיווק דיגיטלי');
      }
      if (detectedTags.length === 0) {
        detectedTags.push('AI', 'פרומפט-חכם', 'כללי');
      }

      // Suggest category
      let bestCategory = categories[0]?.name || 'פיתוח';
      if (text.includes('שיווק') || text.includes('marketing') || text.includes('content')) {
        bestCategory = categories.find(c => c.name.includes('שיווק') || c.name.includes('תוכן'))?.name || bestCategory;
      } else if (text.includes('קוד') || text.includes('code') || text.includes('dev')) {
        bestCategory = categories.find(c => c.name.includes('פיתוח') || c.name.includes('קוד'))?.name || bestCategory;
      }

      setSuggestedTags(detectedTags);
      setSuggestedCategory(bestCategory);
      showToast("ניתוח תוכן והצעת תגיות וקטגוריה הסתיימו בהצלחה!", "success");
    }, 1200);
  };

  const handleConfirm = () => {
    onApplyTags(suggestedTags, suggestedCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">תיוג וקיטלוג אוטומטי (Auto-Tagging)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">סריקת תוכן הפרומפט והמלצת תגיות וקטגוריה באמצעות AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-4 bg-slate-50 dark:bg-[#18181b] rounded-xl border border-slate-200 dark:border-white/10 space-y-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">כותרת הפרומפט: {prompt.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{prompt.content}</div>
          </div>

          {suggestedTags.length === 0 && !isAnalyzing ? (
            <button 
              onClick={handleStartAnalysis}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" /> התחל ניתוח והמלצת תגיות וקטגוריה
            </button>
          ) : isAnalyzing ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-500">סורק תוכן, מנתח הקשר ומפיק המלצות...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">קטגוריה מומלצת:</label>
                <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                  <FolderIcon className="w-4 h-4" />
                  <span>{suggestedCategory}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">תגיות מוצעות:</label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#1a1a1e] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200">
                      <Tag className="w-3.5 h-3.5 text-indigo-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleConfirm}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" /> החל תגיות וקטגוריה על הפרומפט
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
