import React, { useMemo } from 'react';
import { Prompt } from '../types';
import { Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  prompts: Prompt[];
  language?: string;
}

export const CalendarHeatmap: React.FC<Props> = ({ prompts }) => {
  // Generate last 6 months (approx 180 days)
  const heatmapData = useMemo(() => {
    const days: { dateStr: string; dateObj: Date; count: number }[] = [];
    const today = new Date();
    
    // 180 days ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 180);

    // Map usage counts per day string YYYY-MM-DD
    const countsMap: Record<string, number> = {};

    prompts.forEach(p => {
      // Check usageHistory
      if (p.usageHistory && Array.isArray(p.usageHistory)) {
        p.usageHistory.forEach(h => {
          const dayKey = h.split('T')[0];
          countsMap[dayKey] = (countsMap[dayKey] || 0) + 1;
        });
      }
      // Fallback to createdAt or lastUsedAt or useCount
      const primaryDate = (p.lastUsedAt || p.createdAt || '').split('T')[0];
      if (primaryDate) {
        countsMap[primaryDate] = (countsMap[primaryDate] || 0) + (p.useCount > 0 ? Math.min(p.useCount, 3) : 1);
      }
    });

    for (let i = 0; i <= 180; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dateObj: d,
        count: countsMap[dateStr] || 0
      });
    }

    return days;
  }, [prompts]);

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-white/[0.03] border-slate-200/50 dark:border-white/5';
    if (count <= 2) return 'bg-indigo-300 dark:bg-indigo-900/60 border-indigo-400 dark:border-indigo-800';
    if (count <= 5) return 'bg-indigo-500 dark:bg-indigo-600 border-indigo-600 dark:border-indigo-500';
    return 'bg-indigo-700 dark:bg-indigo-500 border-indigo-800 dark:border-indigo-400 shadow-xs shadow-indigo-500/30';
  };

  const totalRuns = useMemo(() => heatmapData.reduce((sum, d) => sum + d.count, 0), [heatmapData]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-white/5 p-5 md:p-6 rounded-3xl flex flex-col shadow-xs"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            מפת חום פעילות (Calendar Heatmap - 6 חודשים אחרונים)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
          <span>סך פעילות מוערכת: {totalRuns} פעולות</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 pt-1" dir="ltr">
        <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 min-w-[700px]">
          {heatmapData.map((day) => (
            <div
              key={day.dateStr}
              title={`${day.dateStr}: ${day.count} פעולות`}
              className={`w-3.5 h-3.5 rounded-sm border transition-transform hover:scale-125 cursor-pointer ${getColorClass(day.count)}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-400 font-medium">
        <span>לפני 6 חודשים</span>
        <div className="flex items-center gap-1.5">
          <span>פחות</span>
          <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-white/[0.03] border border-slate-200" />
          <div className="w-3 h-3 rounded-sm bg-indigo-300 dark:bg-indigo-900/60" />
          <div className="w-3 h-3 rounded-sm bg-indigo-500 dark:bg-indigo-600" />
          <div className="w-3 h-3 rounded-sm bg-indigo-700 dark:bg-indigo-500" />
          <span>יותר</span>
        </div>
        <span>היום</span>
      </div>
    </motion.div>
  );
};
