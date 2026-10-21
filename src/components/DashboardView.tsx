import React, { useMemo, useState, useEffect } from 'react';
import { Prompt, Folder, PlatformConfig } from '../types';
import { Plus, Clock, Heart, ArrowLeft, Terminal, TrendingUp, Star, Zap, Search, Activity, Calendar, Bot, BarChart2, Target, CheckCircle2, Edit2, Sparkles, Tag, Hash, Leaf, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis } from 'recharts';
import { RecommendationsSection } from './RecommendationsSection';

interface Props {
  prompts: Prompt[];
  folders: Folder[];
  platforms: Record<string, PlatformConfig>;
  onSelectPrompt: (id: string) => void;
  onCreatePrompt: () => void;
  onNavigateToLibrary: (folderId?: string) => void;
  onSelectTag?: (tag: string) => void;
  powerSaveMode?: boolean;
  togglePowerSaveMode?: () => void;
}

export const DashboardView: React.FC<Props> = ({ 
  prompts, 
  folders, 
  platforms, 
  onSelectPrompt, 
  onCreatePrompt, 
  onNavigateToLibrary, 
  onSelectTag,
  powerSaveMode = false,
  togglePowerSaveMode
}) => {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(() => new Date());
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

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
  
  const recentPrompts = useMemo(() => {
    return [...prompts]
      .sort((a, b) => new Date(b.lastUsedAt || b.updatedAt).getTime() - new Date(a.lastUsedAt || a.updatedAt).getTime())
      .slice(0, 5);
  }, [prompts]);

  const favoritePrompts = useMemo(() => {
    return prompts.filter(p => p.favorite).slice(0, 5);
  }, [prompts]);


  const platformUsageData = useMemo(() => {
    const usage: Record<string, number> = {};
    prompts.forEach(p => {
      const pName = p.platform || 'General';
      usage[pName] = (usage[pName] || 0) + (p.useCount || 0);
    });
    return Object.entries(usage)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5
  }, [prompts]);

  const totalUses = useMemo(() => {
    return prompts.reduce((sum, p) => sum + (p.useCount || 0), 0);
  }, [prompts]);

  
  const heatmapData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    prompts.forEach(p => {
      (p.usageHistory || []).forEach(iso => {
        const d = new Date(iso);
        const day = d.getDay();
        const hour = d.getHours();
        const key = `${day}-${hour}`;
        dataMap[key] = (dataMap[key] || 0) + 1;
      });
    });
    const result = [];
    for(let day=0; day<7; day++) {
      for(let hour=0; hour<24; hour++) {
        const val = dataMap[`${day}-${hour}`];
        if (val) {
          result.push({ day, hour, value: val });
        }
      }
    }
    return result;
  }, [prompts]);

  const timeSaved = useMemo(() => {
    // Assuming each prompt saves about 10 minutes of work on average
    const minutes = totalUses * 10;
    if (minutes > 60) {
      return `${Math.floor(minutes / 60)} שעות`;
    }
    return `${minutes} דקות`;
  }, [totalUses]);

  // Visual Tag Cloud Data Calculation
  const tagStats = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach(p => {
      (p.tags || []).forEach(t => {
        const trimmed = t.trim();
        if (trimmed) {
          counts[trimmed] = (counts[trimmed] || 0) + 1;
        }
      });
    });

    const entries = Object.entries(counts).map(([name, count]) => ({ name, count }));
    if (entries.length === 0) return { tags: [], min: 0, max: 0, totalCount: 0 };

    entries.sort((a, b) => b.count - a.count);
    const max = Math.max(...entries.map(e => e.count), 1);
    const min = Math.min(...entries.map(e => e.count), 1);
    const totalCount = entries.reduce((sum, e) => sum + e.count, 0);
    return { tags: entries, min, max, totalCount };
  }, [prompts]);

  // Daily Prompt Usage Goal State & Calculation
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("promptvault_daily_goal");
      return saved ? Math.max(1, parseInt(saved, 10)) : 5;
    } catch {
      return 5;
    }
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState(dailyGoal.toString());

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const promptsUsedToday = useMemo(() => {
    let count = 0;
    prompts.forEach(p => {
      if (p.usageHistory && Array.isArray(p.usageHistory)) {
        count += p.usageHistory.filter(ts => ts.startsWith(todayStr)).length;
      } else if (p.lastUsedAt && p.lastUsedAt.startsWith(todayStr)) {
        count += 1;
      }
    });
    return count;
  }, [prompts, todayStr]);

  const goalProgressPct = Math.min(100, Math.round((promptsUsedToday / dailyGoal) * 100));
  const isGoalCompleted = promptsUsedToday >= dailyGoal;

  const handleUpdateGoal = (num: number) => {
    const val = Math.max(1, Math.min(100, num));
    setDailyGoal(val);
    setCustomGoalInput(val.toString());
    try {
      localStorage.setItem("promptvault_daily_goal", val.toString());
    } catch (e) {
      console.error(e);
    }
    setIsEditingGoal(false);
  };

  const PromptCard: React.FC<{ prompt: Prompt }> = ({ prompt }) => (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={() => onSelectPrompt(prompt.id)}
      className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 p-5 rounded-2xl shadow-sm text-start flex flex-col h-full transition-all hover:shadow-lg hover:border-blue-500/30 group"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${platforms[prompt.platform]?.bgColor || 'bg-slate-100'} ${platforms[prompt.platform]?.textColor || 'text-slate-600'}`}>
          {platforms[prompt.platform]?.name || prompt.platform}
        </span>
        {prompt.favorite && <Heart className="w-4 h-4 text-red-500 fill-current" />}
      </div>
      <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{prompt.title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1">{prompt.content}</p>
      
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-white/5 pt-3 w-full">
        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(prompt.updatedAt).toLocaleDateString('he-IL')}</span>
        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-md"><Terminal className="w-3 h-3" /> {prompt.useCount || 0} שימושים</span>
      </div>
    </motion.button>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12" dir="rtl">
      
      {/* Energy Saving Mode Notice / Refresh Bar */}
      {powerSaveMode ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-800 dark:text-emerald-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 shrink-0">
              <Leaf className="w-4 h-4" />
            </span>
            <div>
              <span className="font-extrabold text-sm block">מצב חיסכון באנרגיה פעיל</span>
              <span className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                רענון אוטומטי של תצוגות הדשבורד מושהה ואנימציות הופחתו לשמירה על חיי הסוללה.
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
      ) : (
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>רענון אוטומטי של נתונים פעיל</span>
          </div>
          <div className="flex items-center gap-2">
            <span>עודכן לאחרונה: {lastRefreshed.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <button
              onClick={handleManualRefresh}
              className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title="רענן נתונים כעת"
            >
              <RefreshCw className={`w-3 h-3 ${isManualRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Header / Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 dark:bg-black border border-slate-800 rounded-[2rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -end-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-blue-50 border border-white/20">
              <SparkleIcon /> המרחב האישי שלך ב-PandaPrompt
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              הפרומפטים שלך, <br />
              <span className="text-blue-100">מסודרים וחכמים.</span>
            </h1>
            <p className="text-blue-50 text-lg leading-relaxed opacity-90">
              נהל, סווג, וצור פרומפטים מנצחים בלחיצת כפתור. הפנדה תדאג לשאר!
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button onClick={onCreatePrompt} className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                <Plus className="w-5 h-5" /> צור פרומפט חדש
              </button>
              <button onClick={() => onNavigateToLibrary()} className="w-full sm:w-auto bg-blue-700/50 hover:bg-blue-700/70 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all">
                <Search className="w-5 h-5" /> חיפוש בספריה
              </button>
            </div>
          </div>
          <div className="hidden md:flex shrink-0 relative">
             <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
             <Bot className="relative z-10 w-48 h-48 lg:w-64 lg:h-64 text-blue-400 opacity-20 drop-shadow-2xl" />
          </div>
        </div>
      </motion.div>

      
      {/* Quick Access Bar */}
      {recentPrompts.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 whitespace-nowrap">גישה מהירה:</span>
          {recentPrompts.map(p => (
            <button 
              key={p.id}
              onClick={() => onSelectPrompt(p.id)}
              className="shrink-0 flex items-center gap-2 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 px-4 py-2 rounded-full text-sm font-medium hover:border-blue-500/50 hover:text-blue-600 transition-colors shadow-sm"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="max-w-[120px] truncate text-slate-700 dark:text-slate-300">{p.title}</span>
            </button>
          ))}
        </div>
      )}

      
      
      {/* Daily Prompt Usage Goal Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl shrink-0 ${isGoalCompleted ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">יעד שימוש יומי בפרומפטים</h3>
                {isGoalCompleted && (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> היעד הושלם!
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isGoalCompleted 
                  ? '🎉 מעולה! השגת את יעד הפרומפטים היומי שהצבת לעצמך היום.' 
                  : `השתמשת ב-${promptsUsedToday} מתוך ${dailyGoal} פרומפטים היום (נותרו עוד ${Math.max(0, dailyGoal - promptsUsedToday)})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="text-start md:text-end">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{promptsUsedToday}</span>
              <span className="text-sm font-bold text-slate-400 mx-1">/</span>
              <span className="text-sm font-bold text-slate-500">{dailyGoal} פרומפטים</span>
            </div>
            <button
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-slate-200 dark:border-white/10"
              title="ערוך יעד יומי"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Goal Editing Inline Form */}
        {isEditingGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">בחר יעד מהיר:</span>
              {[3, 5, 8, 10, 15, 20].map(val => (
                <button
                  key={val}
                  onClick={() => handleUpdateGoal(val)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    dailyGoal === val
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-blue-400'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">או הזן מספר:</span>
              <input
                type="number"
                min="1"
                max="100"
                value={customGoalInput}
                onChange={(e) => setCustomGoalInput(e.target.value)}
                className="w-16 px-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-center font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleUpdateGoal(parseInt(customGoalInput, 10) || 5)}
                className="px-3 py-1 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                שמור
              </button>
              <button
                onClick={() => setIsEditingGoal(false)}
                className="px-2.5 py-1 text-xs font-medium rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
              >
                ביטול
              </button>
            </div>
          </motion.div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-3.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalProgressPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full relative transition-colors ${
                isGoalCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-sm shadow-indigo-500/20'
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>0 פרומפטים</span>
            <span className="font-bold text-slate-600 dark:text-slate-300">{goalProgressPct}% הושלם להיום</span>
            <span>יעד: {dailyGoal}</span>
          </div>
        </div>
      </motion.div>

      {/* Productivity Dashboard */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-900/30 p-6 rounded-3xl mb-8 mt-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" /> דשבורד פרודוקטיביות ו-ROI
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">שימושים השבוע</div>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {prompts.filter(p => p.lastUsedAt && (new Date().getTime() - new Date(p.lastUsedAt).getTime()) / (1000 * 3600 * 24) <= 7).length}
            </div>
            <div className="text-xs text-slate-400 mt-1">פרומפטים פעילים</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">הכי פופולרי</div>
            <div className="space-y-2">
              {prompts.filter(p => (p.useCount || 0) > 0).sort((a,b) => (b.useCount || 0) - (a.useCount || 0)).slice(0, 2).map(p => (
                <button key={p.id} onClick={() => onSelectPrompt(p.id)} className="w-full text-right text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 truncate transition-colors">
                  • {p.title} <span className="text-xs text-slate-400">({p.useCount})</span>
                </button>
              ))}
              {prompts.filter(p => (p.useCount || 0) > 0).length === 0 && <div className="text-sm text-slate-400">אין נתונים עדיין</div>}
            </div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">חיסכון משוער (ROI)</div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ₪{Math.round(totalUses * 10 / 60 * 150)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              עלות Tokens: ~₪{(totalUses * 1500 / 1000000 * 0.3).toFixed(2)}
            </div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">משימות קרובות (תאריך יעד)</div>
            <div className="space-y-2">
              {prompts.filter(p => p.dueDate && new Date(p.dueDate).getTime() >= new Date().getTime()).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 2).map(p => (
                <button key={p.id} onClick={() => onSelectPrompt(p.id)} className="w-full text-right text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-rose-600 truncate transition-colors flex justify-between items-center">
                  <span className="truncate ml-2">• {p.title}</span>
                  <span className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">{new Date(p.dueDate).toLocaleDateString('he-IL')}</span>
                </button>
              ))}
              {prompts.filter(p => p.dueDate && new Date(p.dueDate).getTime() >= new Date().getTime()).length === 0 && <div className="text-sm text-slate-400">אין משימות קרובות</div>}
            </div>
          </div>
        </div>
      </div>



      {/* Platform Usage Bar Chart */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-3xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-500" /> שימוש לפי פלטפורמות AI (Top 5)
        </h3>
        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip 
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" name="שימושים" fill="#6366f1" radius={[4, 4, 0, 0]} isAnimationActive={!powerSaveMode} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      
      {/* Usage Heatmap */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-3xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500" /> מפת חום - פעילות לאורך השבוע
        </h3>
        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="hour" name="שעה" unit=":00" domain={[0, 23]} tickCount={24} tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis type="number" dataKey="day" name="יום" domain={[0, 6]} tickCount={7} tickFormatter={(val) => ['א','ב','ג','ד','ה','ו','ש'][val]} tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
              <ZAxis type="number" dataKey="value" range={[20, 400]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(value: number, name: string, props: any) => {
                  return [`${value} שימושים`, `יום ${['א','ב','ג','ד','ה','ו','ש'][props.payload.day]} שעה ${props.payload.hour}:00`];
                }}
              />
              <Scatter data={heatmapData} fill="#f43f5e" shape="circle" isAnimationActive={!powerSaveMode} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mini Stats */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          
          { label: 'סה״כ פרומפטים', value: prompts.length, icon: Terminal, colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'סך שימושים', value: totalUses, icon: Activity, colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'מועדפים', value: favoritePrompts.length, icon: Heart, colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' },
          { label: 'זמן שנחסך', value: timeSaved, icon: Zap, colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 p-6 rounded-3xl flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.colorClass} shadow-inner`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        
        {/* Recent Prompts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              בשימוש לאחרונה
            </h2>
            <button onClick={() => onNavigateToLibrary()} className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
              הצג הכל <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
          
          {recentPrompts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentPrompts.map(p => <PromptCard key={p.id} prompt={p} />)}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-20 h-20 mb-4 relative drop-shadow-md">
                <Bot className="w-full h-full text-blue-500 opacity-20" />
              </div>
              <p className="text-slate-500 font-medium">אין עדיין פרומפטים.<br/> צור את הפרומפט הראשון שלך!</p>
            </div>
          )}
        </div>

        {/* Favorite Prompts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              מועדפים
            </h2>
          </div>
          
          {favoritePrompts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoritePrompts.map(p => <PromptCard key={p.id} prompt={p} />)}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-20 h-20 mb-4 relative drop-shadow-md">
                <Bot className="w-full h-full text-blue-500 opacity-20" />
              </div>
              <p className="text-slate-500 font-medium">עדיין לא סימנת פרומפטים כמועדפים.</p>
            </div>
          )}
        </div>

      </div>

      {/* Personalized AI Recommendations based on favorites & usage */}
      <RecommendationsSection
        prompts={prompts}
        onSelectPrompt={onSelectPrompt}
        title="פרומפטים מומלצים במיוחד עבורך"
        variant="dashboard"
      />

      {/* Visual Tag Cloud Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>ענן תגיות ונושאים (Tag Cloud)</span>
                {tagStats.tags.length > 0 && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/50">
                    {tagStats.tags.length} תגיות ייחודיות
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                גודל הגופן מייצג את פופולריות התגית — לחץ על כל תגית לסינון מיידי בספרייה
              </p>
            </div>
          </div>

          <button 
            onClick={() => onNavigateToLibrary()} 
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 self-start sm:self-auto transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
          >
            כל התגיות בספרייה <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {tagStats.tags.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 py-4 px-2 min-h-[140px] bg-slate-50/60 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
            {tagStats.tags.map((t) => {
              // Calculate dynamic font size and intensity based on frequency
              const ratio = tagStats.max === tagStats.min 
                ? 0.5 
                : (t.count - tagStats.min) / (tagStats.max - tagStats.min);
              
              // Scale from 12px to 25px
              const fontSize = Math.round(12 + ratio * 13);
              const isTop = ratio >= 0.75;
              const isMid = ratio >= 0.4 && ratio < 0.75;

              return (
                <motion.button
                  key={t.name}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (onSelectTag) {
                      onSelectTag(t.name);
                    } else {
                      onNavigateToLibrary();
                    }
                  }}
                  style={{ fontSize: `${fontSize}px` }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-2xs cursor-pointer ${
                    isTop
                      ? 'bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-300/60 dark:border-indigo-700/60 shadow-sm'
                      : isMid
                      ? 'bg-blue-50/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40'
                      : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-white/10 hover:border-indigo-300'
                  }`}
                  title={`${t.count} פרומפטים (${Math.round((t.count / (tagStats.totalCount || 1)) * 100)}% מסך התגיות) - לחץ לסינון`}
                >
                  <Hash className="w-3 h-3 opacity-60 shrink-0" />
                  <span>{t.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 opacity-80 shrink-0">
                    {t.count}
                  </span>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            <Tag className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              עדיין לא הוגדרו תגיות לפרומפטים
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              הוסף תגיות כמו #פיתוח, #שיווק, #תמונות לעריכת הפרומפטים כדי לצפות בהן כאן
            </p>
          </div>
        )}
      </motion.div>

    </div>
  );
};

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18" />
    <path d="M3 12h18" />
    <path d="M18.364 5.636l-12.728 12.728" />
    <path d="M5.636 5.636l12.728 12.728" />
  </svg>
);
