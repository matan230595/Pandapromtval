import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, RotateCcw, Zap, FastForward, Sliders } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const SpeedReadingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  content
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300); // Words per minute
  const [currentIndex, setCurrentIndex] = useState(0);

  const words = useRef<string[]>([]);

  useEffect(() => {
    if (content) {
      // Split content into clean words, filtering out empty strings
      words.current = content.replace(/[#*`_\[\]()]/g, ' ').split(/\s+/).filter(Boolean);
      setCurrentIndex(0);
      setIsPlaying(false);
    }
  }, [content, isOpen]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && words.current.length > 0) {
      const intervalMs = (60 / wpm) * 1000;
      timer = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= words.current.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, wpm]);

  if (!isOpen) return null;

  const currentWord = words.current[currentIndex] || '';
  const progress = words.current.length > 0 ? (currentIndex / (words.current.length - 1)) * 100 : 0;

  // Highlight pivot letter in the middle of the word for optimal RSVP reading (optional nice touch)
  const midpoint = Math.floor(currentWord.length / 2);
  const leftPart = currentWord.slice(0, midpoint);
  const pivotChar = currentWord[midpoint] || '';
  const rightPart = currentWord.slice(midpoint + 1);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#111111] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 text-white flex flex-col items-center relative overflow-hidden"
      >
        {/* Top bar */}
        <div className="w-full flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold truncate max-w-xs sm:max-w-md">{title}</h3>
              <p className="text-xs text-slate-400">קריאה מהירה (RSVP - Rapid Serial Visual Presentation)</p>
            </div>
          </div>
          <button
            onClick={() => { setIsPlaying(false); onClose(); }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RSVP Word Display Stage */}
        <div className="w-full my-12 py-16 bg-[#181818] border border-white/5 rounded-3xl flex flex-col items-center justify-center relative shadow-inner">
          {/* Focal red dot guide */}
          <div className="absolute top-4 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />

          <div className="text-4xl sm:text-6xl font-black font-mono tracking-wider flex items-center justify-center h-20 px-6">
            {words.current.length > 0 ? (
              <span className="flex items-center">
                <span className="text-slate-300">{leftPart}</span>
                <span className="text-rose-400 underline decoration-2 underline-offset-4">{pivotChar}</span>
                <span className="text-slate-300">{rightPart}</span>
              </span>
            ) : (
              <span className="text-slate-500 text-lg">אין טקסט לקריאה</span>
            )}
          </div>

          {/* Word count & progress counter */}
          <div className="absolute bottom-4 text-xs font-mono text-slate-400">
            {currentIndex + 1} / {words.current.length} מילים
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-6 cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          setCurrentIndex(Math.floor(ratio * (words.current.length - 1)));
        }}>
          <div className="bg-indigo-500 h-full transition-all duration-75" style={{ width: `${progress}%` }} />
        </div>

        {/* Controls */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* WPM Speed Selector */}
          <div className="flex items-center gap-2 bg-white/5 px-3.5 py-2 rounded-2xl border border-white/5">
            <FastForward className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-300">מהירות (WPM):</span>
            <select
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              className="bg-black/40 text-indigo-400 font-bold text-xs rounded-xl px-2.5 py-1 border border-white/10 outline-none"
            >
              <option value={150}>150 מילים לדקה (איטי)</option>
              <option value={250}>250 מילים לדקה (רגיל)</option>
              <option value={300}>300 מילים לדקה (מומלץ)</option>
              <option value={450}>450 מילים לדקה (מהיר)</option>
              <option value={600}>600 מילים לדקה (מתקדם)</option>
              <option value={800}>800 מילים לדקה (מומחה)</option>
            </select>
          </div>

          {/* Play/Pause & Reset buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsPlaying(false);
              }}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title="התחל מחדש"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  <span>השהה</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>התחל קריאה</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
