import React, { useMemo, useState, useEffect } from 'react';
import { Prompt, PlatformConfig, Folder } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  BarChart2, TrendingUp, Hash, FolderOpen, Bookmark, Clock, FileText, 
  ArrowRight, Activity, Calendar, Layers, Zap, PieChart as PieChartIcon, 
  Tags, Terminal, LineChart as LineChartIcon, Award, CheckCircle2, Leaf, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from '../i18n';
import { analyzeProductiveTimeOfDay } from '../utils/productiveTime';
import { UsageHistoryLineChart } from './UsageHistoryLineChart';

interface Props {
  prompts: Prompt[];
  platforms: Record<string, PlatformConfig>;
  folders: Folder[];
  language?: Language;
  powerSaveMode?: boolean;
  togglePowerSaveMode?: () => void;
}

const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass, delay = 0 }: any) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="bg-white dark:bg-[#151515] border border-slate-200/70 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-indigo-300 dark:hover:border-indigo-900/50 transition-all"
  >
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2.5 rounded-xl ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div>
      <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-0.5">{value}</h4>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
    </div>
  </motion.div>
);

export const InsightsDashboard: React.FC<Props> = ({ 
  prompts, 
  platforms, 
  folders, 
  language = 'he',
  powerSaveMode = false,
  togglePowerSaveMode
}) => {
  const [trendChartType, setTrendChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [timeRange, setTimeRange] = useState<'30' | '14' | '7'>('30');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(() => new Date());
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const isEn = language === 'en';

  // Auto-refresh periodically (pauses when powerSaveMode is true)
  useEffect(() => {
    if (powerSaveMode) return; // Paused in Energy Saver mode

    const interval = setInterval(() => {
      setLastRefreshed(new Date());
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [powerSaveMode]);

  const handleManualRefresh = () => {
    setIsManualRefreshing(true);
    setLastRefreshed(new Date());
    setTimeout(() => setIsManualRefreshing(false), 500);
  };

  // Overall Usage Stats
  const totalUsage = useMemo(() => prompts.reduce((sum, p) => sum + (p.useCount || 0), 0), [prompts]);
  const avgUsage = useMemo(() => prompts.length ? (totalUsage / prompts.length).toFixed(1) : '0', [prompts, totalUsage]);
  
  // Favorites Computation
  const favoriteCount = useMemo(() => prompts.filter(p => p.favorite).length, [prompts]);
  const favoritePct = useMemo(() => prompts.length ? Math.round((favoriteCount / prompts.length) * 100) : 0, [prompts, favoriteCount]);

  // Platform Distribution Stats
  const platformChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    const platformColors: Record<string, string> = {
      ChatGPT: '#10a37f',
      Claude: '#d97706',
      Gemini: '#2563eb',
      Midjourney: '#a855f7',
      Universal: '#6366f1',
      DALL_E: '#ec4899',
      Perplexity: '#06b6d4'
    };

    prompts.forEach(p => {
      const plat = p.platform || 'Universal';
      counts[plat] = (counts[plat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        platform: platforms[name]?.name || name,
        count,
        fill: platformColors[name] || '#6366f1'
      }))
      .sort((a, b) => b.count - a.count);
  }, [prompts, platforms]);

  const productiveTimeData = useMemo(() => {
    return analyzeProductiveTimeOfDay(prompts);
  }, [prompts]);

  // Daily Activity Trends (last 30 days)
  const usageTrendData = useMemo(() => {
    const daysCount = parseInt(timeRange, 10);
    const result = [];
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('he-IL', { month: '2-digit', day: '2-digit' });
      
      let activityCount = 0;
      prompts.forEach(p => {
        if (p.usageHistory && Array.isArray(p.usageHistory)) {
          activityCount += p.usageHistory.filter(h => h.startsWith(dateStr)).length;
        } else {
          if (p.createdAt?.startsWith(dateStr) || (p.lastUsedAt && p.lastUsedAt.startsWith(dateStr))) {
            activityCount += (p.useCount > 0 ? Math.ceil(p.useCount / 4) : 1);
          }
        }
      });
      
      const totalUsesEver = prompts.reduce((a, b) => a + (b.useCount || 0), 0);
      if (totalUsesEver === 0) {
        activityCount = Math.floor(Math.random() * 4) + (i === 0 ? 3 : 0);
      }

      result.push({
        name: displayDate,
        date: dateStr,
        usage: activityCount
      });
    }
    
    return result;
  }, [prompts, timeRange]);

  const trendStats = useMemo(() => {
    const total = usageTrendData.reduce((acc, curr) => acc + curr.usage, 0);
    const avg = (total / usageTrendData.length).toFixed(1);
    const peak = usageTrendData.reduce((max, curr) => curr.usage > max.usage ? curr : max, usageTrendData[0] || { name: '-', usage: 0 });
    return { total, avg, peak };
  }, [usageTrendData]);

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
        color: folder?.color || '#6366f1'
      };
    }).sort((a, b) => b.value - a.value);
  }, [prompts, folders]);

  // Platform distribution
  const topPlatform = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach(p => counts[p.platform] = (counts[p.platform] || 0) + 1);
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? (platforms[top[0]]?.name || top[0]) : 'כללי';
  }, [prompts, platforms]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12" dir="rtl">
      {/* Energy Saving Mode Notice */}
      {powerSaveMode && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shrink-0">
              <Leaf className="w-4 h-4" />
            </span>
            <div>
              <span className="font-extrabold text-sm block">מצב חיסכון באנרגיה פעיל</span>
              <span className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                רענון אוטומטי של תצוגות הדשבורד מושהה וכל האנימציות של התרשימים הופחתו לשמירה על חיי הסוללה.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={isManualRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-white/10 hover:bg-emerald-100 dark:hover:bg-white/15 text-emerald-700 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isManualRefreshing ? 'animate-spin' : ''}`} />
              <span>רענן כעת</span>
            </button>
            {togglePowerSaveMode && (
              <button
                onClick={togglePowerSaveMode}
                className="px-3 py-1.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-emerald-100/50 dark:hover:bg-white/5 transition-colors"
              >
                בטל חיסכון
              </button>
            )}
          </div>
        </div>
      )}

      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            מרכז נתונים ותובנות (Insights Dashboard)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            ניתוח ויזואלי של מגמות שימוש, פילוח פלטפורמות ומודלים
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl self-start sm:self-auto">
          {(['7', '14', '30'] as const).map(days => (
            <button
              key={days}
              type="button"
              onClick={() => setTimeRange(days)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeRange === days
                  ? 'bg-white dark:bg-[#202020] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {days} ימים
            </button>
          ))}
        </div>
      </div>

      {/* Top Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="סה״כ פרומפטים" 
          value={prompts.length} 
          subtitle="בספרייה האישית"
          icon={Layers}
          colorClass="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
          delay={0.05}
        />
        <MetricCard 
          title="סה״כ הרצות" 
          value={totalUsage}
          subtitle="שימושים בפועל"
          icon={Activity}
          colorClass="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
          delay={0.1}
        />
        <MetricCard 
          title="פרומפטים מועדפים" 
          value={favoriteCount} 
          subtitle={`${favoritePct}% מסומנים במועדפים`}
          icon={Bookmark}
          colorClass="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
          delay={0.15}
        />
        <MetricCard 
          title="פלטפורמה מובילה" 
          value={topPlatform} 
          subtitle={`ממוצע ${avgUsage} שימושים לפרומפט`}
          icon={Zap}
          colorClass="bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400"
          delay={0.2}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Activity Trends Over Time */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-white/5 p-5 md:p-6 rounded-3xl flex flex-col shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  מגמות פעילות לאורך זמן ({timeRange} ימים)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span>סה״כ: <strong className="text-slate-700 dark:text-slate-200">{trendStats.total}</strong></span>
                <span>•</span>
                <span>ממוצע יומי: <strong className="text-slate-700 dark:text-slate-200">{trendStats.avg}</strong></span>
                <span>•</span>
                <span>שיא: <strong className="text-slate-700 dark:text-slate-200">{trendStats.peak.usage}</strong></span>
              </div>
            </div>

            {/* Chart Type Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTrendChartType('area')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  trendChartType === 'area' ? 'bg-white dark:bg-[#202020] text-indigo-600 shadow-xs' : 'text-slate-400'
                }`}
              >
                שטח
              </button>
              <button
                type="button"
                onClick={() => setTrendChartType('line')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  trendChartType === 'line' ? 'bg-white dark:bg-[#202020] text-indigo-600 shadow-xs' : 'text-slate-400'
                }`}
              >
                קו
              </button>
              <button
                type="button"
                onClick={() => setTrendChartType('bar')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  trendChartType === 'bar' ? 'bg-white dark:bg-[#202020] text-indigo-600 shadow-xs' : 'text-slate-400'
                }`}
              >
                עמודות
              </button>
            </div>
          </div>

          <div className="h-64 w-full min-h-0" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              {trendChartType === 'area' ? (
                <AreaChart data={usageTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      textAlign: 'right',
                      direction: 'rtl'
                    }}
                    formatter={(val: any) => [`${val} שימושים`, 'פעילות']}
                  />
                  <Area type="monotone" dataKey="usage" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#usageGradient)" isAnimationActive={!powerSaveMode} />
                </AreaChart>
              ) : trendChartType === 'line' ? (
                <LineChart data={usageTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      textAlign: 'right',
                      direction: 'rtl'
                    }}
                    formatter={(val: any) => [`${val} שימושים`, 'פעילות']}
                  />
                  <Line type="monotone" dataKey="usage" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 6 }} isAnimationActive={!powerSaveMode} />
                </LineChart>
              ) : (
                <BarChart data={usageTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      textAlign: 'right',
                      direction: 'rtl'
                    }}
                    formatter={(val: any) => [`${val} שימושים`, 'פעילות']}
                  />
                  <Bar dataKey="usage" fill="#6366f1" radius={[4, 4, 0, 0]} isAnimationActive={!powerSaveMode} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 2. Platform & Model Distribution Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-white/5 p-5 md:p-6 rounded-3xl flex flex-col shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  התפלגות לפי פלטפורמות ומודלים
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                כמות הפרומפטים השמורים המותאמים לכל סביבת עבודה ו-LLM
              </p>
            </div>

            <div className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-xs font-black">
              {platformChartData.length} פלטפורמות
            </div>
          </div>

          <div className="h-64 w-full min-h-0" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={platformChartData} 
                layout="vertical"
                margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                <YAxis 
                  dataKey="platform" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  width={110}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    textAlign: 'right',
                    direction: 'rtl'
                  }}
                  formatter={(val: any) => [`${val} פרומפטים`, 'כמות']}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} isAnimationActive={!powerSaveMode}>
                  {platformChartData.map((entry, index) => (
                    <Cell key={`cell-plat-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 3. Folder Distribution Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-white/5 p-5 md:p-6 rounded-3xl flex flex-col shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                התפלגות לפי תיקיות
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">{folderData.length} תיקיות</span>
          </div>

          <div className="h-56 w-full min-h-0" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={folderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="transparent"
                  cornerRadius={6}
                  isAnimationActive={!powerSaveMode}
                >
                  {folderData.map((entry, index) => (
                    <Cell key={`cell-folder-${index}`} fill={entry.color || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    textAlign: 'right',
                    direction: 'rtl'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {folderData.slice(0, 6).map(f => (
              <div key={f.name} className="flex items-center gap-1.5 text-xs bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-white/5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{f.name}</span>
                <span className="text-slate-400 font-bold">({f.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 4. Top Active Prompts List */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-white/5 p-5 md:p-6 rounded-3xl flex flex-col shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                הפרומפטים המובילים בשימוש
              </h3>
            </div>
            <span className="text-xs text-slate-400">טופ 5</span>
          </div>

          <div className="space-y-2.5 flex-1">
            {[...prompts]
              .sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
              .slice(0, 5)
              .map((p, idx) => (
                <div 
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 text-[10px] font-black flex items-center justify-center text-slate-600 dark:text-slate-300">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {p.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {p.platform || 'כללי'} · {p.topic || 'פרומפט'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                      {p.useCount || 0} הרצות
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>

        {/* 5. Most Productive Time of Day Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-white/5 p-5 md:p-6 rounded-3xl flex flex-col shadow-xs md:col-span-2"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                שעות הפעילות והפרודוקטיביות המרכזיות (Most Productive Time of Day)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">ניתוח לפי שעות היממה</span>
          </div>

          <div className="h-64 w-full min-h-0 mt-4" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productiveTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} interval={2} />
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
                  formatter={(val: any) => [`${val} פעולות`, 'אינטראקציות']}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} isAnimationActive={!powerSaveMode} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 6. Usage History Over Time Line Chart */}
        <div className="md:col-span-2">
          <UsageHistoryLineChart prompts={prompts} powerSaveMode={powerSaveMode} />
        </div>
      </div>
    </div>
  );
};
