import React, { useMemo } from 'react';
import { Prompt, PlatformConfig, Folder } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area , Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Activity, PieChart as PieChartIcon, TrendingUp, Hash, Layers, Folder as FolderIcon, Clock, Terminal, Zap } from 'lucide-react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  prompts: Prompt[];
  platforms: Record<string, PlatformConfig>;
  folders: Folder[];
}

const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass, delay = 0 }: any) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div>
      <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{value}</h4>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
    </div>
  </motion.div>
);

export const InsightsDashboard: React.FC<Props> = ({ prompts, platforms, folders }) => {
  // Folder distribution
  const folderData = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach(p => {
      counts[p.folder] = (counts[p.folder] || 0) + 1;
    });
    return Object.entries(counts).map(([id, value]) => {
      const folder = folders.find(f => f.id === id);
      return {
        name: folder?.name || id,
        value,
        color: folder?.color || '#94a3b8'
      };
    }).sort((a, b) => b.value - a.value);
  }, [prompts, folders]);

  // Usage trends (mocking a 7 day trend based on activity if possible, otherwise just a nice curve)
  const usageTrendData = useMemo(() => {
    const result = [];
    
    // Create last 30 days array
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('he-IL', { month: '2-digit', day: '2-digit' });
      
      let activityCount = 0;
      prompts.forEach(p => {
        // If we have actual usage history array, count exact uses on this day
        if (p.usageHistory && Array.isArray(p.usageHistory)) {
          activityCount += p.usageHistory.filter(h => h.startsWith(dateStr)).length;
        } else {
          // Fallback heuristic
          if (p.createdAt.startsWith(dateStr) || (p.lastUsedAt && p.lastUsedAt.startsWith(dateStr))) {
            activityCount += (p.useCount > 0 ? Math.ceil(p.useCount / 3) : 1);
          }
        }
      });
      
      // If we have no activity at all in the app yet, add some noise so chart isn't empty, otherwise respect 0
      const totalUsesEver = prompts.reduce((a, b) => a + (b.useCount || 0), 0);
      if (totalUsesEver === 0) {
        activityCount = Math.floor(Math.random() * 5) + (i === 0 ? 5 : 0);
      }

      result.push({
        name: displayDate,
        usage: activityCount
      });
    }
    
    return result;
  }, [prompts]);

  const topPlatform = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach(p => counts[p.platform] = (counts[p.platform] || 0) + 1);
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? (platforms[top[0]]?.name || top[0]) : 'אין';
  }, [prompts, platforms]);
  
  const totalUsage = useMemo(() => prompts.reduce((sum, p) => sum + (p.useCount || 0), 0), [prompts]);
  const avgUsageStr = prompts.length ? (totalUsage / prompts.length).toFixed(1) : '0';
  const avgUsage = parseFloat(avgUsageStr);

  const recentActivity = useMemo(() => {
    return [...prompts]
      .filter(p => p.lastUsedAt)
      .sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime())
      .slice(0, 5);
  }, [prompts]);

  
  const radarData = useMemo(() => {
    // Generate some meaningful metrics from prompt data
    let avgSuccess = 0;
    let avgLength = 0;
    let avgTags = 0;
    let completionQuality = 0;
    
    if (prompts.length > 0) {
      avgSuccess = prompts.reduce((acc, p) => acc + (p.successRating || 3), 0) / prompts.length;
      avgLength = Math.min(100, (prompts.reduce((acc, p) => acc + (p.content?.length || 0), 0) / prompts.length) / 10);
      avgTags = Math.min(100, (prompts.reduce((acc, p) => acc + (p.tags?.length || 0), 0) / prompts.length) * 20);
      completionQuality = prompts.reduce((acc, p) => acc + (p.exampleOutput ? 100 : 0) + (p.notes ? 100 : 0), 0) / (prompts.length * 2);
    }
    
    return [
      { subject: 'דירוג הצלחה', A: (avgSuccess / 5) * 100, fullMark: 100 },
      { subject: 'איכות השלמה', A: completionQuality, fullMark: 100 },
      { subject: 'אורך ממוצע', A: avgLength, fullMark: 100 },
      { subject: 'עושר תגיות', A: avgTags, fullMark: 100 },
      { subject: 'שימוש חוזר', A: Math.min(100, avgUsage * 10), fullMark: 100 },
    ];
  }, [prompts, avgUsage]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">תובנות ופעילות</h1>
        <p className="text-slate-500 dark:text-slate-400">מעקב אחר השימוש והארגון של ספריית הפרומפטים שלך</p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="סך הפרומפטים" 
          value={prompts.length} 
          subtitle="בספרייה שלך"
          icon={Layers}
          colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          delay={0.1}
        />
        <MetricCard 
          title="ממוצע שימושים" 
          value={avgUsageStr}
          subtitle="שימושים לפרומפט"
          icon={Activity}
          colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          delay={0.2}
        />
        <MetricCard 
          title="פלטפורמה מובילה" 
          value={topPlatform} 
          subtitle="לפי כמות פרומפטים"
          icon={Zap}
          colorClass="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Usage Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 p-6 md:p-8 rounded-3xl h-[400px] flex flex-col shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">מגמות שימוש (30 ימים)</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 min-h-0" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageTrendData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} minTickGap={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    backgroundColor: 'rgba(15,15,15,0.95)',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    textAlign: 'right' 
                  }}
                />
                <Bar dataKey="usage" name="שימושים" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32}>
                  {usageTrendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === usageTrendData.length - 1 ? '#4f46e5' : '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>


        {/* Prompt Quality Radar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 p-6 md:p-8 rounded-3xl h-[400px] flex flex-col shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">איכות ואפקטיביות</h3>
            <Star className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 min-h-0 relative" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(100,116,139,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                <Radar name="Quality" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    backgroundColor: 'rgba(15,15,15,0.95)',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    textAlign: 'right' 
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Folder Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 p-6 md:p-8 rounded-3xl h-[400px] flex flex-col shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">חלוקה לתיקיות</h3>
            <PieChartIcon className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 min-h-0 relative" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={folderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="transparent"
                  cornerRadius={6}
                >
                  {folderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    backgroundColor: 'rgba(15,15,15,0.95)',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    textAlign: 'right' 
                  }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {folderData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs font-medium bg-slate-50 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-white/5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-slate-700 dark:text-slate-300">{p.name}</span>
                <span className="text-slate-400 font-bold ml-1">{p.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm"
      >
        <div className="p-6 md:p-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            פעילות אחרונה
          </h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          <AnimatePresence mode="popLayout">
          {recentActivity.length > 0 ? recentActivity.map(prompt => (
            <motion.div layout key={prompt.id} className="p-4 md:px-8 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                  <Terminal className="w-5 h-5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{prompt.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="truncate">{folders.find(f => f.id === prompt.folder)?.name || 'ללא תיקייה'}</span>
                    <span>•</span>
                    <span>לפני {Math.round((new Date().getTime() - new Date(prompt.lastUsedAt!).getTime()) / (1000 * 3600 * 24))} ימים</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{prompt.useCount}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">שימושים</span>
              </div>
            </motion.div>
          )) : (
            <div className="p-8 text-center text-slate-500">
              אין עדיין פעילות מתועדת במערכת.
            </div>
          )}
          </AnimatePresence>
        </div>
      </motion.div>

    </div>
  );
};
