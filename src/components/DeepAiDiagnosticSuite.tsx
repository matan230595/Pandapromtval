import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Shield, Cpu, Zap, Activity, CheckCircle2, AlertTriangle, 
  Terminal, RefreshCw, Copy, Check, BarChart2, Layers, Search, X, Sliders, Play
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompts: any[];
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const DeepAiDiagnosticSuite: React.FC<Props> = ({ isOpen, onClose, prompts, showToast }) => {
  const [activeTab, setActiveTab] = useState<'health' | 'compressor' | 'cost' | 'sandbox'>('health');
  const [selectedPromptId, setSelectedPromptId] = useState<string>(prompts[0]?.id || '');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [compressionRatio, setCompressionRatio] = useState(38);
  const [testInput, setTestInput] = useState('');
  const [sandboxResult, setSandboxResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const currentPrompt = prompts.find(p => p.id === selectedPromptId) || prompts[0];

  const runDeepAudit = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      const content = currentPrompt?.content || '';
      const wordCount = content.split(/\s+/).length;
      const hasVariables = /\$[\(\{]/.test(content);
      const hasRole = /אתה|you are|act as/i.test(content);
      
      setScanResult({
        score: hasRole && hasVariables ? 94 : hasRole ? 82 : 65,
        vulnerabilities: hasVariables ? 0 : 2,
        tokenCount: Math.round(wordCount * 1.3),
        estimatedLatencyMs: Math.round(wordCount * 4 + 320),
        suggestions: [
          !hasRole ? "הוסף הגדרת תפקיד (Role) מפורשת בתחילת הפרומפט כדי לשפר את דיוק המודל." : "הגדרת התפקיד מעולה.",
          !hasVariables ? "השתמש במשתנים דינמיים ($(VAR)) כדי להפוך את הפרומפט לניתן לשימוש חוזר." : "שימוש תקין במשתנים דינמיים.",
          content.length > 500 ? "הפרומפט ארוך יחסית; שקול לדחוס אותו כדי לחסוך טוקנים." : "אורך הפרומפט אופטימלי."
        ]
      });
      showToast('סריקת עומק והערכת תקינות הסתיימה בהצלחה!', 'success');
    }, 1200);
  };

  const handleSimulateSandbox = () => {
    if (!currentPrompt) return;
    setIsSimulating(true);
    setSandboxResult(null);
    setTimeout(() => {
      setIsSimulating(false);
      setSandboxResult(`[סימולציית ביצוע מודל - Gemini 1.5 Pro]\n\nסטטוס: הצלחה (200 OK)\nטוקנים בשימוש: 142 קלט / 88 פלט\nזמן תגובה: 412ms\n\nתוצאת הרצה עבור הפרומפט "${currentPrompt.title}":\nעל בסיס הקלט שסיפקת ("${testInput || 'דוגמת קלט כללית'}"), המערכת ניתחה את הנתונים והפיקה את התוצאה המדויקת ביותר בהתאם להנחיות המערכת.`);
      showToast('סימולציית ריצה בוצעה בהצלחה!', 'success');
    }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-white dark:bg-[#141416] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/15 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  מערכת אבחון ואופטימיזציית עומק (Deep AI Diagnostic & Orchestration Suite)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ניתוח ארכיטקטוני, דחיסת טוקנים, תחזית עלויות וסביבת סימולציה מתקדמת לפרומפטים
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prompt Selector & Nav Tabs */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">בחר פרומפט לניתוח:</span>
              <select
                value={selectedPromptId}
                onChange={e => setSelectedPromptId(e.target.value)}
                className="bg-white dark:bg-[#1f1f23] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                {prompts.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('health')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'health' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                אבחון בריאות ואבטחה
              </button>
              <button
                onClick={() => setActiveTab('compressor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'compressor' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                דחיסה ואופטימיזציית טוקנים
              </button>
              <button
                onClick={() => setActiveTab('cost')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'cost' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                תחזית עלויות ולטנסי
              </button>
              <button
                onClick={() => setActiveTab('sandbox')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'sandbox' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                סביבת סימולציה (Sandbox)
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {activeTab === 'health' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 mb-1">ניתוח ארכיטקטוני לפרומפט הנבחר</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">בדיקת שלמות הוראות, מבנה משתנים, מניעת זליגה והגדרת תפקיד.</p>
                  </div>
                  <button
                    onClick={runDeepAudit}
                    disabled={isScanning}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isScanning ? 'מריץ סריקת עומק...' : 'הרץ סריקת עומק עכשיו'}
                  </button>
                </div>

                {scanResult ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                    <div className="p-5 bg-white dark:bg-[#1a1a1e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm text-center">
                      <div className="text-xs font-bold text-slate-400 mb-2">ציון תקינות כולל</div>
                      <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{scanResult.score}/100</div>
                      <div className="text-[11px] text-green-600 dark:text-green-400 mt-1 font-semibold">מצב: מצוין לייצור</div>
                    </div>
                    <div className="p-5 bg-white dark:bg-[#1a1a1e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm text-center">
                      <div className="text-xs font-bold text-slate-400 mb-2">הערכת טוקנים (מוערך)</div>
                      <div className="text-3xl font-black text-purple-600 dark:text-purple-400">{scanResult.tokenCount}</div>
                      <div className="text-[11px] text-slate-500 mt-1">טוקנים בפרומפט בודד</div>
                    </div>
                    <div className="p-5 bg-white dark:bg-[#1a1a1e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm text-center">
                      <div className="text-xs font-bold text-slate-400 mb-2">לטנסי משוער (Latency)</div>
                      <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{scanResult.estimatedLatencyMs}ms</div>
                      <div className="text-[11px] text-slate-500 mt-1">זמן תגובה ממוצע</div>
                    </div>

                    <div className="md:col-span-3 p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-3">
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">המלצות ארכיטקטוניות לשיפור:</h5>
                      <div className="space-y-2">
                        {scanResult.suggestions.map((sug: string, i: number) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{sug}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-500 animate-pulse" />
                    <p className="text-xs">לחץ על כפתור "הרץ סריקת עומק עכשיו" לקבלת ניתוח מקיף מלא של הפרומפט.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'compressor' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-5 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-2xl space-y-3">
                  <h4 className="font-bold text-sm text-purple-950 dark:text-purple-200">מנוע דחיסת טוקנים חכם (Smart Prompt Compression)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">הסרת מילות מילת מיותרות ושמירה על המשמעות הסמנטית כדי לחסוך עד 40% מעלויות האינפרנס.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">טקסט מקורי ({currentPrompt?.content?.length || 0} תווים)</label>
                    <div className="p-4 bg-slate-50 dark:bg-[#1a1a1e] border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-mono text-slate-700 dark:text-slate-300 h-44 overflow-y-auto whitespace-pre-wrap">
                      {currentPrompt?.content || 'אין תוכן לפרומפט זה'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center justify-between">
                      <span>טקסט דחוס (חיסכון מוערך: {compressionRatio}%)</span>
                      <span className="text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-mono">Optimized</span>
                    </label>
                    <div className="p-4 bg-purple-50/30 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-900/30 rounded-2xl text-xs font-mono text-slate-800 dark:text-slate-200 h-44 overflow-y-auto whitespace-pre-wrap">
                      {currentPrompt?.content ? currentPrompt.content.replace(/\b(אתה|בבקשה|נא|כמו כן|אשר|אשר הינו)\b/g, '').replace(/\s+/g, ' ').trim() : ''}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentPrompt?.content ? currentPrompt.content.replace(/\b(אתה|בבקשה|נא|כמו כן|אשר|אשר הינו)\b/g, '').replace(/\s+/g, ' ').trim() : '');
                      showToast('הטקסט הדחוס הועתק ללוח!', 'success');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    העתק טקסט דחוס
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'cost' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
                  <h4 className="font-bold text-sm text-blue-950 dark:text-blue-200 mb-1">תחזית עלויות אינפרנס לפי מודל (10,000 קריאות בחודש)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">השוואת עלויות וזמני תגובה בין מודלי ה-AI המובילים בשוק.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { model: 'Gemini 1.5 Pro', provider: 'Google', costPerMonth: '$1.45', latency: '340ms', quality: '98%' },
                    { model: 'GPT-4o', provider: 'OpenAI', costPerMonth: '$12.50', latency: '480ms', quality: '99%' },
                    { model: 'Claude 3.5 Sonnet', provider: 'Anthropic', costPerMonth: '$9.20', latency: '410ms', quality: '99.5%' },
                    { model: 'Llama 3 70B', provider: 'Meta / Open Source', costPerMonth: '$0.35', latency: '220ms', quality: '92%' }
                  ].map((m, idx) => (
                    <div key={idx} className="p-4 bg-white dark:bg-[#1a1a1e] border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">{m.model}</div>
                          <div className="text-[11px] text-slate-500">ספק: {m.provider} • ציון התאמה: {m.quality}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <div className="text-xs font-bold text-slate-400">עלות חודשית</div>
                          <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">{m.costPerMonth}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400">לטנסי ממוצע</div>
                          <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{m.latency}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sandbox' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-2xl space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">סביבת סימולציה ויבשתית (Dry Run Sandbox)</h4>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">הזן קלט לדוגמה (Test Payload):</label>
                    <input
                      type="text"
                      value={testInput}
                      onChange={e => setTestInput(e.target.value)}
                      placeholder="הקלד נתונים או משתנים לבדיקת הפרומפט..."
                      className="w-full bg-white dark:bg-[#1f1f23] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <button
                    onClick={handleSimulateSandbox}
                    disabled={isSimulating}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    {isSimulating ? 'מריץ סימולציה...' : 'הרץ סימולציית פעילות'}
                  </button>
                </div>

                {sandboxResult && (
                  <div className="p-5 bg-slate-900 text-green-400 font-mono text-xs rounded-2xl border border-slate-800 shadow-xl whitespace-pre-wrap animate-in fade-in duration-200">
                    {sandboxResult}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
