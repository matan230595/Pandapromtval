import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, Settings, Keyboard, Moon, Sun, Monitor, Database, Download, FolderUp, 
  RotateCcw, Sparkles, Check, AlertCircle, Search, Command, CheckCircle2, Sliders, Laptop, Leaf, Battery
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BatteryStatus } from '../hooks/useBatteryStatus';
import { 
  DEFAULT_SHORTCUTS, 
  ShortcutBinding, 
  ShortcutDefinition, 
  formatShortcutKeys, 
  saveCustomShortcuts, 
  resetCustomShortcuts 
} from '../utils/customShortcuts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appLanguage: 'he' | 'en';
  setAppLanguage: (lang: 'he' | 'en') => void;
  themeMode: 'light' | 'dark' | 'system' | 'scheduled';
  setThemeMode: (mode: any) => void;
  isCurrentlyDark: boolean;
  handleForceToggleTheme: () => void;
  promptsCount: number;
  foldersCount: number;
  handleExportAll: () => void;
  handleImportAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customShortcuts: Record<string, ShortcutBinding>;
  onUpdateShortcuts: (shortcuts: Record<string, ShortcutBinding>) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
  initialTab?: 'general' | 'shortcuts' | 'backup';
  battery?: BatteryStatus;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  appLanguage,
  setAppLanguage,
  themeMode,
  setThemeMode,
  isCurrentlyDark,
  handleForceToggleTheme,
  promptsCount,
  foldersCount,
  handleExportAll,
  handleImportAll,
  customShortcuts,
  onUpdateShortcuts,
  showToast,
  initialTab = 'general',
  battery
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'shortcuts' | 'backup'>('general');
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [recordingModifiers, setRecordingModifiers] = useState<{ ctrl: boolean; alt: boolean; shift: boolean }>({
    ctrl: false,
    alt: false,
    shift: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const isMac = useMemo(() => typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform), []);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Key recording listener
  useEffect(() => {
    if (!recordingId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Escape cancels recording
      if (e.key === 'Escape') {
        setRecordingId(null);
        showToast(appLanguage === 'en' ? 'Recording cancelled' : 'הקלטת קיצור בוטלה', 'info');
        return;
      }

      const ctrl = e.ctrlKey || e.metaKey;
      const alt = e.altKey;
      const shift = e.shiftKey;

      setRecordingModifiers({ ctrl, alt, shift });

      // If only modifier key is pressed, wait for the actual character key
      const isModifierOnly = ['Control', 'Shift', 'Alt', 'Meta'].includes(e.key);
      if (isModifierOnly) {
        return;
      }

      // We have a valid key!
      let key = e.key.toLowerCase();
      let displayKey = e.key.toUpperCase();
      let code = e.code;

      if (e.key === 'Enter') {
        key = 'enter';
        displayKey = 'Enter';
      } else if (e.key === ' ' || e.code === 'Space') {
        key = 'space';
        displayKey = 'Space';
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        key = e.key.toLowerCase();
        displayKey = e.key;
      } else if (e.code && e.code.startsWith('Key')) {
        // Fallback for keyboard layouts (e.g. Hebrew)
        const letter = e.code.replace('Key', '');
        displayKey = letter;
      }

      const newBinding: ShortcutBinding = {
        ctrl,
        alt,
        shift,
        key,
        code,
        displayKey
      };

      // Check if this combination already belongs to another shortcut
      const conflictingId = Object.keys(customShortcuts).find(id => {
        if (id === recordingId) return false;
        const b = customShortcuts[id];
        return b && !!b.ctrl === ctrl && !!b.alt === alt && !!b.shift === shift && b.key.toLowerCase() === key;
      });

      const updated = {
        ...customShortcuts,
        [recordingId]: newBinding
      };

      onUpdateShortcuts(updated);
      saveCustomShortcuts(updated);
      setRecordingId(null);

      if (conflictingId) {
        const conflictName = DEFAULT_SHORTCUTS[conflictingId]?.name || conflictingId;
        showToast(
          appLanguage === 'en' 
            ? `Shortcut saved, but also overlaps with "${conflictName}"` 
            : `הקיצור הוגדר! שים לב שהוא זהה לפעולה "${conflictName}"`,
          'info'
        );
      } else {
        const actionName = DEFAULT_SHORTCUTS[recordingId]?.name || recordingId;
        showToast(
          appLanguage === 'en'
            ? `New shortcut assigned to "${actionName}"`
            : `קיצור המקלדת החדש ל-"${actionName}" נשמר בהצלחה!`,
          'success'
        );
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setRecordingModifiers({
        ctrl: e.ctrlKey || e.metaKey,
        alt: e.altKey,
        shift: e.shiftKey
      });
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [recordingId, customShortcuts, onUpdateShortcuts, showToast, appLanguage]);

  const handleResetSingle = (id: string) => {
    const def = DEFAULT_SHORTCUTS[id];
    if (!def) return;
    const updated = {
      ...customShortcuts,
      [id]: { ...def.defaultBinding }
    };
    onUpdateShortcuts(updated);
    saveCustomShortcuts(updated);
    showToast(appLanguage === 'en' ? 'Shortcut reset to default' : 'הקיצור אופס לברירת המחדל', 'info');
  };

  const handleResetAll = () => {
    const reset = resetCustomShortcuts();
    onUpdateShortcuts(reset);
    showToast(appLanguage === 'en' ? 'All shortcuts reset to defaults' : 'כל קיצורי המקלדת אופסו לברירת המחדל', 'success');
  };

  const filteredShortcuts = useMemo(() => {
    const list = Object.values(DEFAULT_SHORTCUTS);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(item => 
      item.name.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q) ||
      (customShortcuts[item.id] && formatShortcutKeys(customShortcuts[item.id], isMac).join(' ').toLowerCase().includes(q))
    );
  }, [searchQuery, customShortcuts, isMac]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md" 
      onClick={() => {
        if (!recordingId) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]"
        dir={appLanguage === 'en' ? 'ltr' : 'rtl'}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                {appLanguage === 'en' ? 'App Settings' : 'הגדרות מערכת ואפליקציה'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {appLanguage === 'en' 
                  ? 'Custom shortcuts, theme, interface and backup' 
                  : 'התאמת קיצורי מקלדת אישיים, שפה, ערכת נושא וגיבוי נתונים'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="סגור (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-100 dark:border-white/5 flex gap-2 bg-slate-50/40 dark:bg-[#161616]">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#121212]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{appLanguage === 'en' ? 'General' : 'כללי ושפה'}</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 relative ${
              activeTab === 'shortcuts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#121212]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>{appLanguage === 'en' ? 'Keyboard Shortcuts' : 'קיצורי מקלדת מותאמים אישית'}</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'backup'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-[#121212]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{appLanguage === 'en' ? 'Backup & Data' : 'גיבוי נתונים'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Language Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {appLanguage === 'en' ? 'Interface Language' : 'שפת ממשק'}
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => setAppLanguage('he')} 
                    className={`py-2 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      appLanguage === 'he' 
                        ? 'bg-white dark:bg-[#222] shadow-sm text-indigo-600 dark:text-indigo-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <span>עברית (RTL)</span>
                    {appLanguage === 'he' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAppLanguage('en')} 
                    className={`py-2 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                      appLanguage === 'en' 
                        ? 'bg-white dark:bg-[#222] shadow-sm text-indigo-600 dark:text-indigo-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <span>English (LTR)</span>
                    {appLanguage === 'en' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Theme Mode */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                      {appLanguage === 'en' ? 'Theme Mode' : 'ערכת נושא'}
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {appLanguage === 'en' ? 'Switch between light, dark or follow system preference' : 'מעבר מהיר בין מצב בהיר, כהה או אוטומטי לפי מערכת ההפעלה'}
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isCurrentlyDark}
                    onClick={handleForceToggleTheme}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isCurrentlyDark ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    title={isCurrentlyDark ? 'כפה מצב בהיר' : 'כפה מצב כהה'}
                  >
                    <span
                      className={`pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isCurrentlyDark ? (appLanguage === 'en' ? 'translate-x-7' : '-translate-x-7') : 'translate-x-0'
                      }`}
                    >
                      {isCurrentlyDark ? (
                        <Moon className="h-3.5 w-3.5 text-indigo-600" />
                      ) : (
                        <Sun className="h-3.5 w-3.5 text-amber-500" />
                      )}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => {
                      setThemeMode('light');
                      document.documentElement.classList.remove('dark');
                      localStorage.setItem("promptvault_theme", 'light');
                      showToast("הופעל מצב בהיר", "info");
                    }} 
                    className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      themeMode === 'light' 
                        ? 'bg-white dark:bg-[#222] shadow-sm text-amber-600 dark:text-amber-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>{appLanguage === 'en' ? 'Light' : 'בהיר'}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setThemeMode('dark');
                      document.documentElement.classList.add('dark');
                      localStorage.setItem("promptvault_theme", 'dark');
                      showToast("הופעל מצב כהה", "info");
                    }} 
                    className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      themeMode === 'dark' 
                        ? 'bg-white dark:bg-[#222] shadow-sm text-indigo-600 dark:text-indigo-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>{appLanguage === 'en' ? 'Dark' : 'כהה'}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setThemeMode('system');
                      localStorage.setItem("promptvault_theme", 'system');
                      showToast("מצב מערכת הופעל", "info");
                    }} 
                    className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      themeMode === 'system' 
                        ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>{appLanguage === 'en' ? 'Auto (System)' : 'מערכת'}</span>
                  </button>
                </div>
              </div>

              {/* Energy Saving & Battery Management Section */}
              {battery && (
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Leaf className="w-4 h-4 text-emerald-500" />
                        <span>{appLanguage === 'en' ? 'Energy Saving Mode' : 'מצב חיסכון באנרגיה'}</span>
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {appLanguage === 'en'
                          ? 'Reduces animations and pauses auto-refresh of Dashboard views to conserve battery'
                          : 'מפחית אנימציות ומשהה רענון אוטומטי של תצוגות ה-Dashboard לשמירה על חיי הסוללה'}
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={battery.powerSaveMode}
                      onClick={battery.togglePowerSaveMode}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        battery.powerSaveMode ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          battery.powerSaveMode ? (appLanguage === 'en' ? 'translate-x-7' : '-translate-x-7') : 'translate-x-0'
                        }`}
                      >
                        <Leaf className={`h-3.5 w-3.5 ${battery.powerSaveMode ? 'text-emerald-600' : 'text-slate-400'}`} />
                      </span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4 text-indigo-500" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        רמת סוללה נוכחית: <strong className="text-slate-900 dark:text-white font-mono">{battery.level}%</strong>
                        {battery.charging && ' (בטעינה ⚡)'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      מופעל אוטומטית כשהסוללה נמוכה (≤20%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: KEYBOARD SHORTCUTS CUSTOMIZATION */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              {/* Header and Reset all */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {appLanguage === 'en' ? 'Custom Keyboard Shortcuts' : 'הגדרת קיצורי מקלדת אישיים'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {appLanguage === 'en' 
                        ? 'Click any action to record a custom key combination.' 
                        : 'לחץ על "הקלט מקשים" לפעולה כלשהי, והקש על צירוף המקשים המועדף עליך.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl transition-all hover:border-red-300 shadow-2xs self-start sm:self-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{appLanguage === 'en' ? 'Reset All to Defaults' : 'אפס הכל לברירת מחדל'}</span>
                </button>
              </div>

              {/* Active Recording HUD Indicator */}
              {recordingId && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                        {appLanguage === 'en' ? 'Recording Mode Active' : 'מצב הקלטת מקשים פעיל'}
                      </div>
                      <div className="text-sm font-black">
                        {appLanguage === 'en' ? 'Press desired key combination for: ' : 'הקש על צירוף המקשים עבור: '}
                        "{DEFAULT_SHORTCUTS[recordingId]?.name || recordingId}"
                      </div>
                      <div className="text-xs text-indigo-100 mt-0.5">
                        {recordingModifiers.ctrl || recordingModifiers.alt || recordingModifiers.shift ? (
                          <span>
                            מקשים שזוהו: {[
                              recordingModifiers.ctrl ? (isMac ? '⌘' : 'Ctrl') : null,
                              recordingModifiers.alt ? 'Alt' : null,
                              recordingModifiers.shift ? 'Shift' : null
                            ].filter(Boolean).join(' + ')} + [הקש על תו...]
                          </span>
                        ) : (
                          <span>(למשל: Ctrl + C, Alt + S, או אות בודדת) • הקש Esc לביטול</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setRecordingId(null)}
                    className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors shrink-0"
                  >
                    ביטול (Esc)
                  </button>
                </motion.div>
              )}

              {/* Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={appLanguage === 'en' ? 'Search shortcuts by action or key...' : 'חיפוש פעולה או מקש... (העתקה, שמירה, חדש...)'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl ps-9 pe-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Shortcuts List */}
              <div className="space-y-2">
                {filteredShortcuts.map(item => {
                  const binding = customShortcuts[item.id] || item.defaultBinding;
                  const keys = formatShortcutKeys(binding, isMac);
                  const isRecordingThis = recordingId === item.id;
                  const isModified = JSON.stringify(binding) !== JSON.stringify(item.defaultBinding);

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isRecordingThis 
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/30'
                          : 'border-slate-200/80 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {item.name}
                          </span>
                          {isModified && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-bold">
                              {appLanguage === 'en' ? 'Customized' : 'מותאם אישית'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      </div>

                      {/* Right controls: Keys display & Edit / Reset */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Keycap Badge */}
                        <div className="flex items-center gap-1">
                          {keys.map((k, idx) => (
                            <React.Fragment key={idx}>
                              <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-black text-slate-800 dark:text-slate-100 bg-white dark:bg-[#252525] rounded-lg border border-slate-300 dark:border-white/10 shadow-xs font-mono">
                                {k}
                              </kbd>
                              {idx < keys.length - 1 && <span className="text-slate-400 text-xs">+</span>}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Rebind Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setRecordingId(isRecordingThis ? null : item.id);
                            setRecordingModifiers({ ctrl: false, alt: false, shift: false });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                            isRecordingThis 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40'
                          }`}
                        >
                          {isRecordingThis ? 'מאזין...' : (appLanguage === 'en' ? 'Record Key' : 'הקלט מקשים')}
                        </button>

                        {/* Reset single to default */}
                        {isModified && (
                          <button
                            type="button"
                            onClick={() => handleResetSingle(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                            title="אפס קיצור זה לברירת המחדל"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BACKUP & DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-500" />
                  <span>{appLanguage === 'en' ? 'Full Data Backup & Restore' : 'גיבוי ושחזור נתונים מלא'}</span>
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {appLanguage === 'en'
                    ? `Export all ${promptsCount} prompts, ${foldersCount} folders and custom shortcuts to a single JSON file, or restore anytime.`
                    : `שמירה וגיבוי של כל ${promptsCount} הפרומפטים, ${foldersCount} התיקיות וקיצורי המקלדת המותאמים אישית בקובץ JSON אחד הניתן לשחזור בכל עת.`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportAll}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 transition-all shadow-xs"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>{appLanguage === 'en' ? 'Download Full JSON Backup' : 'הורד קובץ גיבוי מלא (JSON)'}</span>
                </button>

                <label className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 transition-all shadow-xs cursor-pointer">
                  <FolderUp className="w-4 h-4 text-emerald-500" />
                  <span>{appLanguage === 'en' ? 'Restore from Backup' : 'שחזר מגיבוי קיים'}</span>
                  <input type="file" accept=".json" onChange={handleImportAll} className="hidden" />
                </label>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>סנכרון ענן מאובטח (Firebase Firestore)</span>
                </div>
                <span>כל השינויים שאתה מבצע נשמרים מקומית וגם מסונכרנים אוטומטית לענן עבור החשבון המחובר.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-[#0f0f0f] flex justify-between items-center text-xs">
          <div className="text-slate-500 text-[11px]">
            {activeTab === 'shortcuts' && (
              <span>טיפ: לחץ על 'הקלט מקשים' בכל שורה להגדרה מיידית.</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-bold bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 dark:text-black text-white transition-all shadow-xs"
          >
            {appLanguage === 'en' ? 'Close' : 'סגור'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
