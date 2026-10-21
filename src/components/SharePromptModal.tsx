import React, { useState } from 'react';
import { 
  X, Share2, Copy, Check, QrCode, Globe, Send, MessageCircle, 
  ExternalLink, Mail, Code, Sparkles, CheckCircle2, Bookmark
} from 'lucide-react';
import { Prompt } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onShowToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
  onOpenQrModal?: () => void;
  onPublishToCommunity?: (prompt: Prompt) => Promise<void> | void;
}

export const SharePromptModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prompt,
  onShowToast,
  onOpenQrModal,
  onPublishToCommunity,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [embedFormat, setEmbedFormat] = useState<'link' | 'markdown' | 'html'>('link');
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen || !prompt) return null;

  // Generate unique shareable URLs
  const baseUrl = window.location.origin;
  const uniqueShareUrl = `${baseUrl}?shared=${prompt.id}`;

  // Encode standalone self-contained payload for cross-environment sharing
  const encodedPayload = btoa(unescape(encodeURIComponent(JSON.stringify({
    id: prompt.id,
    title: prompt.title,
    content: prompt.content,
    platform: prompt.platform,
    tags: prompt.tags || []
  }))));
  const standaloneUrl = `${baseUrl}?shared_prompt_b64=${encodedPayload}`;

  const currentUrl = uniqueShareUrl;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    onShowToast?.('הקישור הועתק ללוח בהצלחה!', 'success');
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Social Share Handlers
  const handleShareTwitter = () => {
    const text = encodeURIComponent(`בדקו את הפרומפט "${prompt.title}" ל-${prompt.platform} ב-PandaPrompt:\n\n${currentUrl}`);
    const hashtags = (prompt.tags || []).slice(0, 3).map(t => t.replace(/\s+/g, '')).join(',');
    const url = `https://twitter.com/intent/tweet?text=${text}&hashtags=${encodeURIComponent(hashtags || 'AI,Prompt')}`;
    window.open(url, '_blank', 'width=600,height=450');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(prompt.title)}`;
    window.open(url, '_blank', 'width=600,height=450');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=550');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`*${prompt.title}* (${prompt.platform})\n${prompt.description || ''}\n\nהשתמש בפרומפט כאן: ${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`*${prompt.title}*\n${prompt.description || ''}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${text}`, '_blank');
  };

  const handleShareReddit = () => {
    const title = encodeURIComponent(`[Prompt Template] ${prompt.title} (${prompt.platform})`);
    window.open(`https://reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${title}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`פרומפט מומלץ: ${prompt.title}`);
    const body = encodeURIComponent(`היי,\n\nרציתי לשתף איתך את הפרומפט הבא ל-${prompt.platform}:\n\n${prompt.title}\n\nתוכן הפרומפט:\n${prompt.content}\n\nקישור ישיר לכספת:\n${currentUrl}\n\nנוצר באמצעות PandaPrompt AI Vault`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handlePublishToggle = async () => {
    if (!onPublishToCommunity) return;
    setIsPublishing(true);
    try {
      await onPublishToCommunity(prompt);
      onShowToast?.('הפרומפט פורסם בהצלחה לקהילה!', 'success');
    } catch {
      onShowToast?.('שגיאה בפרסום לקהילה', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const getEmbedCode = () => {
    if (embedFormat === 'markdown') {
      return `[![PandaPrompt: ${prompt.title}](${baseUrl}/favicon-48.png)](${currentUrl})\n\n> **${prompt.title}** (${prompt.platform})\n> \n> \`\`\`\n> ${prompt.content.slice(0, 150)}...\n> \`\`\`\n> [פתח ב-PandaPrompt](${currentUrl})`;
    }
    if (embedFormat === 'html') {
      return `<a href="${currentUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:#4f46e5;color:#fff;border-radius:10px;text-decoration:none;font-family:sans-serif;font-weight:bold;font-size:13px;"><span>⚡ פתח פרומפט: ${prompt.title}</span></a>`;
    }
    return currentUrl;
  };

  return (
    <div 
      className="fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-[#141414] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-xl overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                שיתוף פרומפט ברשתות החברתיות
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                {prompt.title}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* 1. Direct Social Media Share Buttons */}
          <div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>שיתוף ישיר ברשתות המובילות:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Twitter / X */}
              <button
                type="button"
                onClick={handleShareTwitter}
                className="flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-slate-900 dark:hover:border-white bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] text-slate-900 dark:text-white text-xs font-bold transition-all shadow-2xs group"
              >
                <span className="font-black text-sm">𝕏</span>
                <span>Twitter / X</span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={handleShareLinkedIn}
                className="flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 hover:border-blue-600 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold transition-all shadow-2xs"
              >
                <span className="font-black text-xs px-1 rounded bg-blue-600 text-white">in</span>
                <span>LinkedIn</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={handleShareFacebook}
                className="flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 hover:border-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shadow-2xs"
              >
                <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">f</span>
                <span>Facebook</span>
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={handleShareTelegram}
                className="flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-sky-200/80 dark:border-sky-900/50 hover:border-sky-600 bg-sky-50/50 hover:bg-sky-50 dark:bg-sky-950/20 dark:hover:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-bold transition-all shadow-2xs"
              >
                <Send className="w-3.5 h-3.5 text-sky-500" />
                <span>Telegram</span>
              </button>

              {/* Reddit */}
              <button
                type="button"
                onClick={handleShareReddit}
                className="flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-orange-200/80 dark:border-orange-900/50 hover:border-orange-600 bg-orange-50/50 hover:bg-orange-50 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-xs font-bold transition-all shadow-2xs"
              >
                <span className="font-black text-xs text-orange-600">r/</span>
                <span>Reddit</span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={handleShareEmail}
                className="flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Email</span>
              </button>

              {/* QR Code trigger */}
              <button
                type="button"
                onClick={() => { onClose(); onOpenQrModal?.(); }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 hover:border-purple-600 bg-purple-50/50 hover:bg-purple-50 dark:bg-purple-950/20 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all shadow-2xs"
              >
                <QrCode className="w-3.5 h-3.5 text-purple-500" />
                <span>קוד QR</span>
              </button>
            </div>
          </div>

          {/* 2. Unique Shareable Link Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">קישור ייחודי ישיר לפרומפט:</span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">עובד בכל מכשיר ודפדפן</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-300 outline-none px-2 font-mono"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(currentUrl, 'url')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
              >
                {copiedType === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'url' ? 'הועתק!' : 'העתק קישור'}</span>
              </button>
            </div>
          </div>

          {/* 3. Embed Snippets & Markdown Generator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-500" />
                <span>הטמעה ומסמכים (Embed):</span>
              </span>
              <div className="flex bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setEmbedFormat('markdown')}
                  className={`px-2 py-0.5 rounded ${embedFormat === 'markdown' ? 'bg-white dark:bg-[#222] shadow-2xs text-indigo-600' : 'text-slate-500'}`}
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setEmbedFormat('html')}
                  className={`px-2 py-0.5 rounded ${embedFormat === 'html' ? 'bg-white dark:bg-[#222] shadow-2xs text-indigo-600' : 'text-slate-500'}`}
                >
                  HTML
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                readOnly
                rows={2}
                value={getEmbedCode()}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-2.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 resize-none outline-none"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(getEmbedCode(), 'embed')}
                className="absolute end-2.5 bottom-2.5 p-1.5 rounded-lg bg-white dark:bg-[#222] border border-slate-200 dark:border-white/10 hover:bg-slate-50 text-slate-600 dark:text-slate-300 text-xs shadow-xs"
                title="העתק קוד הטמעה"
              >
                {copiedType === 'embed' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 4. Public Community Toggle */}
          {onPublishToCommunity && (
            <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    פרסום לגלריית הקהילה הציבורית
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    אפשר למשתמשים נוספים לגלות, לדרג ולהשתמש בפרומפט שלך
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isPublishing || prompt.isPublic}
                onClick={handlePublishToggle}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors shrink-0 ${
                  prompt.isPublic 
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 cursor-default' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {prompt.isPublic ? 'פורסם בקהילה ✓' : isPublishing ? 'מפרסם...' : 'פרסם כעת'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-[#111] flex justify-between items-center text-xs text-slate-500">
          <span>טיפ: הקישור פועל מיידית גם בטלפונים ניידים ובטאבלטים</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
};
