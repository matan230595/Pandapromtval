import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Copy, Check, Sparkles, Play, SlidersHorizontal, Plus, 
  Trash2, Eye, EyeOff, RotateCcw, BookmarkCheck, FileText, 
  HelpCircle, ArrowRight, CornerDownLeft, Layers, Calendar, 
  Hash, AlignLeft, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prompt, CustomPlaceholder } from '../types';
import { 
  extractPlaceholders, 
  renderTemplateText, 
  ExtractedPlaceholder 
} from '../utils/templatingEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | Partial<Prompt> | null;
  onComplete?: (renderedText: string) => void;
  onTestInSandbox?: (renderedText: string) => void;
  onUpdatePrompt?: (updatedPrompt: any) => void;
  onShowToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const PromptTemplateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prompt,
  onComplete,
  onTestInSandbox,
  onUpdatePrompt,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'fill' | 'define'>('fill');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [highlightVariables, setHighlightVariables] = useState(true);

  // New placeholder definition state
  const [newPhName, setNewPhName] = useState('');
  const [newPhLabel, setNewPhLabel] = useState('');
  const [newPhType, setNewPhType] = useState<CustomPlaceholder['type']>('text');
  const [newPhDefault, setNewPhDefault] = useState('');
  const [newPhOptions, setNewPhOptions] = useState('');
  const [newPhDesc, setNewPhDesc] = useState('');

  // Extract all placeholders (both in-text and custom definitions)
  const placeholders: ExtractedPlaceholder[] = useMemo(() => {
    if (!prompt) return [];
    return extractPlaceholders(prompt.content || '', prompt.customPlaceholders || []);
  }, [prompt]);

  // Load saved default values / presets from localStorage or definitions
  useEffect(() => {
    if (!isOpen || !prompt) return;

    const storageKey = `promptvault_template_${prompt.id || 'draft'}`;
    let saved: Record<string, string> = {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) saved = JSON.parse(raw);
    } catch {
      saved = {};
    }

    const initialValues: Record<string, string> = {};
    placeholders.forEach(ph => {
      if (saved[ph.name] !== undefined) {
        initialValues[ph.name] = saved[ph.name];
      } else if (ph.defaultValue) {
        initialValues[ph.name] = ph.defaultValue;
      } else if (ph.type === 'select' && ph.options && ph.options.length > 0) {
        initialValues[ph.name] = ph.options[0];
      } else {
        initialValues[ph.name] = '';
      }
    });

    setFormValues(initialValues);
    setCopied(false);
  }, [isOpen, prompt, placeholders]);

  // Rendered preview text
  const renderedText = useMemo(() => {
    if (!prompt) return '';
    return renderTemplateText(prompt.content || '', formValues, {
      fallbackToDefault: false,
      placeholderDefs: prompt.customPlaceholders
    });
  }, [prompt, formValues]);

  // Word count and token estimation
  const wordCount = useMemo(() => (renderedText.match(/\S+/g) || []).length, [renderedText]);
  const estimatedTokens = useMemo(() => Math.ceil(renderedText.length / 3.8), [renderedText]);

  if (!isOpen || !prompt) return null;

  const handleFieldChange = (name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleResetDefaults = () => {
    const defaults: Record<string, string> = {};
    placeholders.forEach(ph => {
      defaults[ph.name] = ph.defaultValue || (ph.options?.[0] || '');
    });
    setFormValues(defaults);
    onShowToast?.('שדות התבנית אופסו לברירת המחדל', 'info');
  };

  const handleSaveAsPreset = () => {
    try {
      const storageKey = `promptvault_template_${prompt.id}`;
      localStorage.setItem(storageKey, JSON.stringify(formValues));
      onShowToast?.('ערכי התבנית נשמרו לפעם הבאה!', 'success');
    } catch {
      onShowToast?.('שגיאה בשמירת ערכי התבנית', 'error');
    }
  };

  const handleCopyRendered = () => {
    if (onComplete) {
      onComplete(renderedText);
    } else {
      navigator.clipboard.writeText(renderedText);
    }
    setCopied(true);
    onShowToast?.('הפרומפט הממולא הועתק ללוח בהצלחה!', 'success');
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  const handleSendToSandbox = () => {
    if (onTestInSandbox) {
      onTestInSandbox(renderedText);
    } else {
      navigator.clipboard.writeText(renderedText);
      const startBtn = document.getElementById('start-test-btn');
      startBtn?.click();
    }
    onShowToast?.('הפרומפט הממולא נטען ל-Sandbox!', 'info');
    onClose();
  };

  // Add a new custom placeholder to the template
  const handleAddCustomPlaceholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhName.trim()) return;

    const cleanKey = newPhName.trim().replace(/[\s-]+/g, '_').toLowerCase();
    const existingDefs = prompt.customPlaceholders || [];

    if (existingDefs.some(d => d.name.toLowerCase() === cleanKey)) {
      onShowToast?.('שדה עם מזהה זה כבר קיים בתבנית', 'error');
      return;
    }

    const optionsArray = newPhType === 'select'
      ? newPhOptions.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const newDef: CustomPlaceholder = {
      id: `ph_${Date.now()}`,
      name: cleanKey,
      label: newPhLabel.trim() || cleanKey,
      type: newPhType,
      defaultValue: newPhDefault.trim() || (optionsArray?.[0] || ''),
      options: optionsArray,
      description: newPhDesc.trim(),
      required: true
    };

    const updatedDefs = [...existingDefs, newDef];
    
    // Auto-insert placeholder syntax {{cleanKey}} at the end of prompt content if not present
    let updatedContent = prompt.content || '';
    const phTag = `{{${cleanKey}}}`;
    if (!updatedContent.includes(cleanKey)) {
      updatedContent = `${updatedContent.trim()}\n\n[${newDef.label}]: ${phTag}`;
    }

    const updatedPrompt = {
      ...prompt,
      customPlaceholders: updatedDefs,
      content: updatedContent,
      updatedAt: new Date().toISOString()
    };

    onUpdatePrompt?.(updatedPrompt);

    // Reset inputs
    setNewPhName('');
    setNewPhLabel('');
    setNewPhDefault('');
    setNewPhOptions('');
    setNewPhDesc('');
    setNewPhType('text');
    setActiveTab('fill');

    onShowToast?.(`השדה {{${cleanKey}}} נוצר ונוסף לפרומפט!`, 'success');
  };

  // Remove a custom placeholder definition
  const handleDeletePlaceholder = (defId: string) => {
    const existingDefs = prompt.customPlaceholders || [];
    const updatedDefs = existingDefs.filter(d => d.id !== defId);
    const updatedPrompt = {
      ...prompt,
      customPlaceholders: updatedDefs,
      updatedAt: new Date().toISOString()
    };
    onUpdatePrompt?.(updatedPrompt);
    onShowToast?.('השדה הוסר מהגדרות התבנית', 'info');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-right"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                      מנוע תבניות ומילוי שדות חכמים
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                      {placeholders.length} שדות
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                    {prompt.title}
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('fill')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'fill' 
                      ? 'bg-white dark:bg-[#202020] text-indigo-600 dark:text-indigo-400 shadow-xs' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>טופס מילוי והעתקה</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('define')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'define' 
                      ? 'bg-white dark:bg-[#202020] text-indigo-600 dark:text-indigo-400 shadow-xs' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>הגדרת שדות חדשים</span>
                </button>
              </div>

              <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors mr-2"
                title="סגור"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeTab === 'fill' ? (
                placeholders.length === 0 ? (
                  <div className="text-center py-12 px-4 max-w-md mx-auto space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 mx-auto flex items-center justify-center">
                      <HelpCircle className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">לא זוהו שדות בתבנית זו</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      הוסף משתנים לפרומפט באמצעות סוגריים מסולסלים כגון <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 font-mono text-indigo-600 dark:text-indigo-400">{"{{נושא}}"}</code>, או לחץ על הלשונית "הגדרת שדות חדשים" כדי ליצור שדות מותאמים אישית.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('define')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>הגדר שדה מותאם אישית עכשיו</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Form Fields */}
                    <div className="lg:col-span-6 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          הזן את ערכי השדות
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleResetDefaults}
                            className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
                            title="אפס לברירת המחדל"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>איפוס</span>
                          </button>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <button
                            type="button"
                            onClick={handleSaveAsPreset}
                            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold transition-colors"
                            title="שמור ערכים נוכחיים כברירת מחדל"
                          >
                            <BookmarkCheck className="w-3 h-3" />
                            <span>שמור ערכים</span>
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Form Controls */}
                      <div className="space-y-3.5 max-h-[55vh] overflow-y-auto pr-1">
                        {placeholders.map((ph) => {
                          const val = formValues[ph.name] || '';

                          return (
                            <div 
                              key={ph.name} 
                              className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-colors space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                                  {ph.label}
                                </label>
                                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded">
                                  {`{{${ph.name}}}`}
                                </span>
                              </div>

                              {ph.description && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                  {ph.description}
                                </p>
                              )}

                              {/* Form Field according to type */}
                              {ph.type === 'select' && ph.options && ph.options.length > 0 ? (
                                <div className="relative">
                                  <select
                                    value={val}
                                    onChange={(e) => handleFieldChange(ph.name, e.target.value)}
                                    className="w-full appearance-none bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all pr-8"
                                  >
                                    {ph.options.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                              ) : ph.type === 'textarea' ? (
                                <textarea
                                  value={val}
                                  onChange={(e) => handleFieldChange(ph.name, e.target.value)}
                                  placeholder={ph.defaultValue || `הזן ${ph.label}...`}
                                  className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-y min-h-[70px]"
                                  dir="auto"
                                />
                              ) : ph.type === 'date' ? (
                                <div className="relative">
                                  <input
                                    type="date"
                                    value={val}
                                    onChange={(e) => handleFieldChange(ph.name, e.target.value)}
                                    className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                  />
                                </div>
                              ) : ph.type === 'number' ? (
                                <input
                                  type="number"
                                  value={val}
                                  onChange={(e) => handleFieldChange(ph.name, e.target.value)}
                                  placeholder={ph.defaultValue || '0'}
                                  className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={val}
                                  onChange={(e) => handleFieldChange(ph.name, e.target.value)}
                                  placeholder={ph.defaultValue || `הזן ${ph.label}...`}
                                  className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                  dir="auto"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: Live Rendered Output */}
                    <div className="lg:col-span-6 flex flex-col h-full space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            תצוגה מקדימה בזמן אמת
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({wordCount} מילים • ~{estimatedTokens} טוקנים)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setHighlightVariables(!highlightVariables)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
                        >
                          {highlightVariables ? <Eye className="w-3.5 h-3.5 text-indigo-500" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{highlightVariables ? 'הדגש שדות' : 'טקסט נקי'}</span>
                        </button>
                      </div>

                      {/* Rendered Container */}
                      <div className="flex-1 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[50vh] min-h-[300px] whitespace-pre-wrap selection:bg-indigo-200 dark:selection:bg-indigo-900/50">
                        {renderedText}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* Define Custom Placeholders Tab */
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                      <strong className="font-bold">מנוע התבניות של PandaPrompt</strong> מאפשר לך להגדיר שדות דינמיים מותאמים אישית (טקסט, תפריט בחירה, תאריך או מספר). בעת העתקה או בדיקה, הטופס יבקש למלא שדות אלה ויחליף אותם אוטומטית.
                    </div>
                  </div>

                  {/* Form to define a new placeholder */}
                  <form onSubmit={handleAddCustomPlaceholder} className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-4">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-indigo-500" />
                      <span>הגדרת שדה חדש לתבנית</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          מזהה שדה (באנגלית, ללא רווחים) *
                        </label>
                        <input
                          type="text"
                          required
                          value={newPhName}
                          onChange={(e) => setNewPhName(e.target.value)}
                          placeholder="למשל: customer_name, tone, topic"
                          className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          כותרת לתצוגה (בעברית) *
                        </label>
                        <input
                          type="text"
                          required
                          value={newPhLabel}
                          onChange={(e) => setNewPhLabel(e.target.value)}
                          placeholder="למשל: שם הלקוח, טון דיבור, נושא"
                          className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          סוג שדה קלט
                        </label>
                        <select
                          value={newPhType}
                          onChange={(e) => setNewPhType(e.target.value as CustomPlaceholder['type'])}
                          className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                          <option value="text">טקסט קצר (Input)</option>
                          <option value="textarea">פסקת טקסט מרובת שורות (Textarea)</option>
                          <option value="select">תפריט בחירה מרובה (Dropdown)</option>
                          <option value="number">מספר (Number)</option>
                          <option value="date">תאריך (Date)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          ערך ברירת מחדל
                        </label>
                        <input
                          type="text"
                          value={newPhDefault}
                          onChange={(e) => setNewPhDefault(e.target.value)}
                          placeholder="ערך שימולא אוטומטית..."
                          className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                    </div>

                    {newPhType === 'select' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                          אפשרויות לבחירה (מופרדות בפסיקים) *
                        </label>
                        <input
                          type="text"
                          required
                          value={newPhOptions}
                          onChange={(e) => setNewPhOptions(e.target.value)}
                          placeholder="למשל: מקצועי, קליל, שיווקי, אקדמי"
                          className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        הסבר / הנחיה למשתמש (אופציונלי)
                      </label>
                      <input
                        type="text"
                        value={newPhDesc}
                        onChange={(e) => setNewPhDesc(e.target.value)}
                        placeholder="הסבר קצר על מה יש להזין כאן..."
                        className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>הוסף שדה לתבנית והכנס לפרומפט</span>
                      </button>
                    </div>
                  </form>

                  {/* List of currently defined custom placeholders */}
                  {(prompt.customPlaceholders || []).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">
                        שדות מותאמים אישית שהוגדרו ({prompt.customPlaceholders?.length})
                      </h4>

                      <div className="space-y-2">
                        {prompt.customPlaceholders?.map((def) => (
                          <div
                            key={def.id}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] flex items-center justify-between"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                  {def.label}
                                </span>
                                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                                  {`{{${def.name}}}`}
                                </span>
                                <span className="text-[10px] text-slate-400 border border-slate-200 dark:border-white/10 px-1.5 py-0.2 rounded">
                                  {def.type}
                                </span>
                              </div>
                              {def.options && (
                                <p className="text-[11px] text-slate-500 truncate">
                                  אפשרויות: {def.options.join(', ')}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeletePlaceholder(def.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                              title="הסר שדה"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0c0c0c] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {placeholders.length} משתנים פעילים
                </span>
                <span>•</span>
                <span>התוצאה מעודכנת בזמן אמת</span>
              </div>

              <div className="flex items-center gap-2">
                {onTestInSandbox && (
                  <button
                    type="button"
                    onClick={handleSendToSandbox}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 font-bold text-xs transition-all shadow-2xs"
                  >
                    <Play className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                    <span>בדוק ב-Sandbox</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyRendered}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-md cursor-pointer ${
                    copied 
                      ? 'bg-emerald-600 hover:bg-emerald-700 scale-105' 
                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                  }`}
                >
                  {copied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
                  <span>{copied ? 'הועתק ללוח!' : 'העתק פרומפט סופי'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
