import React, { useState } from 'react';
import { Gauge, Info, CheckCircle2, AlertCircle, X, Sparkles, Sliders } from 'lucide-react';
import { calculatePromptComplexity, ComplexityBreakdown } from '../utils/complexityScore';

interface Props {
  content: string;
  title?: string;
  variant?: 'compact' | 'badge' | 'full';
  className?: string;
}

export const ComplexityScoreBadge: React.FC<Props> = ({ content, title, variant = 'badge', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const data: ComplexityBreakdown = calculatePromptComplexity(content, title);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'from-purple-500 to-indigo-600 text-purple-600';
    if (score >= 6) return 'from-blue-500 to-cyan-500 text-blue-600';
    if (score >= 4) return 'from-amber-500 to-orange-500 text-amber-600';
    return 'from-emerald-500 to-teal-500 text-emerald-600';
  };

  if (variant === 'compact') {
    return (
      <div 
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border cursor-pointer hover:opacity-90 transition-all ${data.color.bg} ${data.color.text} ${data.color.border} ${className}`}
        title={`ציון מורכבות: ${data.score}/10 (${data.label}). לחץ לפירוט מלא.`}
      >
        <Gauge className="w-3 h-3 shrink-0" />
        <span>מורכבות {data.score}/10</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all hover:scale-[1.02] shadow-2xs cursor-pointer ${data.color.bg} ${data.color.text} ${data.color.border} ${className}`}
        title="ציון מורכבות הפרומפט (1-10) - לחץ לפירוט וטיפים לאופטימיזציה"
      >
        <div className="relative flex items-center justify-center">
          <Gauge className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold">{data.score}</span>
          <span className="text-[10px] opacity-75 font-normal">/ 10</span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-current opacity-40 mx-0.5" />
          <span className="hidden sm:inline font-semibold text-[11px]">{data.label}</span>
        </div>
        <Info className="w-3 h-3 opacity-60 hover:opacity-100" />
      </button>

      {/* Modal Breakdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#141414] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-md overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    מדד מורכבות הפרומפט
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ניתוח מבנה, משתנים, ואוריינטציית מודל AI
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Big Score Card */}
              <div className={`p-4 rounded-2xl border ${data.color.bg} ${data.color.border} flex items-center justify-between`}>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">רמת מורכבות כוללת</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{data.label}</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {data.metrics.wordCount} מילים • {data.metrics.variablesCount} משתנים דינמיים
                  </div>
                </div>
                <div className="text-center px-4 py-2 bg-white dark:bg-black/30 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-xs">
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{data.score}</span>
                  <span className="text-xs text-slate-400 font-bold">/10</span>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="space-y-3 bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  <span>פירוט מדדי הציון:</span>
                </div>

                {/* Length & Context */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">אורך ועומק הקשר ({data.metrics.wordCount} מילים)</span>
                    <span className="font-bold text-slate-900 dark:text-white">{data.metrics.lengthScore}/10</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(data.metrics.lengthScore / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Dynamic Variables */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">משתנים ותבניתיות ({data.metrics.variablesCount} משתנים)</span>
                    <span className="font-bold text-slate-900 dark:text-white">{data.metrics.variablesScore}/10</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(data.metrics.variablesScore / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Structure & Constraints */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300">עומק מבני והנחיות ביצוע</span>
                    <span className="font-bold text-slate-900 dark:text-white">{data.metrics.structureScore}/10</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(data.metrics.structureScore / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Detected Structural Features */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">מאפיינים שזוהו בפרומפט:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded-xl border flex items-center gap-2 ${data.features.hasRole ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${data.features.hasRole ? 'text-emerald-500' : 'opacity-40'}`} />
                    <span>הגדרת פרסונה / תפקיד</span>
                  </div>
                  <div className={`p-2 rounded-xl border flex items-center gap-2 ${data.features.hasVariables ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${data.features.hasVariables ? 'text-emerald-500' : 'opacity-40'}`} />
                    <span>משתנים דינמיים</span>
                  </div>
                  <div className={`p-2 rounded-xl border flex items-center gap-2 ${data.features.hasOutputFormat ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${data.features.hasOutputFormat ? 'text-emerald-500' : 'opacity-40'}`} />
                    <span>אילוצי פורמט / פלט</span>
                  </div>
                  <div className={`p-2 rounded-xl border flex items-center gap-2 ${data.features.hasDelimitersOrCode ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${data.features.hasDelimitersOrCode ? 'text-emerald-500' : 'opacity-40'}`} />
                    <span>תוחמים מובלטים (``` / """)</span>
                  </div>
                </div>
              </div>

              {/* Optimization suggestions */}
              <div className="space-y-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>המלצות לשיפור והגעה ל-10/10:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-indigo-800 dark:text-indigo-300/90 list-disc list-inside">
                  {data.suggestions.map((s, idx) => (
                    <li key={idx} className="leading-relaxed">{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#111] flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                הבנתי, תודה!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
