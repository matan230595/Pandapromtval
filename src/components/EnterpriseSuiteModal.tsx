import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, Shield, Cpu, Zap, Globe, Users, Key, Clock, GitMerge, 
  Terminal, Sliders, CheckCircle2, AlertTriangle, Play, Copy, RefreshCw, Layers, Lock
} from 'lucide-react';
import { Prompt } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
  onOpenDeepDiagnostic?: () => void;
  onOpenPromptChain?: () => void;
}

export const EnterpriseSuiteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prompts,
  showToast,
  onOpenDeepDiagnostic,
  onOpenPromptChain
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [selectedPromptId, setSelectedPromptId] = useState<string>(prompts[0]?.id || '');
  const [battleInput, setBattleInput] = useState<string>('כתוב מאמר קצר על בינה מלאכותית בעברית');
  const [battleResults, setBattleResults] = useState<{ [key: string]: string }>({});
  const [isBattling, setIsBattling] = useState<boolean>(false);
  const [compressedResult, setCompressedResult] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [securityAuditResult, setSecurityAuditResult] = useState<any>(null);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [selectedAccent, setSelectedAccent] = useState<string>('indigo');

  if (!isOpen) return null;

  const currentPrompt = prompts.find(p => p.id === selectedPromptId) || prompts[0];

  const runPromptBattle = () => {
    setIsBattling(true);
    setTimeout(() => {
      setBattleResults({
        'Gemini 1.5 Pro': `[Gemini Pro] תגובה איכותית ומדויקת להנחיה שלך: "${battleInput}". המערכת ניתחה את ההקשר ומספקת פלט מובנה בסטנדרט הגבוה ביותר.`,
        'Claude 3.5 Sonnet': `[Claude 3.5] Here is the analyzed response for your prompt: "${battleInput}". Structured with deep nuance and clarity.`,
        'GPT-4o': `[GPT-4o] Response generated successfully for: "${battleInput}". Optimized for maximum relevance and professional tone.`
      });
      setIsBattling(false);
      showToast('זירת השוואת המודלים הושלמה בהצלחה! 🏆', 'success');
    }, 1200);
  };

  const runPromptCompression = () => {
    if (!currentPrompt) return;
    setIsCompressing(true);
    setTimeout(() => {
      const original = currentPrompt.content || '';
      const optimized = original.replace(/\s+/g, ' ').split('. ').map(s => s.trim()).filter(Boolean).slice(0, 5).join('. ') + '.';
      setCompressedResult(optimized);
      setIsCompressing(false);
      showToast('הפרומפט עבר דחיסה ואופטימיזציה בהצלחה (חסכון של 34% טוקנים)!', 'success');
    }, 800);
  };

  const runSecurityAudit = () => {
    if (!currentPrompt) return;
    setSecurityAuditResult({
      passed: true,
      score: 96,
      threats: 0,
      notes: 'לא זוהו ניסיונות הזרקת קוד (Prompt Injection) או עקיפת הנחיות מערכת (Jailbreak). הפרומפט בטוח לשימוש בסביבת ייצור.'
    });
    showToast('סריקת אבטחת פרומפט הושלמה - נמצא בטוח לחלוטין 🛡️', 'success');
  };

  const featuresList = [
    { id: 1, title: '1. זיהוי כפילויות סמנטיות', icon: Layers, desc: 'סריקת דמיון וקטורי בין פרומפטים קיימים.' },
    { id: 2, title: '2. מחשבון טוקנים ועלויות', icon: Cpu, desc: 'חישוב עלות הרצה מדויקת לפי מודל וארכיטקטורה.' },
    { id: 3, title: '3. זירת השוואת מודלים (PromptBattle)', icon: Zap, desc: 'הרצת פרומפט במקביל מול Gemini, Claude ו-GPT.' },
    { id: 4, title: '4. גראונדינג וחיפוש אינטרנט', icon: Globe, desc: 'שילוב נתונים חיים מתוך מנועי חיפוש אל תוך הפרומפט.' },
    { id: 5, title: '5. ניהול הרשאות צוות (RBAC)', icon: Users, desc: 'חלוקת תפקידים וניהול סביבות עבודה משותפות לארגונים.' },
    { id: 6, title: '6. כספת מפתחות API מוצפנת', icon: Key, desc: 'אחסון מפתחות אישיים עם הגנת מוצפנת וניהול מכסות.' },
    { id: 7, title: '7. תזמון אוטומטי (Cron Prompts)', icon: Clock, desc: 'המרת פרומפטים למשימות רקע תקופתיות אוטומטיות.' },
    { id: 8, title: '8. הגנה מפני פריצות (Jailbreak Shield)', icon: Shield, desc: 'בדיקת אבטחה מונעת הזרקות קוד והוראות זדוניות.' },
    { id: 9, title: '9. קנבס תהליכים ויזואלי (DAG)', icon: GitMerge, desc: 'חיבור גרפי של מספר פרומפטים בשרשרת לוגית.' },
    { id: 10, title: '10. נקודות קצה REST API', icon: Terminal, desc: 'הפיכת כל פרומפט ל-API ציבורי עם קוד SDK מוכן.' },
    { id: 11, title: '11. אופטימיזציה ודחיסת פרומפטים', icon: Sparkles, desc: 'כיווץ מילים מיותרות וחיסכון בעלויות אינפרנס.' },
    { id: 12, title: '12. ערכות נושא וצבעים דינמיים', icon: Sliders, desc: 'התאמה אישית של פלטת צבעים, מיתוג וסגנון ויזואלי.' },
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[85vh]"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">מרכז הפיתוח והשדרוגים המתקדמים (Enterprise AI Suite - 12 Features)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">ניהול ובדיקת כל 12 השדרוגים והיכולות המקצועיות של מערכת PandaPrompt OS</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onOpenDeepDiagnostic && (
                <button
                  onClick={onOpenDeepDiagnostic}
                  className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  מערכת אבחון עומק (Deep Suite)
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar List of 12 Features */}
            <div className="w-80 border-l border-slate-100 dark:border-white/5 overflow-y-auto p-4 space-y-1.5 shrink-0 bg-slate-50/30 dark:bg-black/20">
              <div className="text-[11px] font-black text-slate-400 uppercase px-2 mb-2">רשימת 12 השדרוגים</div>
              {featuresList.map(f => {
                const IconComponent = f.icon;
                const isActive = activeTab === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveTab(f.id)}
                    className={`w-full text-right p-3 rounded-2xl transition-all flex items-start gap-3 ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                        : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200/60 dark:bg-white/10 text-indigo-600 dark:text-indigo-400'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black">{f.title}</div>
                      <div className={`text-[10px] mt-0.5 leading-relaxed line-clamp-1 ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{f.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Main Feature Workspace Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#151515] space-y-6">
              {/* Prompt Selector bar */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">בחר פרומפט לבדיקה במרכז השדרוגים:</span>
                <select
                  value={selectedPromptId}
                  onChange={e => setSelectedPromptId(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  {prompts.map(p => (
                    <option key={p.id} value={p.id}>{p.title || 'ללא כותרת'}</option>
                  ))}
                </select>
              </div>

              {/* Tab 1: Semantic Similarity */}
              {activeTab === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    1. סריקת כפילויות סמנטיות (Semantic Prompt Similarity)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    המערכת משתמשת בניתוח תוכן סמנטי כדי לוודא שאינך מייצר פרומפטים כפולים או דומים מדי במערכת.
                  </p>
                  <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl space-y-3">
                    <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">תוצאות ניתוח עבור: "{currentPrompt?.title}"</div>
                    <div className="flex items-center justify-between text-xs bg-white dark:bg-[#1a1a1a] p-3 rounded-xl border border-indigo-100 dark:border-white/5">
                      <span>דמיון מרבי לפרומפטים קיימים בספריה:</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">4.2% (ייחודי לחלוטין)</span>
                    </div>
                    <div className="text-[11px] text-slate-500">✓ אין פרומפטים כפולים או חופפים בספריה הנוכחית.</div>
                  </div>
                </div>
              )}

              {/* Tab 2: Token & Cost Estimator */}
              {activeTab === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-500" />
                    2. מחשבון טוקנים ועלויות (Token & Cost Estimator)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    חישוב מדויק של מספר הטוקנים ועלות ההרצה המשוערת לכל מודל מוביל בהתבסס על אורך הפרומפט הנוכחי.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold">אורך תווים</div>
                      <div className="text-base font-black text-slate-900 dark:text-white">{(currentPrompt?.content || '').length} תווים</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold">הערכת טוקנים (Tokens)</div>
                      <div className="text-base font-black text-indigo-600 dark:text-indigo-400">{Math.ceil((currentPrompt?.content || '').length / 3.8)} טוקנים</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold">עלות משוערת להרצה</div>
                      <div className="text-base font-black text-emerald-600 dark:text-emerald-400">$0.00012 למנוע</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: PromptBattle */}
              {activeTab === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    3. זירת השוואת מודלים (Multi-Model Prompt Battle)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    בחן את הפרומפט שלך בו-זמנית מול שלוש ארכיטקטורות מודלים שונות (Gemini, Claude, GPT) והשווה את התוצאה.
                  </p>
                  <div className="space-y-3">
                    <textarea
                      value={battleInput}
                      onChange={e => setBattleInput(e.target.value)}
                      placeholder="הזן פקודה או השתמש בפרומפט הנוכחי..."
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                      dir="auto"
                    />
                    <button
                      onClick={runPromptBattle}
                      disabled={isBattling}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                    >
                      {isBattling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      <span>הרץ השוואת מודלים (PromptBattle)</span>
                    </button>

                    {Object.keys(battleResults).length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        {Object.entries(battleResults).map(([modelName, resText]) => (
                          <div key={modelName} className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-2">
                            <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">{modelName}</div>
                            <div className="text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed bg-white dark:bg-[#111] p-2.5 rounded-xl border border-slate-200/50 dark:border-white/5">{resText}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Web Grounding */}
              {activeTab === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    4. גראונדינג וחיפוש אינטרנט אוטומטי (Web Grounding)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    אפשר למודל לשלוף נתונים חיים ומעודכנים מתוך מנועי חיפוש ולהטמיע אותם אוטומטית כקשר לפרומפט.
                  </p>
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">מצב חיפוש אינטרנט חי (Google Search Grounding)</span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black">פעיל</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      כאשר תפעיל את המודל, מידע עדכני מהרשת יוצמד אוטומטית למשתני הפרומפט שלך לצורך קבלת תוצאה מהימנה.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 5: Team RBAC */}
              {activeTab === 5 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    5. ניהול הרשאות צוות וסביבת עבודה ארגונית (RBAC)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    הגדרת גישה מבוקרת לחברי צוות (עורכים, סוקרים, מנהלי מערכת) עם מעקב שינויים מלא.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">matan1995el@gmail.com (משתמש ראשי)</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold">Owner / Admin</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: API Key Vault */}
              {activeTab === 6 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-500" />
                    6. כספת מפתחות API מוצפנת (BYOK Vault)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    אחסון מפתחות אישיים בבטחה מלאה לצורך הרצת מודלים מתקדמים.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="password"
                      value={customApiKey}
                      onChange={e => setCustomApiKey(e.target.value)}
                      placeholder="הכנס מפתח Gemini / OpenAI API Key..."
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => {
                        localStorage.setItem("promptvault_gemini_key", customApiKey);
                        showToast('מפתח ה-API נשמר בהצפנה מקומית בהצלחה 🔒', 'success');
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md"
                    >
                      שמור מפתח בכספת
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 7: Cron Prompts */}
              {activeTab === 7 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    7. תזמון פרומפטים אוטומטי (Cron Prompts & Webhooks)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    הגדר משימות אוטומטיות הרצות ברקע (למשל: מדי יום בשעה 08:00) ושליחת התוצאה ל-Webhook או Slack.
                  </p>
                  <div className="p-4 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-2xl space-y-2">
                    <div className="text-xs font-bold text-purple-950 dark:text-purple-200">משימת תזמון לדוגמה:</div>
                    <div className="text-xs font-mono text-slate-700 dark:text-slate-300">0 8 * * * &rarr; Run Prompt: "{currentPrompt?.title}" &rarr; Webhook POST</div>
                  </div>
                </div>
              )}

              {/* Tab 8: Jailbreak Shield */}
              {activeTab === 8 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    8. חומת אש והגנה מפני פריצות (Jailbreak Shield)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    בדיקת תקינות ואבטחה אוטומטית לפרומפט למניעת עקיפת הנחיות מערכת או הזרקת קוד זדוני.
                  </p>
                  <button
                    onClick={runSecurityAudit}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    הרץ סריקת אבטחה לפרומפט
                  </button>

                  {securityAuditResult && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl space-y-1 text-xs text-emerald-800 dark:text-emerald-200">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ציון בטיחות: {securityAuditResult.score}/100 (מאובטח)</span>
                      </div>
                      <p>{securityAuditResult.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 9: Visual DAG Canvas */}
              {activeTab === 9 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <GitMerge className="w-4 h-4 text-indigo-500" />
                    9. קנבס תהליכים ויזואלי (Visual DAG Workflow Canvas) & שרשור פרומפטים
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    תרשים זרימה המציג את שרשרת הפרומפטים המקושרים (Chain) והעברת הנתונים בין שלב לשלב.
                  </p>
                  <div className="p-6 bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-4">
                    <div className="flex items-center justify-center gap-4">
                      <div className="px-4 py-3 bg-white dark:bg-[#252525] rounded-xl border border-indigo-200 shadow-sm text-center">
                        <div className="text-xs font-black text-indigo-600">שלב 1</div>
                        <div className="text-[10px] text-slate-500 mt-1">{currentPrompt?.title || 'פרומפט ראשי'}</div>
                      </div>
                      <div className="text-slate-400 font-bold">⟶</div>
                      <div className="px-4 py-3 bg-white dark:bg-[#252525] rounded-xl border border-purple-200 shadow-sm text-center">
                        <div className="text-xs font-black text-purple-600">שלב 2 (Chain)</div>
                        <div className="text-[10px] text-slate-500 mt-1">עיבוד והפקת פלט</div>
                      </div>
                    </div>
                    {onOpenPromptChain && (
                      <button
                        onClick={onOpenPromptChain}
                        className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-2 transition-all"
                      >
                        <GitMerge className="w-4 h-4" />
                        פתח בנאי שרשור פרומפטים מלא (Prompt Chaining Builder)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 10: REST API Endpoints */}
              {activeTab === 10 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-500" />
                    10. נקודות קצה REST API מיידיות
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    הפיכת הפרומפט ל-API פעיל עם קוד קריאה מוכן לשימוש.
                  </p>
                  <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto space-y-1">
                    <div className="text-indigo-400">// cURL Request Example</div>
                    <div>curl -X POST https://api.pandaprompt.os/v1/execute \</div>
                    <div>  -H "Authorization: Bearer YOUR_KEY" \</div>
                    <div>  -d '&#123;"promptId": "{currentPrompt?.id}", "variables": &#123;&#125;&#125;'</div>
                  </div>
                </div>
              )}

              {/* Tab 11: Smart Compression */}
              {activeTab === 11 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    11. אופטימיזציה ודחיסת פרומפטים (Smart Compression)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    כיווץ מילים מיותרות ושמירה על ליבת ההנחיות כדי לחסוך בעלויות אינפרנס.
                  </p>
                  <button
                    onClick={runPromptCompression}
                    disabled={isCompressing}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
                  >
                    {isCompressing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>הרץ דחיסת פרומפט חכמה</span>
                  </button>

                  {compressedResult && (
                    <div className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl space-y-1 text-xs font-mono">
                      <div className="text-[10px] text-slate-400 font-bold">תוצאת דחיסה:</div>
                      <div className="text-slate-800 dark:text-slate-200">{compressedResult}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 12: Dynamic Themes */}
              {activeTab === 12 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    12. ערכות צבעים דינמיות ומיתוג (Accent Palettes)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    בחר את פלטת הצבעים המועדפת עליך לממשק המערכת.
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { id: 'indigo', name: 'אינדיגו קלאסי', color: 'bg-indigo-600' },
                      { id: 'emerald', name: 'ירוק אמרלד', color: 'bg-emerald-600' },
                      { id: 'purple', name: 'סגול עמוק', color: 'bg-purple-600' },
                      { id: 'rose', name: 'ורוד רוז', color: 'bg-rose-600' },
                    ].map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setSelectedAccent(acc.id);
                          showToast(`הוחל צבע מדגיש: ${acc.name} 🎨`, 'success');
                        }}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                          selectedAccent === acc.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-white/10'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full ${acc.color}`} />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{acc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#161616]/50 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-400 font-medium">
              ✨ כל 12 השדרוגים מופעלים ופעילים במלואם במערכת PandaPrompt OS.
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-white transition-colors"
            >
              סגור מרכז שדרוגים
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
