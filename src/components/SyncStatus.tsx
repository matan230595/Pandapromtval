import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, WifiOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface Props {
  lastSync: Date | null;
  status?: 'idle' | 'syncing' | 'saved' | 'error' | 'offline';
  error?: boolean;
  onManualSync?: () => void | Promise<void>;
}

export const SyncStatus: React.FC<Props> = ({ lastSync, status, error, onManualSync }) => {
  const { isOnline } = useOnlineStatus();
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState(false);

  // Compute friendly relative time in Hebrew
  useEffect(() => {
    const updateTime = () => {
      if (!lastSync) {
        setTimeAgo('');
        return;
      }
      const syncDate = lastSync instanceof Date ? lastSync : new Date(lastSync);
      if (isNaN(syncDate.getTime())) {
        setTimeAgo('');
        return;
      }
      const diffSec = Math.floor((Date.now() - syncDate.getTime()) / 1000);
      if (diffSec < 15) {
        setTimeAgo('סונכרן הרגע');
      } else if (diffSec < 60) {
        setTimeAgo(`לפני ${diffSec} שניות`);
      } else if (diffSec < 3600) {
        const mins = Math.floor(diffSec / 60);
        setTimeAgo(`לפני ${mins} דק׳`);
      } else {
        const timeStr = syncDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        setTimeAgo(`היום ב-${timeStr}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [lastSync]);

  const handleTriggerSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onManualSync || isSpinning || status === 'syncing') return;
    setIsSpinning(true);
    try {
      await onManualSync();
    } finally {
      setTimeout(() => setIsSpinning(false), 600);
    }
  };

  const isCurrentlySyncing = status === 'syncing' || isSpinning;

  // Offline view
  if (!isOnline || status === 'offline') {
    return (
      <div 
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-950/40 rounded-xl border border-amber-500/30 dark:border-amber-800/50 shadow-xs"
        title="מצב לא מקוון. השינויים יישמרו מקומית ויסונכרנו בעת חיבור מחדש."
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
          <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate font-semibold">אופליין (שמירה מקומית)</span>
        </div>
        {onManualSync && (
          <button
            type="button"
            onClick={handleTriggerSync}
            className="p-1 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 rounded-lg text-amber-600 transition-colors shrink-0"
            title="בדוק חיבור וסנכרן"
          >
            <RefreshCw className={`w-3 h-3 ${isCurrentlySyncing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    );
  }

  // Error view
  if (error || status === 'error') {
    return (
      <div 
        onClick={handleTriggerSync}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-950/40 rounded-xl border border-rose-500/30 dark:border-rose-800/50 cursor-pointer hover:bg-rose-500/15 transition-all shadow-xs group"
        title="שגיאה בסנכרון לענן. לחץ לניסיון סנכרון חוזר."
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <div className="flex flex-col min-w-0 text-right">
            <span className="font-bold truncate">שגיאת סנכרון</span>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 group-hover:underline">לחץ לניסיון חוזר</span>
          </div>
        </div>
        <RefreshCw className={`w-3.5 h-3.5 text-rose-500 group-hover:rotate-180 transition-transform ${isCurrentlySyncing ? 'animate-spin' : ''}`} />
      </div>
    );
  }

  // Actively syncing view
  if (isCurrentlySyncing) {
    return (
      <div className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-950/40 rounded-xl border border-indigo-500/30 dark:border-indigo-800/50 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin shrink-0" />
          <span className="truncate">מסנכרן עם Firebase...</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
      </div>
    );
  }

  // Normal synced view (saved or idle)
  const exactTimeTooltip = lastSync 
    ? `סנכרון מלא עם Firebase Firestore\nשעה מדויקת: ${new Date(lastSync).toLocaleTimeString('he-IL')}\nלחץ להפעלת סנכרון ידני מיידי`
    : 'סנכרון מלא מול Firebase פעיל. לחץ לסנכרון ידני.';

  return (
    <div
      onClick={handleTriggerSync}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTriggerSync(e as any); }}
      className="group w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-emerald-500/5 dark:bg-emerald-950/20 hover:bg-emerald-500/10 dark:hover:bg-emerald-950/40 rounded-xl border border-emerald-500/20 dark:border-emerald-800/30 cursor-pointer transition-all shadow-xs hover:border-emerald-500/40"
      title={exactTimeTooltip}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative flex items-center justify-center shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
        </div>
        <div className="flex flex-col min-w-0 text-right">
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate">
              {status === 'saved' ? 'סונכרן ל-Firebase' : 'Firebase מחובר'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {timeAgo || 'סנכרון פעיל'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
          רענן
        </span>
        <div className="p-1 rounded-md group-hover:bg-slate-200/50 dark:group-hover:bg-white/10 text-slate-400 group-hover:text-indigo-500 transition-colors">
          <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
};
