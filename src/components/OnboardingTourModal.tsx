import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ArrowLeft, ArrowRight, Check, Compass, ShieldCheck, GitMerge, BarChart2, Zap, Bookmark } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onFinish?: () => void;
}

const onboardingSteps = [
  {
    title: 'ברוכים הבאים ל-PandaPrompt OS 🐼',
    subtitle: 'כספת הפרומפטים המתקדמת ביותר לניהול, יצירה ואופטימיזציה של פקודות ל-AI.',
    desc: 'המערכת מרכזת את כל הפרומפטים החכמים שלך במקום אחד, עם כלים מתקדמים לשיפור דיוק המענה, שרשור אוטומציות ושיתוף צוותי.',
    icon: Sparkles,
    gradient: 'from-indigo-600 to-violet-600',
    badge: 'היכרות מהירה'
  },
  {
    title: 'עריכה חכמה ואופטימיזציה מבוססת AI ✍️',
    subtitle: 'שפר את הפרומפטים שלך בלחיצת כפתור אחת.',
    desc: 'השתמש בתיוג אוטומטי (Auto-Tagging), ניתוח קריאות (Readability Dashboard) בעברית ובאנגלית, וניהול משתנים דינמיים לקבלת תוצאות מושלמות מכל מודל.',
    icon: Zap,
    gradient: 'from-blue-600 to-cyan-600',
    badge: 'עורך מתקדם'
  },
  {
    title: 'בנאי שרשור פרומפטים (Prompt Chaining) 🔗',
    subtitle: 'חבר מספר פרומפטים לרצף אוטומטי.',
    desc: 'צור תהליכי עבודה שבהם הפלט של פרומפט אחד הופך אוטומטית לקלט של הפרומפט הבא בסדרה, לבניית סוכני AI חכמים.',
    icon: GitMerge,
    gradient: 'from-purple-600 to-pink-600',
    badge: 'אוטומציות'
  },
  {
    title: 'אנליטיקות, מפת חום ושעות פרודוקטיביות 📊',
    subtitle: 'עקוב אחר השימוש וההספקים שלך לאורך זמן.',
    desc: 'צפה במפת חום יומית, ניתוח שעות פעילות פרודוקטיביות (Most Productive Time of Day), וסטטיסטיקות חיסכון בזמן וטוקנים.',
    icon: BarChart2,
    gradient: 'from-emerald-600 to-teal-600',
    badge: 'תובנות ונתונים'
  },
  {
    title: 'אבטחה ארגונית, צוותים וגיבויים 🛡️',
    subtitle: 'עובדים יחד בצורה מאובטחת.',
    desc: 'נהל סביבות עבודה משותפות (Workspaces), ייצא גיבויי JSON מרוכזים, השתמש בהצפנת PIN מקומית ועבוד במצב אופליין מלא.',
    icon: ShieldCheck,
    gradient: 'from-amber-600 to-orange-600',
    badge: 'Enterprise OS'
  }
];

export const OnboardingTourModal: React.FC<Props> = ({ isOpen, onClose, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = onboardingSteps[currentStep];
  const IconComponent = step.icon;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      if (onFinish) onFinish();
      onClose();
      localStorage.setItem('promptvault_onboarded_v1', 'true');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-xl bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden flex flex-col"
          dir="rtl"
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-200/50 dark:border-indigo-900/50">
                שלב {currentStep + 1} מתוך {onboardingSteps.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">({step.badge})</span>
            </div>
            <button
              onClick={() => {
                onClose();
                localStorage.setItem('promptvault_onboarded_v1', 'true');
              }}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-colors"
              title="סגור מדריך"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-8 space-y-6">
            <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center shadow-xl shadow-indigo-500/20`}>
              <IconComponent className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {step.title}
              </h2>
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {step.subtitle}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                {step.desc}
              </p>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {onboardingSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all ${currentStep === idx ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 dark:bg-white/10'}`}
                />
              ))}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                localStorage.setItem('promptvault_onboarded_v1', 'true');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white px-3 py-2 transition-colors"
            >
              דלג על המדריך
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2.5 bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors border border-slate-200 dark:border-white/10 flex items-center gap-1.5"
                >
                  <ArrowRight className="w-4 h-4" />
                  הקודם
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/25 flex items-center gap-1.5"
              >
                {isLastStep ? (
                  <>
                    <Check className="w-4 h-4" />
                    בוא נתחיל לעבוד!
                  </>
                ) : (
                  <>
                    הבא
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
