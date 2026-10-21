import React from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, wasOffline, clearWasOffline } = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-amber-500/95 dark:bg-amber-600/95 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm border border-amber-400/50"
        >
          <WifiOff className="w-4 h-4 animate-pulse" />
          <span>מצב לא מקוון (Offline) — הכספת זמינה מקומית. שינויים יישמרו ויסונכרנו בעת חיבור מחדש.</span>
        </motion.div>
      )}

      {isOnline && wasOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm"
        >
          <Wifi className="w-4 h-4" />
          <span>החיבור לאינטרנט חודש! הנתונים מסונכרנים לענן.</span>
          <button
            onClick={clearWasOffline}
            className="ms-2 px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[10px]"
          >
            אישור
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
