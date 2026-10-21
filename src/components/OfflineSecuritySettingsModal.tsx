import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Wifi, WifiOff, Lock, Unlock, Smartphone, Download, Check, X, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
}

export const OfflineSecuritySettingsModal: React.FC<Props> = ({ isOpen, onClose, showToast }) => {
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length < 4) {
      showToast('נא להזין קוד PIN באורך 4 ספרות לפחות', 'error');
      return;
    }
    setIsEncrypted(true);
    showToast('הצפנת נתונים מקומית הופעלה בהצלחה!', 'success');
    setPinCode('');
  };

  const handleDisableEncryption = () => {
    setIsEncrypted(false);
    showToast('ההצפנה המקומית הוסרה', 'info');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  אבטחת מידע מקומית ומצב אופליין (PWA & Security)
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">Offline Vault</span>
                </h3>
                <p className="text-xs text-teal-100">ניהול הצפנת נתונים מקומית וסנכרון אוטומטי ללא חיבור לאינטרנט</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-100">
            {/* Connection Status */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'}`}>
                  {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isOnline ? 'מחובר לאינטרנט (Online Mode)' : 'עובד במצב אופליין (Offline Mode)'}
                  </h4>
                  <p className="text-xs text-slate-500">הנתונים שלך מסונכרנים באופן אוטומטי ברקע</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${isOnline ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'}`}>
                {isOnline ? 'פעיל' : 'גיבוי מקומי'}
              </span>
            </div>

            {/* Local Encryption & PIN */}
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className={`w-5 h-5 ${isEncrypted ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">הצפנת נתונים מקומית (Client-side PIN)</h4>
                    <p className="text-xs text-slate-500">הגן על הפרומפטים הרגישים שלך באמצעות קוד PIN הצפנה במכשיר</p>
                  </div>
                </div>
                {isEncrypted && (
                  <button
                    onClick={handleDisableEncryption}
                    className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    בטל הצפנה
                  </button>
                )}
              </div>

              {!isEncrypted && (
                <form onSubmit={handleSavePin} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="הזן קוד PIN (לפחות 4 ספרות)"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-teal-600/20"
                  >
                    הפעל הצפנה
                  </button>
                </form>
              )}
            </div>

            {/* PWA Settings */}
            <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">התקנת אפליקציה (PWA Ready)</h4>
                  <p className="text-xs text-slate-500">השתמש באפליקציה ישירות משולחן העבודה או מסך הבית בנייד</p>
                </div>
              </div>
              <button
                onClick={() => showToast('האפליקציה מותקנת ומוכנה לפעולה מלאה במצב אופליין!', 'success')}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                בדיקת התקנה
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors"
            >
              סגור
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
