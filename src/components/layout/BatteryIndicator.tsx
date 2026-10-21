import React, { useState, useRef, useEffect } from 'react';
import { 
  Battery, BatteryCharging, BatteryWarning, BatteryMedium, BatteryLow, 
  Zap, Leaf, Sparkles, Check, ChevronUp, ChevronDown, Sliders, RefreshCw, Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BatteryStatus } from '../../hooks/useBatteryStatus';

interface Props {
  battery: BatteryStatus;
  isCollapsed?: boolean;
}

export const BatteryIndicator: React.FC<Props> = ({ battery, isCollapsed = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const { level, charging, isLowBattery, powerSaveMode, togglePowerSaveMode, setSimulatedLevel, isSimulated } = battery;

  // Determine battery color and icon
  const getBatteryIcon = () => {
    if (charging) {
      return <BatteryCharging className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />;
    }
    if (level <= 20) {
      return <BatteryWarning className="w-3.5 h-3.5 text-rose-500 animate-bounce" />;
    }
    if (level <= 50) {
      return <BatteryLow className="w-3.5 h-3.5 text-amber-500" />;
    }
    return <Battery className="w-3.5 h-3.5 text-emerald-500" />;
  };

  const getStatusColor = () => {
    if (charging) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40';
    if (level <= 20) return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40';
    if (level <= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40';
    return 'text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 border-slate-200/80 dark:border-white/10';
  };

  const getProgressColor = () => {
    if (charging) return 'bg-emerald-500';
    if (level <= 20) return 'bg-rose-500';
    if (level <= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Compact Sidebar Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={
          charging 
            ? `סוללה: ${level}% (נטען) | ${powerSaveMode ? 'מצב חיסכון פעיל' : 'מצב רגיל'}` 
            : `סוללה: ${level}% | ${powerSaveMode ? 'מצב חיסכון פעיל' : 'מצב רגיל'}`
        }
        className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] select-none ${getStatusColor()}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            {getBatteryIcon()}
            {powerSaveMode && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-[11px] font-mono leading-none">
                {level}%
              </span>
              {charging && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ⚡
                </span>
              )}
              {powerSaveMode && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <Leaf className="w-2.5 h-2.5" />
                  <span>חיסכון</span>
                </span>
              )}
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-1 shrink-0">
            {/* Battery Mini Progress Bar */}
            <div className="w-7 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden p-[1px] border border-slate-300/40 dark:border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${Math.max(8, Math.min(100, level))}%` }}
              />
            </div>
            {isOpen ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronUp className="w-3 h-3 text-slate-400" />}
          </div>
        )}
      </button>

      {/* Interactive Details & Controls Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 350 }}
            className="absolute bottom-full start-0 mb-2 w-64 bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-3.5 z-[70] text-xs"
            dir="rtl"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Battery className="w-4 h-4 text-indigo-500" />
                <span>סטטוס סוללה ומערכת</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                charging 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' 
                  : isLowBattery 
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' 
                    : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
              }`}>
                {charging ? 'מחובר לחשמל' : isLowBattery ? 'סוללה נמוכה' : 'בשימוש סוללה'}
              </span>
            </div>

            {/* Battery Level Bar */}
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <span>רמת סוללה נוכחית:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{level}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/10">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
                  style={{ width: `${Math.max(5, Math.min(100, level))}%` }}
                />
              </div>
            </div>

            {/* Power Saving Mode Toggle Card */}
            <div className={`p-2.5 rounded-xl border mb-3 transition-colors ${
              powerSaveMode 
                ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/40' 
                : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/5'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Leaf className={`w-3.5 h-3.5 ${powerSaveMode ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span>מצב חיסכון באנרגיה</span>
                </div>
                <button
                  type="button"
                  onClick={togglePowerSaveMode}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    powerSaveMode ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      powerSaveMode ? '-translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {powerSaveMode 
                  ? 'פעיל: אנימציות הופחתו ורענון אוטומטי של הדשבורד מושהה לשמירה על הסוללה.' 
                  : 'מופעל אוטומטית כשהסוללה יורדת מתחת ל-20%, או באופן ידני.'}
              </p>
            </div>

            {/* Simulation Controls for testing low battery mode */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>סימולציה לבדיקה:</span>
                {isSimulated && (
                  <button
                    onClick={() => setSimulatedLevel(null)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    איפוס לאמיתי
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setSimulatedLevel(15)}
                  className={`py-1 px-1.5 rounded-lg border text-[10px] font-bold transition-colors ${
                    level === 15 && isSimulated 
                      ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200'
                  }`}
                  title="בדיקת מצב סוללה נמוכה (15%) - מפעיל אוטומטית חיסכון באנרגיה"
                >
                  15% (נמוכה)
                </button>
                <button
                  onClick={() => setSimulatedLevel(45)}
                  className={`py-1 px-1.5 rounded-lg border text-[10px] font-bold transition-colors ${
                    level === 45 && isSimulated 
                      ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200'
                  }`}
                >
                  45%
                </button>
                <button
                  onClick={() => setSimulatedLevel(100)}
                  className={`py-1 px-1.5 rounded-lg border text-[10px] font-bold transition-colors ${
                    level === 100 && isSimulated 
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200'
                  }`}
                >
                  100%
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
