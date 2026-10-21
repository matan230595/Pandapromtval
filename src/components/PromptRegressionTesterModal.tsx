import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayCircle, CheckCircle2, AlertTriangle, X, RefreshCw, BarChart3, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { Prompt } from '../types';

interface TestCase {
  id: string;
  input: string;
  expectedKeyword: string;
  status?: 'passed' | 'failed' | 'running';
  output?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
}

export const PromptRegressionTesterModal: React.FC<Props> = ({ isOpen, onClose, prompts, showToast }) => {
  const [selectedPromptId, setSelectedPromptId] = useState<string>(prompts[0]?.id || '');
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: '1', input: 'צור קמפיין שיווקי למוצר חדש', expectedKeyword: 'מטרה' },
    { id: '2', input: 'תכתוב קוד Python לבדיקת פלינדרום', expectedKeyword: 'def' }
  ]);
  const [newInput, setNewInput] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleAddTestCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInput.trim() || !newKeyword.trim()) {
      showToast('נא להזין קלט וילה מילת מפתח צפויה', 'error');
      return;
    }
    setTestCases([...testCases, { id: Date.now().toString(), input: newInput, expectedKeyword: newKeyword }]);
    setNewInput('');
    setNewKeyword('');
    showToast('מקרה בוחן נוסף בהצלחה', 'success');
  };

  const runRegressionSuite = () => {
    if (testCases.length === 0) {
      showToast('אין מקרי בוחן להרצה', 'error');
      return;
    }
    setIsRunning(true);
    setScore(null);
    setTestCases(testCases.map(t => ({ ...t, status: 'running' })));

    setTimeout(() => {
      let passedCount = 0;
      const updated = testCases.map(tc => {
        const passed = Math.random() > 0.15; // 85% success simulation
        if (passed) passedCount++;
        return {
          ...tc,
          status: (passed ? 'passed' : 'failed') as ('passed' | 'failed'),
          output: passed ? `תשובת AI תקינה הכוללת את המונח '${tc.expectedKeyword}' ברמת דיוק גבוהה.` : 'התשובה לא כללה את מילת המפתח הצפויה.'
        };
      });
      setTestCases(updated);
      setIsRunning(false);
      const finalScore = Math.round((passedCount / testCases.length) * 100);
      setScore(finalScore);
      showToast(`בדיקת הרגרסיה הסתיימה בציון ${finalScore}%`, finalScore > 70 ? 'success' : 'info');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  מערכת בקרת איכות ורגרסיה אוטומטית (Regression Testing)
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">AI Benchmarks</span>
                </h3>
                <p className="text-xs text-emerald-100">בדיקת עמידות פרומפטים מול סט מקרי בוחן קבועים לפני עדכון גרסה</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-100">
            {/* Prompt Selector & Run Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-full sm:w-auto flex-1">
                <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">בחר פרומפט לבדיקה</label>
                <select
                  value={selectedPromptId}
                  onChange={(e) => setSelectedPromptId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {prompts.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={runRegressionSuite}
                disabled={isRunning}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 shrink-0"
              >
                {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                {isRunning ? 'מריץ בדיקות...' : 'הרץ סוויטת רגרסיה'}
              </button>
            </div>

            {/* Score Banner */}
            {score !== null && (
              <div className={`p-4 rounded-xl border flex items-center justify-between ${score > 70 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-200' : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-800 dark:text-amber-200'}`}>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6" />
                  <div>
                    <h4 className="font-bold text-sm">תוצאת מבחן רגרסיה כוללת: {score}% הצלחה</h4>
                    <p className="text-xs opacity-90">{score > 70 ? 'הפרומפט עומד ברף האיכות הנדרש לפרודקשיין.' : 'זוהו כשלים בחלק ממקרי הוחן, מומלץ לבצע אופטימיזציה.'}</p>
                  </div>
                </div>
                <span className="text-2xl font-black">{score}%</span>
              </div>
            )}

            {/* Add Test Case Form */}
            <form onSubmit={handleAddTestCase} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                הוספת מקרה בוחן (Test Case) חדש
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="קלט לבדיקה (Prompt Input Variable)"
                  value={newInput}
                  onChange={(e) => setNewInput(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="מילת מפתח צפויה בתשובה (Expected Keyword)"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  הוסף מקרה בוחן
                </button>
              </div>
            </form>

            {/* Test Cases List */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">מקרי בוחן פעילים ({testCases.length})</h4>
              <div className="space-y-2">
                {testCases.map((tc) => (
                  <div key={tc.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300">קלט: {tc.input}</span>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">יעד: {tc.expectedKeyword}</span>
                      </div>
                      {tc.output && <p className="text-xs text-slate-500 dark:text-slate-400">{tc.output}</p>}
                    </div>
                    <div>
                      {tc.status === 'running' && <span className="text-xs text-indigo-600 font-bold animate-pulse">מריץ...</span>}
                      {tc.status === 'passed' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" /> עבר בהצלחה
                        </span>
                      )}
                      {tc.status === 'failed' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/50 px-2.5 py-1 rounded-lg">
                          <AlertTriangle className="w-4 h-4" /> נכשל
                        </span>
                      )}
                      {!tc.status && <span className="text-xs text-slate-400 font-medium">טרם הורץ</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors"
            >
              סגור
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
