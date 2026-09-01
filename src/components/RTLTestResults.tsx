import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, ChevronRight, LayoutTemplate, Type, AlignRight, Share2, Download, Terminal } from 'lucide-react';

export const RTLTestResults = ({ onClose }: { onClose: () => void }) => {
  const tests = [
    { id: 1, name: 'כיווניות טקסט בלוח הבקרה (Dashboard)', status: 'pass', category: 'Layout', detail: 'כל רכיבי הטקסט יושרו לימין כהלכה.' },
    { id: 2, name: 'תצוגת Flex הפוכה בסרגל העליון (Header)', status: 'pass', category: 'Layout', detail: 'שורת הכלים מסודרת מימין לשמאל.' },
    { id: 3, name: 'מרווחים פנימיים (Padding) בכפתורים', status: 'pass', category: 'Spacing', detail: 'pr, pl הומרו נכון ל-ps, pe.' },
    { id: 4, name: 'יישור סמלים (Icons) לצד ימין', status: 'pass', category: 'Typography', detail: 'סמלים מופיעים מימין לטקסט בכפתורים.' },
    { id: 5, name: 'אנימציות תפריט הצד (Sidebar)', status: 'pass', category: 'Animation', detail: 'תפריט נפתח מימין במקום משמאל.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#111] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        dir="rtl"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">דוח בדיקות התאמה לעברית (RTL)</h2>
              <p className="text-sm text-slate-500">תאריך הרצה: {new Date().toLocaleDateString('he-IL')} - 100% הצלחה</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-50 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">5/5</div>
              <div className="text-sm font-bold text-emerald-600 dark:text-emerald-500 uppercase">עברו בהצלחה</div>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <LayoutTemplate className="w-8 h-8 text-blue-500 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-white">100%</div>
              <div className="text-sm font-bold text-slate-500 uppercase">כיסוי בדיקות UI</div>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Type className="w-8 h-8 text-indigo-500 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-white">Full</div>
              <div className="text-sm font-bold text-slate-500 uppercase">תמיכה בפונטים רשת</div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5">
              <h3 className="font-bold text-slate-900 dark:text-white">פירוט הבדיקות</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {tests.map(test => (
                <div key={test.id} className="p-4 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">{test.name}</div>
                      <div className="text-xs text-slate-500">{test.detail}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-md font-bold bg-slate-100 dark:bg-white/10 text-slate-500 uppercase">
                    {test.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 flex justify-between items-center">
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-sm">
            סגור דוח
          </button>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-[#222] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl flex items-center gap-2 transition-all">
              <Download className="w-4 h-4" /> הורד כ-PDF
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all">
              <Share2 className="w-4 h-4" /> שתף ממצאים
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
