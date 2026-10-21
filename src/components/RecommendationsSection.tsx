import React, { useMemo } from 'react';
import { Sparkles, Zap, Play } from 'lucide-react';
import { Prompt } from '../types';
import { getPersonalizedRecommendations } from '../utils/recommendations';

interface Props {
  prompts: Prompt[];
  currentPromptId?: string;
  onSelectPrompt: (promptId: string) => void;
  onQuickTest?: (prompt: Prompt) => void;
  title?: string;
  variant?: 'detail-footer' | 'dashboard' | 'sidebar';
}

export const RecommendationsSection: React.FC<Props> = ({
  prompts,
  currentPromptId,
  onSelectPrompt,
  onQuickTest,
  title = 'המלצות מותאמות אישית עבורך',
  variant = 'detail-footer',
}) => {
  const recommendations = useMemo(() => {
    return getPersonalizedRecommendations(prompts, currentPromptId, 4);
  }, [prompts, currentPromptId]);

  if (recommendations.length === 0) return null;

  return (
    <div className={variant === 'dashboard' ? 'bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4' : variant === 'detail-footer' ? 'mt-10 pt-8 border-t border-slate-200 dark:border-white/10 space-y-4' : 'space-y-4'}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold">
                מנוע המלצות חכם
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              מבוסס על מועדפים, שימוש תדיר ותחומי עניין
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {recommendations.map(({ prompt, score, reason }) => {
          return (
            <div
              key={prompt.id}
              onClick={() => onSelectPrompt(prompt.id)}
              className="group p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-[#161616] hover:border-purple-300 dark:hover:border-purple-800/50 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between gap-3 text-right"
            >
              <div className="space-y-2">
                {/* Match Score */}
                <div className="flex items-center justify-between gap-1 text-[11px]">
                  <span className="font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-purple-500" />
                    <span>{score}% התאמה</span>
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-1 transition-colors">
                  {prompt.title}
                </h4>

                {/* Snippet */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {prompt.description || prompt.content}
                </p>
              </div>

              {/* Recommendation Reason & Quick Action */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate" title={reason}>
                  {reason}
                </span>

                {onQuickTest && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickTest(prompt);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors shrink-0"
                    title="בדוק ב-Sandbox"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
