import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Download, Copy, Check, Smartphone, Link, FileText, Share2 } from 'lucide-react';
import { Prompt } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onShowToast?: (msg: string, type: string) => void;
}

export const PromptQrCodeModal: React.FC<Props> = ({ isOpen, onClose, prompt, onShowToast }) => {
  const [qrMode, setQrMode] = useState<'content' | 'link'>('content');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen || !prompt) return;

    const generate = async () => {
      try {
        let payload = '';
        if (qrMode === 'link') {
          payload = `${window.location.origin}?shared=${prompt.id}`;
        } else {
          // Direct content: limited to reasonable QR payload length for optimal scanability
          const trimmedContent = prompt.content.length > 1800 
            ? prompt.content.substring(0, 1800) + '...' 
            : prompt.content;
          payload = trimmedContent;
        }

        const url = await QRCode.toDataURL(payload, {
          width: 512,
          margin: 2,
          color: {
            dark: '#1e1b4b', // deep indigo
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        });
        setDataUrl(url);
      } catch (err) {
        console.error("Failed to generate QR code", err);
      }
    };

    generate();
  }, [isOpen, prompt, qrMode]);

  if (!isOpen || !prompt) return null;

  const handleDownload = () => {
    if (!dataUrl) return;

    // Create styled export canvas with title, branding, and QR
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 600;
      const height = 750;
      canvas.width = width;
      canvas.height = height;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#ffffff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Card container border
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Header Brand
      ctx.fillStyle = '#4f46e5';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PandaPrompt • כספת הפרומפטים ל-AI', width / 2, 65);

      // Title
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px system-ui, sans-serif';
      const title = prompt.title.length > 32 ? prompt.title.substring(0, 32) + '...' : prompt.title;
      ctx.fillText(title, width / 2, 115);

      // Mode label
      ctx.fillStyle = '#64748b';
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText(qrMode === 'link' ? 'קישור שיתוף ישיר' : 'תוכן הפרומפט להעתקה במובייל', width / 2, 145);

      // Draw QR Code
      const qrSize = 400;
      const qrX = (width - qrSize) / 2;
      const qrY = 175;
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

      // Footer
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText('סרוק באמצעות מצלמת הסמארטפון כדי לפתוח ולהשתמש', width / 2, 630);
      ctx.fillText('נוצר באמצעות PandaPrompt AI Vault', width / 2, 660);

      // Trigger download
      const a = document.createElement('a');
      a.download = `qr_${prompt.title.replace(/[^a-zA-Z0-9_\u0590-\u05fe]/g, '_')}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();

      onShowToast?.("תמונת ה-QR הורדה בהצלחה!", "success");
    };
    img.src = dataUrl;
  };

  const handleCopyText = () => {
    const text = qrMode === 'link' 
      ? `${window.location.origin}?shared=${prompt.id}` 
      : prompt.content;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    onShowToast?.("הועתק ללוח!", "success");
  };

  return (
    <div 
      className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-[#141414] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-md overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                ייצוא ושיתוף כקוד QR
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
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
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl w-full border border-slate-200/60 dark:border-white/5">
            <button
              type="button"
              onClick={() => setQrMode('content')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                qrMode === 'content'
                  ? 'bg-white dark:bg-[#222] shadow-xs text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>תוכן הפרומפט</span>
            </button>
            <button
              type="button"
              onClick={() => setQrMode('link')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                qrMode === 'link'
                  ? 'bg-white dark:bg-[#222] shadow-xs text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>קישור ישיר (Web)</span>
            </button>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-3xl shadow-md border-2 border-indigo-100 dark:border-indigo-950/60 relative group">
            {dataUrl ? (
              <img 
                src={dataUrl} 
                alt="Prompt QR Code" 
                className="w-56 h-56 rounded-xl object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                מייצר קוד QR...
              </div>
            )}
            <div className="absolute inset-0 bg-indigo-600/5 rounded-3xl pointer-events-none" />
          </div>

          {/* Explanation badge */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-white/5">
            <Smartphone className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>סרוק באמצעות מצלמת הסלולר כדי להשתמש בפרומפט מיידית</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#111] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'הועתק!' : 'העתק טקסט'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>הורד כתמונה</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
