import React from 'react';
import { BookOpen, Users, Plus, BarChart2, User, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  currentView: string;
  setCurrentView: (view: any) => void;
  onOpenNewEditor: () => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<Props> = ({
  currentView,
  setCurrentView,
  onOpenNewEditor,
  onOpenProfile,
}) => {
  return (
    <nav 
      aria-label="ניווט תחתון למובייל"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-white/10 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {/* 1. Library (ספרייה) */}
      <button
        type="button"
        onClick={() => setCurrentView('library')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentView === 'library'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
        }`}
      >
        <BookOpen className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">ספרייה</span>
      </button>

      {/* 2. Community (קהילה) */}
      <button
        type="button"
        onClick={() => setCurrentView('community')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentView === 'community'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">קהילה</span>
      </button>

      {/* 3. Center FAB: Create New Prompt (+) */}
      <div className="flex-1 flex justify-center -mt-5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={onOpenNewEditor}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 border-2 border-white dark:border-[#121212] focus:outline-none"
          title="צור פרומפט חדש"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </motion.button>
      </div>

      {/* 4. Dashboard (דשבורד) */}
      <button
        type="button"
        onClick={() => setCurrentView('dashboard')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentView === 'dashboard'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
        }`}
      >
        <BarChart2 className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">דשבורד</span>
      </button>

      {/* 5. Profile / Account (פרופיל) */}
      <button
        type="button"
        onClick={() => setCurrentView('profile')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
          currentView === 'profile'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
        }`}
      >
        <User className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">פרופיל</span>
      </button>
    </nav>
  );
};
