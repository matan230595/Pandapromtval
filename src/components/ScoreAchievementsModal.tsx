import React, { useState, useEffect } from 'react';
import { 
  Trophy, Award, Star, CheckCircle, Clock, Zap, Flame, Crown, 
  X, Sparkles, ChevronRight, Gift, BarChart2, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ScoreState, Achievement, Challenge, getScoreState, 
  getFullAchievements, getActiveChallenges, claimChallengeReward 
} from '../utils/scoreSystem';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ScoreAchievementsModal: React.FC<Props> = ({ isOpen, onClose, onShowToast }) => {
  const [scoreState, setScoreState] = useState<ScoreState>(getScoreState());
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges' | 'history'>('overview');

  useEffect(() => {
    if (isOpen) {
      setScoreState(getScoreState());
    }

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setScoreState(e.detail);
      } else {
        setScoreState(getScoreState());
      }
    };

    window.addEventListener('promptvault_score_updated', handleUpdate);
    return () => window.removeEventListener('promptvault_score_updated', handleUpdate);
  }, [isOpen]);

  if (!isOpen) return null;

  const achievements = getFullAchievements(scoreState);
  const challenges = getActiveChallenges(scoreState);
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  const handleClaim = (challengeId: string) => {
    const result = claimChallengeReward(challengeId);
    if (result.success) {
      onShowToast(`בונוס של +${result.points} נקודות נאסף בהצלחה! 🎉`, 'success');
      setScoreState(getScoreState());
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Top Header with Level & Points */}
        <div className="p-6 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-amber-300 drop-shadow-md" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white/20 text-white tracking-wider">
                  רמה {scoreState.level}
                </span>
                <span className="text-xs font-medium text-white/80">
                  {scoreState.levelTitle}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">{scoreState.points.toLocaleString()}</span>
                <span className="text-sm font-bold text-white/90">נקודות מוניטין</span>
              </div>

              {/* Progress bar to next level */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-white/80 mb-1">
                  <span>התקדמות לרמה הבאה: {scoreState.levelProgress}%</span>
                  <span>יעד: {scoreState.nextLevelPoints.toLocaleString()} נק'</span>
                </div>
                <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 to-yellow-200 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${scoreState.levelProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 shrink-0">
          {[
            { id: 'overview', label: 'סקירה מהירה', icon: <BarChart2 className="w-4 h-4" /> },
            { id: 'achievements', label: `הישגים (${unlockedCount}/${achievements.length})`, icon: <Award className="w-4 h-4" /> },
            { id: 'challenges', label: 'אתגרים ומשימות', icon: <Zap className="w-4 h-4" /> },
            { id: 'history', label: 'היסטוריית צבירה', icon: <Clock className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#202020] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Quick stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">פרומפטים שנשמרו</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {scoreState.stats.promptsSaved}
                  </span>
                  <span className="text-[10px] text-indigo-500 font-bold block mt-0.5">+20 נק' לכל פרומפט</span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">מועדפים שסומנו</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {scoreState.stats.promptsFavorited}
                  </span>
                  <span className="text-[10px] text-amber-500 font-bold block mt-0.5">+15 נק' לכל מועדף</span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">הישגים שנפתחו</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {unlockedCount} / {achievements.length}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold block mt-0.5">פרסים ובונוסים</span>
                </div>
              </div>

              {/* How to earn points info */}
              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/40 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>איך צוברים נקודות ומעלים רמה?</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>שמירת פרומפט בעל ערך: <strong>+20 נק'</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>סימון פרומפט כמועדף: <strong>+15 נק'</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>ייצוא כרטיס תמונה (html2canvas): <strong>+25 נק'</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>הקראה קולית (Read Aloud): <strong>+15 נק'</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>פרסום פרומפט לקהילה: <strong>+50 נק'</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>עמידה ביעדי אבני דרך (Milestones): <strong>עד +1,000 נק'</strong></span>
                  </div>
                </div>
              </div>

              {/* Active Challenges preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>אתגרים פעילים</span>
                  </h4>
                  <button onClick={() => setActiveTab('challenges')} className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                    לכל האתגרים ←
                  </button>
                </div>
                <div className="space-y-2">
                  {challenges.slice(0, 2).map(c => (
                    <div key={c.id} className="p-3 bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">{c.title}</div>
                        <div className="text-[11px] text-slate-500">{c.description}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">התקדמות: {c.progress} / {c.target}</div>
                      </div>
                      <div>
                        {c.isClaimed ? (
                          <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> נאסף
                          </span>
                        ) : c.isCompleted ? (
                          <button
                            onClick={() => handleClaim(c.id)}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                          >
                            <Gift className="w-3.5 h-3.5" /> אסוף +{c.points}
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg">
                            +{c.points} נק'
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                <span>ציון דרך והישגים</span>
                <span>{unlockedCount} מתוך {achievements.length} נפתחו</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map(ach => {
                  const progressPct = Math.round((ach.current / ach.target) * 100);
                  return (
                    <div
                      key={ach.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        ach.isUnlocked
                          ? 'bg-gradient-to-br from-white to-amber-50/40 dark:from-[#181818] dark:to-amber-950/20 border-amber-300 dark:border-amber-800/40 shadow-xs'
                          : 'bg-slate-50/80 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          ach.isUnlocked
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-400'
                        }`}>
                          {ach.isUnlocked ? <Crown className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                              {ach.title}
                            </h4>
                            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                              +{ach.points} נק'
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {ach.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar for Locked */}
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>{ach.isUnlocked ? 'הושלם! 🎉' : `התקדמות: ${ach.current} / ${ach.target}`}</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${ach.isUnlocked ? 'bg-amber-500' : 'bg-indigo-500'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                <span>אתגרים פעילים לקבלת בונוסים</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">מתעדכן באופן שוטף</span>
              </div>

              <div className="space-y-3">
                {challenges.map(c => (
                  <div
                    key={c.id}
                    className="p-4 bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.title}</h4>
                        {c.expiresIn && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                            תפוגה: {c.expiresIn}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.description}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-36 h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.round((c.progress / c.target) * 100))}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {c.progress} / {c.target}
                        </span>
                      </div>
                    </div>

                    <div className="self-end sm:self-center">
                      {c.isClaimed ? (
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl">
                          <CheckCircle className="w-4 h-4" /> הפרס נאסף!
                        </span>
                      ) : c.isCompleted ? (
                        <button
                          onClick={() => handleClaim(c.id)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 animate-pulse"
                        >
                          <Gift className="w-4 h-4" /> אסוף פרס (+{c.points} נק')
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-200/50">
                          פרס: +{c.points} נק'
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 px-1">
                יומן פעילות צבירת נקודות
              </div>

              {scoreState.recentActivity && scoreState.recentActivity.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#181818] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                  {scoreState.recentActivity.map(act => (
                    <div key={act.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{act.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatDistanceToNow(new Date(act.timestamp), { addSuffix: true, locale: he })}
                        </div>
                      </div>
                      <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                        +{act.points} נק'
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-white/5 rounded-2xl">
                  אין עדיין פעילויות. שמור או דרג פרומפטים כדי לצבור נקודות ראשונות!
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#161616] border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            הניקוד וההישגים נשמרים אוטומטית בכל פעולה.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors"
          >
            סגור
          </button>
        </div>
      </motion.div>
    </div>
  );
};
