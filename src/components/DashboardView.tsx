import React, { useMemo } from 'react';
import { Prompt, Folder, PlatformConfig } from '../types';
import { Plus, Clock, Heart, ArrowLeft, Terminal, TrendingUp, Star, Zap, Search, Activity, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  prompts: Prompt[];
  folders: Folder[];
  platforms: Record<string, PlatformConfig>;
  onSelectPrompt: (id: string) => void;
  onCreatePrompt: () => void;
  onNavigateToLibrary: () => void;
}

export const DashboardView: React.FC<Props> = ({ prompts, folders, platforms, onSelectPrompt, onCreatePrompt, onNavigateToLibrary }) => {
  
  const recentPrompts = useMemo(() => {
    return [...prompts]
      .sort((a, b) => new Date(b.lastUsedAt || b.updatedAt).getTime() - new Date(a.lastUsedAt || a.updatedAt).getTime())
      .slice(0, 5);
  }, [prompts]);

  const favoritePrompts = useMemo(() => {
    return prompts.filter(p => p.favorite).slice(0, 5);
  }, [prompts]);

  const totalUses = useMemo(() => {
    return prompts.reduce((sum, p) => sum + (p.useCount || 0), 0);
  }, [prompts]);

  const timeSaved = useMemo(() => {
    // Assuming each prompt saves about 10 minutes of work on average
    const minutes = totalUses * 10;
    if (minutes > 60) {
      return `${Math.floor(minutes / 60)} שעות`;
    }
    return `${minutes} דקות`;
  }, [totalUses]);

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
    <div className="max-w-6xl mx-auto space-y-12 pb-12" dir="rtl">
      
      {/* Header / Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 rounded-[2rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -end-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-blue-50 border border-white/20">
              <SparkleIcon /> המרחב האישי שלך
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              הפרומפטים שלך, <br />
              <span className="text-blue-100">מסודרים וחכמים.</span>
            </h1>
            <p className="text-blue-50 text-lg leading-relaxed opacity-90">
              נהל, סווג, וצור פרומפטים מנצחים בלחיצת כפתור עם כוחה של בינה מלאכותית.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <button onClick={onCreatePrompt} className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              <Plus className="w-5 h-5" /> צור פרומפט חדש
            </button>
            <button onClick={onNavigateToLibrary} className="w-full sm:w-auto bg-blue-700/50 hover:bg-blue-700/70 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all">
              <Search className="w-5 h-5" /> חיפוש בספריה
            </button>
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
            <button onClick={onNavigateToLibrary} className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
              הצג הכל <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
          
          {recentPrompts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentPrompts.map(p => <PromptCard key={p.id} prompt={p} />)}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[200px]">
              <div className="w-16 h-16 bg-white dark:bg-[#111] rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-sm mb-4">
                <Terminal className="w-8 h-8" />
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
              <div className="w-16 h-16 bg-white dark:bg-[#111] rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-sm mb-4">
                <Star className="w-8 h-8" />
              </div>
              <p className="text-slate-500 font-medium">עדיין לא סימנת פרומפטים כמועדפים.</p>
            </div>
          )}
        </div>

      </div>

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
