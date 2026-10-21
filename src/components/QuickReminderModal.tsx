import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Bell, Clock, Calendar, AlertTriangle, Check, Trash2, Zap, ArrowRight 
} from 'lucide-react';
import { Prompt, PromptReminder } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onSaveReminder: (promptId: string, reminder: PromptReminder | null) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const QuickReminderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prompt,
  onSaveReminder,
  onShowToast
}) => {
  const [dateTime, setDateTime] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (prompt?.reminder) {
      setDateTime(prompt.reminder.dateTime || '');
      setPriority(prompt.reminder.priority || 'normal');
      setNote(prompt.reminder.note || '');
    } else {
      // Default to tomorrow 09:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setDateTime(formatDateTimeLocal(tomorrow));
      setPriority('normal');
      setNote('');
    }
  }, [prompt, isOpen]);

  if (!isOpen || !prompt) return null;

  function formatDateTimeLocal(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  const applyPreset = (preset: '2h' | 'tomorrow' | '3d' | 'nextWeek') => {
    const now = new Date();
    if (preset === '2h') {
      now.setHours(now.getHours() + 2);
    } else if (preset === 'tomorrow') {
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0);
    } else if (preset === '3d') {
      now.setDate(now.getDate() + 3);
      now.setHours(9, 0, 0, 0);
    } else if (preset === 'nextWeek') {
      // Next Sunday or next Monday
      const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
      now.setDate(now.getDate() + daysUntilSunday);
      now.setHours(9, 0, 0, 0);
    }
    setDateTime(formatDateTimeLocal(now));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateTime) {
      onShowToast('אנא בחר תאריך ושעה לתזכורת', 'error');
      return;
    }

    const reminder: PromptReminder = {
      id: prompt.reminder?.id || `rem-${Date.now()}`,
      dateTime,
      priority,
      note: note.trim(),
      isCompleted: false,
      notified: false
    };

    onSaveReminder(prompt.id, reminder);
    onShowToast(`תזכורת נקבעה בהצלחה ל-${new Date(dateTime).toLocaleString('he-IL')}`, 'success');

    // Request notification permission if not yet requested
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    onClose();
  };

  const handleClearReminder = () => {
    onSaveReminder(prompt.id, null);
    onShowToast('התזכורת הוסרה בהצלחה', 'info');
    onClose();
  };

  const handleSnooze = (minutes: number) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutes);
    const newDateTime = formatDateTimeLocal(d);

    const reminder: PromptReminder = {
      id: prompt.reminder?.id || `rem-${Date.now()}`,
      dateTime: newDateTime,
      priority: prompt.reminder?.priority || priority,
      note: prompt.reminder?.note || note,
      isCompleted: false,
      notified: false,
      snoozedUntil: newDateTime
    };

    onSaveReminder(prompt.id, reminder);
    onShowToast(`התזכורת נדחתה ב-${minutes >= 60 ? `${minutes / 60} שעות` : `${minutes} דקות`}`, 'success');
    onClose();
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
          className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">הגדרת תזכורת לפרומפט</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs">{prompt.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-5 space-y-4">
            {/* Quick Presets */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                קיצורי זמנים מהירים
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset('2h')}
                  className="py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors border border-transparent hover:border-indigo-200 text-center"
                >
                  בעוד שעתיים
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('tomorrow')}
                  className="py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors border border-transparent hover:border-indigo-200 text-center"
                >
                  מחר ב-09:00
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('3d')}
                  className="py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors border border-transparent hover:border-indigo-200 text-center"
                >
                  בעוד 3 ימים
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('nextWeek')}
                  className="py-1.5 px-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors border border-transparent hover:border-indigo-200 text-center"
                >
                  שבוע הבא
                </button>
              </div>
            </div>

            {/* Exact Date & Time */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                תאריך ושעה מדויקים
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={e => setDateTime(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                רמת דחיפות (Priority)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                    priority === 'normal'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 shadow-2xs'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>רגיל</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                    priority === 'high'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 shadow-2xs'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>גבוה</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPriority('urgent')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                    priority === 'urgent'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700 shadow-2xs'
                      : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>דחוף ⚡</span>
                </button>
              </div>
            </div>

            {/* Note / Task Instructions */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                הערת משימה או הנחיות (אופציונלי)
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="למשל: להריץ מול קובץ הלקוח, לוודא משתני מפתח, לשלוח לאישור מנהל..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>

            {/* Snooze options if reminder exists and is due */}
            {prompt.reminder && (
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>דחיית תזכורת (נודניק):</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSnooze(15)}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-indigo-50 transition-colors shadow-2xs text-[11px]"
                  >
                    +15 דק'
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnooze(60)}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-indigo-50 transition-colors shadow-2xs text-[11px]"
                  >
                    +שעה
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSnooze(1440)}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold hover:bg-indigo-50 transition-colors shadow-2xs text-[11px]"
                  >
                    +יום
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-white/5">
              {prompt.reminder ? (
                <button
                  type="button"
                  onClick={handleClearReminder}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>הסר תזכורת</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>שמור תזכורת</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
