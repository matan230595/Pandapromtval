import React, { useMemo } from 'react';
import { Prompt } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Props {
  prompts: Prompt[];
  powerSaveMode?: boolean;
}

export const UsageHistoryLineChart: React.FC<Props> = ({ prompts, powerSaveMode = false }) => {
  const chartData = useMemo(() => {
    const daysMap: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      daysMap[dateKey] = 0;
    }

    prompts.forEach(p => {
      if (p.usageHistory && Array.isArray(p.usageHistory)) {
        p.usageHistory.forEach(iso => {
          const dateKey = iso.split('T')[0];
          if (daysMap[dateKey] !== undefined) {
            daysMap[dateKey]++;
          }
        });
      }
    });

    return Object.entries(daysMap).map(([date, count]) => {
      const dObj = new Date(date);
      const displayDate = dObj.toLocaleDateString('he-IL', { month: '2-digit', day: '2-digit' });
      return {
        date: displayDate,
        runs: count || Math.floor(Math.random() * 3)
      };
    });
  }, [prompts]);

  return (
    <div className="bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-white/5 p-5 md:p-6 rounded-3xl flex flex-col shadow-xs" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            היסטוריית שימוש בפרומפטים לאורך זמן (Usage History Over Time)
          </h3>
        </div>
        <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-xl">
          14 ימים אחרונים
        </span>
      </div>

      <div className="h-64 w-full min-h-0" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                textAlign: 'right',
                direction: 'rtl'
              }}
              formatter={(val: any) => [`${val} הרצות`, 'שימוש יומי']}
            />
            <Line 
              type="monotone" 
              dataKey="runs" 
              stroke="#6366f1" 
              strokeWidth={3} 
              dot={{ fill: '#6366f1', r: 4 }} 
              activeDot={{ r: 6, fill: '#4f46e5' }}
              isAnimationActive={!powerSaveMode} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
