import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Prompt } from '../types';
import { BarChart2, Zap, Clock, Coins } from 'lucide-react';

interface Props {
  prompts: Prompt[];
}

export const AdvancedAnalytics: React.FC<Props> = ({ prompts }) => {
  // Mock data for charts
  const usageData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => ({
      name: new Date(Date.now() - (6 - i) * 24 * 3600 * 1000).toLocaleDateString('he-IL', { weekday: 'short' }),
      tokens: Math.floor(Math.random() * 50000 + 10000),
      calls: Math.floor(Math.random() * 50 + 10)
    }));
  }, []);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach(p => {
      const pName = p.platform || 'General';
      counts[pName] = (counts[pName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [prompts]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0a0a0a] max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <BarChart2 className="w-6 h-6" />
            </div>
            אנליטיקה ועלויות
          </h2>
          <p className="text-sm text-slate-500 mt-2">מעקב אחר ביצועים, צריכת Tokens ומגמות שימוש</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">סה״כ Tokens (חודשי)</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">1.2M</div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">קריאות API</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">342</div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">זמן ממוצע לתגובה</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">1.4s</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm h-96 flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6">צריכת Tokens יומית</h3>
          <div className="flex-1 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="tokens" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm h-96 flex flex-col">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6">התפלגות מודלים (פלטפורמות)</h3>
          <div className="flex-1 w-full flex items-center justify-center" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
