import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Camera, Upload, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import jsQR from 'jsqr';
import { Prompt } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportPrompt: (prompt: Prompt) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
}

export const QrScannerModal: React.FC<Props> = ({ isOpen, onClose, onImportPrompt, showToast }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    } else {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMsg(null);
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(scanTick);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setErrorMsg("לא ניתן לגשת למצלמה. ניתן להשתמש בהעלאת תמונת QR מטה.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const scanTick = () => {
    if (!streamRef.current || !videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        handleDecodedData(code.data);
        return;
      }
    }
    if (streamRef.current) {
      requestAnimationFrame(scanTick);
    }
  };

  const handleDecodedData = (dataStr: string) => {
    stopCamera();
    try {
      let promptData: Prompt;
      if (dataStr.startsWith('{')) {
        promptData = JSON.parse(dataStr);
      } else if (dataStr.includes('shared_prompt_b64=')) {
        const urlParams = new URLSearchParams(dataStr.split('?')[1] || '');
        const b64 = urlParams.get('shared_prompt_b64');
        if (b64) {
          promptData = JSON.parse(decodeURIComponent(escape(atob(b64))));
        } else {
          throw new Error('Invalid shared URL');
        }
      } else {
        // Try parsing generic json
        promptData = JSON.parse(dataStr);
      }

      if (promptData && promptData.title && promptData.content) {
        const imported: Prompt = {
          ...promptData,
          id: window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36),
          title: `${promptData.title} (מיובא מ-QR)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          favorite: false,
          useCount: 0
        };
        onImportPrompt(imported);
        showToast('הפרומפט נסרק ונוסף לספרייה בהצלחה! 📱', 'success');
        onClose();
      } else {
        throw new Error('Invalid prompt structure');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('קוד ה-QR שסרוק אינו מכיל פרומפט תקין.');
      showToast('שגיאה בפענוח קוד ה-QR', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code) {
          handleDecodedData(code.data);
        } else {
          setErrorMsg('לא זוהה קוד QR בתמונה שנבחרה.');
          showToast('לא זוהה קוד QR בתמונה', 'error');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-white dark:bg-[#141416] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/15 w-full max-w-md overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-500" />
              סריקת QR קוד לייבוא פרומפט
            </h3>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 text-center">
            <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
              
              {!isScanning && !errorMsg && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/85 text-white text-xs font-semibold p-4">
                  מפעיל מצלמה...
                </div>
              )}

              {/* Scanning laser line animation */}
              {isScanning && (
                <div className="absolute inset-x-0 h-0.5 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-bounce" style={{ top: '50%' }} />
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2">
              <label className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                <span>העלה תמונת QR מהגלריה / קובץ</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            
            <p className="text-[11px] text-slate-400">
              הצג את קוד ה-QR ממסך של משתמש אחר מול המצלמה כדי לייבא את הפרומפט ישירות לספרייה שלך.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
