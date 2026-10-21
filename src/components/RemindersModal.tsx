import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Bell, Clock, Calendar, AlertTriangle, Check, Trash2, Zap, ArrowRight, CheckCircle2,
  ExternalLink, RotateCcw, Volume2, ShieldCheck, BellRing, Sparkles
} from 'lucide-react';
import { Prompt, PromptReminder } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  onSelectPrompt: (promptId: string) => void;
  onSaveReminder: (promptId: string, reminder: PromptReminder | null) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const RemindersModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prompts,
  onSelectPrompt,
  onSaveReminder,
  onShowToast
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'overdue' | 'today' | 'upcoming' | 'completed'>('all');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  if (!isOpen) return null;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Collect all prompts that have a reminder
  const promptsWithReminders = prompts.filter(p => p.reminder && p.reminder.dateTime);

  const enrichedReminders = promptsWithReminders.map(p => {
    const rem = p.reminder!;
    const remDate = new Date(rem.dateTime);
    const diffHours = (remDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isOverdue = !rem.isCompleted && remDate < now;
    const isToday = !rem.isCompleted && (rem.dateTime.startsWith(todayStr) || (diffHours >= 0 && diffHours <= 24));
    const isUpcoming = !rem.isCompleted && remDate > now && !rem.dateTime.startsWith(todayStr) && diffHours > 24;
    
    return {
      prompt: p,
      reminder: rem,
      remDate,
      isOverdue,
      isToday,
      isUpcoming,
      isCompleted: !!rem.isCompleted
    };
  });

  const overdueCount = enrichedReminders.filter(r => r.isOverdue).length;
  const todayCount = enrichedReminders.filter(r => r.isToday).length;
  const upcomingCount = enrichedReminders.filter(r => r.isUpcoming).length;
  const completedCount = enrichedReminders.filter(r => r.isCompleted).length;

  const filteredReminders = enrichedReminders.filter(r => {
    if (filterTab === 'overdue') return r.isOverdue;
    if (filterTab === 'today') return r.isToday;
    if (filterTab === 'upcoming') return r.isUpcoming;
    if (filterTab === 'completed') return r.isCompleted;
    return true;
  }).sort((a, b) => {
    // Sort: incomplete first, overdue first, then by date ascending
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    return a.remDate.getTime() - b.remDate.getTime();
  });

  const requestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        onShowToast('התראות דפדפן הופעלו בהצלחה! תקבל התראה קולית וויזואלית כשיגיע זמן התזכורת', 'success');
      } else {
        onShowToast('התראות דפדפן נחסמו בהגדרות הדפדפן', 'info');
      }
    }
  };

  const handleToggleCompleted = (promptId: string, currentReminder: PromptReminder) => {
    const updated: PromptReminder = {
      ...currentReminder,
      isCompleted: !currentReminder.isCompleted
    };
    onSaveReminder(promptId, updated);
    onShowToast(
      updated.isCompleted ? 'התזכורת סומנה כהושלמה! ✓' : 'התזכורת הוחזרה למצב פעיל',
      'success'
    );
  };

  const handleSnooze = (promptId: string, currentReminder: PromptReminder, minutes: number) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutes);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const newDateTime = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const updated: PromptReminder = {
      ...currentReminder,
      dateTime: newDateTime,
      isCompleted: false,
      notified: false,
      snoozedUntil: newDateTime
    };
    onSaveReminder(promptId, updated);
    onShowToast(`התזכורת נדחתה ב-${minutes >= 60 ? `${minutes / 60} שעות` : `${minutes} דקות`}`, 'info');
  };

  const handleDelete = (promptId: string) => {
    onSaveReminder(promptId, null);
    onShowToast('התזכורת נמחקה', 'info');
  };

  const handleAutoSnoozeTonight = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const newDateTime = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T09:00`;

    let count = 0;
    enrichedReminders.forEach(({ prompt, reminder, isOverdue, isToday, isCompleted }) => {
      if (!isCompleted && (isOverdue || isToday)) {
        const updated: PromptReminder = {
          ...reminder,
          dateTime: newDateTime,
          isCompleted: false,
          notified: false,
          snoozedUntil: newDateTime
        };
        onSaveReminder(prompt.id, updated);
        count++;
      }
    });

    if (count > 0) {
      onShowToast(`בוצעה דחייה אוטומטית ל-${count} תזכורות למחר בבוקר (09:00) 🌙`, 'success');
    } else {
      onShowToast('אין תזכורות פעילות להיום או באיחור לדחייה', 'info');
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[115] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center relative">
                <BellRing className="w-5 h-5" />
                {overdueCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">מרכז תזכורות ומשימות</h3>
                  {overdueCount > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                      {overdueCount} דחופים באיחור!
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">ניהול התראות ומשימות עבודה לפי תאריך ושעה לפרומפטים שלך</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Browser Notification Banner if not granted */}
          {notifPermission !== 'granted' && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/40 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600 shrink-0" />
                <span>הפעל התראות דפדפן כדי לקבל הודעה קופצת וצליל גם כשהכרטיסייה ברקע.</span>
              </div>
              <button
                type="button"
                onClick={requestPermission}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 transition-colors shadow-2xs"
              >
                הפעל עכשיו
              </button>
            </div>
          )}

          {/* Filter Tabs & Auto-snooze */}
          <div className="p-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex items-center justify-between gap-2 shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'all'
                    ? 'bg-white dark:bg-[#202020] text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                הכל ({enrichedReminders.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('overdue')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterTab === 'overdue'
                    ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <span>באיחור</span>
                {overdueCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                    {overdueCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('today')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'today'
                    ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                היום ({todayCount})
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('upcoming')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'upcoming'
                    ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                בקרוב ({upcomingCount})
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterTab === 'completed'
                    ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                הושלמו ({completedCount})
              </button>
            </div>

            <button
              type="button"
              onClick={handleAutoSnoozeTonight}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
              title="דחה אוטומטית את כל התזכורות להיום ולחוב למחר בבוקר"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>דחייה אוטומטית לכל התזכורות הלילה</span>
            </button>
          </div>

          {/* List of Reminders */}
          <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
            {filteredReminders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
                <Bell className="w-10 h-10 mx-auto opacity-30 text-indigo-500" />
                <p className="text-sm font-bold">אין תזכורות תואמות כרגע</p>
                <p className="text-xs">ניתן להוסיף תזכורת לכל פרומפט ישירות מכרטיס הפרומפט או מעורך הפרומפטים.</p>
              </div>
            ) : (
              filteredReminders.map(({ prompt, reminder, remDate, isOverdue, isToday, isCompleted }) => {
                const isUrgent = reminder.priority === 'urgent';
                const isHigh = reminder.priority === 'high';

                return (
                  <div
                    key={prompt.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/60 dark:border-white/5 opacity-60'
                        : isOverdue
                          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 shadow-xs'
                          : isToday
                            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 shadow-xs'
                            : 'bg-white dark:bg-[#1a1a1a] border-slate-200/80 dark:border-white/5 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Completion Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleCompleted(prompt.id, reminder)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                        }`}
                        title={isCompleted ? 'סמן כלא הושלם' : 'סמן כהושלם'}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 
                            onClick={() => {
                              onSelectPrompt(prompt.id);
                              onClose();
                            }}
                            className={`font-black text-sm text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer truncate max-w-sm ${
                              isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                            }`}
                          >
                            {prompt.title}
                          </h4>

                          {/* Priority badge */}
                          {isUrgent && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5" /> דחוף!
                            </span>
                          )}
                          {isHigh && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                              עדיפות גבוהה
                            </span>
                          )}

                          {/* Status Tag */}
                          {isOverdue && !isCompleted && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-200 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                              עבר הזמן ⚠️
                            </span>
                          )}
                          {isToday && !isCompleted && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                              היום ⏰
                            </span>
                          )}
                        </div>

                        {/* Date and Time */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {remDate.toLocaleDateString('he-IL')} בשעה {remDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {prompt.platform && (
                            <span className="text-[11px] opacity-75">· {prompt.platform}</span>
                          )}
                        </div>

                        {/* Note */}
                        {reminder.note && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-black/20 p-1.5 rounded-lg border border-slate-200/50 dark:border-white/5 mt-1.5 leading-relaxed">
                            💡 {reminder.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* Go to prompt button */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPrompt(prompt.id);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold transition-colors flex items-center gap-1"
                        title="צפה בפרומפט"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>פתח</span>
                      </button>

                      {/* Quick Snooze */}
                      {!isCompleted && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSnooze(prompt.id, reminder, 60)}
                            className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-medium transition-colors"
                            title="דחה בשעה אחת"
                          >
                            +שעה
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSnooze(prompt.id, reminder, 1440)}
                            className="px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-medium transition-colors"
                            title="דחה ביום אחד"
                          >
                            +יום
                          </button>
                        </div>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(prompt.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="מחק תזכורת"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#161616]/50 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-400 font-medium">
              💡 טיפ: התראות קופצות וצליל עדין יופעלו אוטומטית כשיגיע מועד התזכורת.
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-white transition-colors"
            >
              סגור
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
