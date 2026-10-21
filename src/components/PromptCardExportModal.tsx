import React, { useRef, useState } from 'react';
import { Prompt, PlatformConfig } from '../types';
import { X, Download, Share2, Sparkles, Check, Copy, Palette, Eye, Image as ImageIcon, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { recordScoreAction } from '../utils/scoreSystem';

interface Props {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  platforms: Record<string, PlatformConfig>;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type ThemeId = 'dark-gradient' | 'clean-light' | 'midnight-blue' | 'emerald-glow' | 'cyber-purple';
type ImageFormat = 'png' | 'jpeg';

export const PromptCardExportModal: React.FC<Props> = ({
  prompt,
  isOpen,
  onClose,
  platforms,
  onShowToast,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('dark-gradient');
  const [imageFormat, setImageFormat] = useState<ImageFormat>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !prompt) return null;

  const platform = platforms[prompt.platform] || {
    id: prompt.platform,
    name: prompt.platform || 'AI',
    color: '#3b82f6',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
  };

  const wordCount = prompt.content ? prompt.content.trim().split(/\s+/).length : 0;
  const charCount = prompt.content ? prompt.content.length : 0;

  const themeStyles: Record<ThemeId, {
    container: string;
    textTitle: string;
    textContent: string;
    border: string;
    contentBox: string;
    watermark: string;
    badgeStyle: string;
  }> = {
    'dark-gradient': {
      container: 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white',
      textTitle: 'text-white',
      textContent: 'text-slate-200',
      border: 'border-white/10 shadow-2xl shadow-indigo-500/10',
      contentBox: 'bg-white/5 border border-white/10 text-slate-100',
      watermark: 'text-slate-400',
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    'midnight-blue': {
      container: 'bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white',
      textTitle: 'text-blue-50',
      textContent: 'text-blue-100',
      border: 'border-blue-500/20 shadow-2xl shadow-blue-900/30',
      contentBox: 'bg-blue-950/40 border border-blue-500/20 text-blue-50',
      watermark: 'text-blue-300',
      badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    },
    'emerald-glow': {
      container: 'bg-gradient-to-br from-slate-950 via-emerald-950/80 to-slate-900 text-white',
      textTitle: 'text-emerald-100',
      textContent: 'text-slate-200',
      border: 'border-emerald-500/20 shadow-2xl shadow-emerald-950/40',
      contentBox: 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-50',
      watermark: 'text-emerald-300/70',
      badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    'cyber-purple': {
      container: 'bg-gradient-to-br from-[#130722] via-[#1a0933] to-[#260f4a] text-white',
      textTitle: 'text-purple-100',
      textContent: 'text-purple-200',
      border: 'border-purple-500/30 shadow-2xl shadow-purple-900/40',
      contentBox: 'bg-purple-950/30 border border-purple-500/30 text-purple-100',
      watermark: 'text-purple-300/80',
      badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
    'clean-light': {
      container: 'bg-gradient-to-br from-white via-slate-50 to-blue-50/30 text-slate-900',
      textTitle: 'text-slate-900',
      textContent: 'text-slate-700',
      border: 'border-slate-200/80 shadow-xl shadow-slate-200/50',
      contentBox: 'bg-white border border-slate-200 text-slate-800',
      watermark: 'text-slate-500',
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  };

  const activeTheme = themeStyles[selectedTheme];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      // Small pause to ensure layout has settled
      await new Promise(r => setTimeout(r, 120));

      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const mimeType = imageFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mimeType, 0.95);

      const safeTitle = (prompt.title || 'prompt').replace(/[^a-zA-Z0-9\u0590-\u05FF-_]/g, '_');
      const link = document.createElement('a');
      link.download = `pandaprompt-${safeTitle}.${imageFormat}`;
      link.href = dataUrl;
      link.click();

      // Record score action
      const scoreResult = recordScoreAction('export_card');
      onShowToast(`הכרטיס יוצא בהצלחה כ-${imageFormat.toUpperCase()}! 🎨 (${scoreResult.message})`, 'success');
    } catch (err) {
      console.error('Failed to export using html2canvas:', err);
      onShowToast('שגיאה ביצירת תמונת הכרטיס', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      await new Promise(r => setTimeout(r, 120));

      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && (window as any).ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new (window as any).ClipboardItem({ 'image/png': blob })
            ]);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);

            const scoreResult = recordScoreAction('export_card');
            onShowToast(`התמונה הועתקה ללוח בהצלחה! 📋 (${scoreResult.message})`, 'success');
          } catch (e) {
            handleDownload();
          }
        } else {
          handleDownload();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to copy image blob:', err);
      handleDownload();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">ייצוא כרטיס פרומפט כתמונה (html2canvas)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">מעוצב ומותאם לשיתוף ברשתות חברתיות (LinkedIn, X, WhatsApp)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme & Format selector */}
          <div className="px-6 py-3 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                <Palette className="w-3.5 h-3.5" />
                <span>עיצוב:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'dark-gradient', label: 'כהה יוקרתי' },
                  { id: 'midnight-blue', label: 'כחול עמוק' },
                  { id: 'emerald-glow', label: 'אמרלד AI' },
                  { id: 'cyber-purple', label: 'סייבר סגול' },
                  { id: 'clean-light', label: 'לבן נקי' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id as ThemeId)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                      selectedTheme === t.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format toggle: PNG / JPEG */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">פורמט:</span>
              <div className="flex bg-slate-200 dark:bg-white/10 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImageFormat('png')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    imageFormat === 'png'
                      ? 'bg-white dark:bg-[#222] text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  PNG
                </button>
                <button
                  type="button"
                  onClick={() => setImageFormat('jpeg')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    imageFormat === 'jpeg'
                      ? 'bg-white dark:bg-[#222] text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  JPEG
                </button>
              </div>
            </div>
          </div>

          {/* Card Preview Container */}
          <div className="p-6 overflow-y-auto flex-1 flex justify-center items-center bg-slate-100/50 dark:bg-black/30">
            <div
              ref={cardRef}
              className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 border transition-all duration-300 ${activeTheme.container} ${activeTheme.border}`}
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              {/* Card Top Brand & Platform */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-wide uppercase opacity-90 block">
                      PromptVault OS
                    </span>
                    <span className="text-[10px] opacity-60 block">
                      כרטיס פרומפט מקצועי
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {prompt.type && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${activeTheme.badgeStyle}`}>
                      {prompt.type === 'image' ? 'תמונה AI' : prompt.type === 'code' ? 'קוד ותכנות' : 'טקסט / LLM'}
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${activeTheme.badgeStyle}`}>
                    {platform.name}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2 className={`text-xl sm:text-2xl font-black mb-2 leading-tight ${activeTheme.textTitle}`}>
                {prompt.title}
              </h2>

              {/* Description */}
              {prompt.description && (
                <p className={`text-xs opacity-75 mb-4 leading-relaxed line-clamp-2 ${activeTheme.textContent}`}>
                  {prompt.description}
                </p>
              )}

              {/* Prompt Content Preview Box */}
              <div className={`p-4 rounded-2xl mb-5 font-sans text-sm whitespace-pre-wrap leading-relaxed max-h-56 overflow-hidden relative ${activeTheme.contentBox}`}>
                {prompt.content}
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>

              {/* Card Meta Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10 text-[11px] opacity-80 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span>{wordCount} מילים</span>
                  <span>•</span>
                  <span>{charCount} תווים</span>
                  {prompt.tags && prompt.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex gap-1">
                        {prompt.tags.slice(0, 2).map(t => (
                          <span key={t} className="opacity-90">#{t}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <span className={`text-[10px] font-semibold ${activeTheme.watermark}`}>
                  נוצר באמצעות PromptVault OS
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 bg-slate-50 dark:bg-[#121212] border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              יוצא באמצעות <strong>html2canvas</strong> ברזולוציה גבוהה
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyToClipboard}
                disabled={isExporting}
                className="px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'הועתק ללוח!' : 'העתק תמונה'}</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'מעבד תמונה...' : `הורד ${imageFormat.toUpperCase()}`}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
