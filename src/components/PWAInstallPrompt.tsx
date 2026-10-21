import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('promptvault_pwa_dismissed') === 'true';
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos()) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('promptvault_pwa_dismissed', 'true');
  };

  if (isInstalled || isDismissed) return null;
  if (!deferredPrompt && !isIos()) return null;

  return (
    <>
      <div className="mx-3 my-2 p-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/50 dark:border-indigo-500/20 rounded-xl relative overflow-hidden group">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                התקן כאפליקציה למכשיר
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                גישה מהירה ועבודה מלאה ללא אינטרנט
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            title="סגור"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={handleInstallClick}
          className="mt-2.5 w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>התקן כעת</span>
        </button>
      </div>

      {/* iOS Installation Instructions Modal */}
      <AnimatePresence>
        {showIosGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#151515] p-6 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-white/10 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                התקנה ב-iOS (iPhone / iPad)
              </h3>
              <div className="text-xs text-slate-600 dark:text-slate-300 text-right space-y-2.5 leading-relaxed bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                <p>1. לחץ על כפתור <strong>שיתוף (Share)</strong> בתחתית דפדפן Safari.</p>
                <p>2. גלול מטה ובחר <strong>"הוסף למסך הבית" (Add to Home Screen)</strong>.</p>
                <p>3. לחץ על <strong>"הוסף" (Add)</strong> בפינה העליונה.</p>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                הבנתי, תודה
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
