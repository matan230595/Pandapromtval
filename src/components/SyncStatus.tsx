import React from 'react';
import { Cloud, CloudOff, CloudLightning } from 'lucide-react';

interface Props {
  lastSync: Date | null;
  error?: boolean;
}

export const SyncStatus: React.FC<Props> = ({ lastSync, error }) => {
  return (
    <div className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
      {error ? (
        <>
          <CloudOff className="w-3.5 h-3.5 text-red-500" />
          <span className="text-red-500">שגיאת סנכרון</span>
        </>
      ) : lastSync ? (
        <>
          <Cloud className="w-3.5 h-3.5 text-green-500" />
          <span>סונכרן אחרון: {lastSync.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
        </>
      ) : (
        <>
          <CloudLightning className="w-3.5 h-3.5 text-blue-500" />
          <span>ממתין לסנכרון...</span>
        </>
      )}
    </div>
  );
};
