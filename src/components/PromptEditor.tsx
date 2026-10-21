import { apiFetch } from '../utils/api';
import * as React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Loader2, GitMerge, FileText, Check, CopyPlus, Save, Tag, Folder as FolderIcon, Box, Calendar, Link2, BookOpen, AlertTriangle, Trash2, Plus, Terminal, Shield, BarChart2, Wand2, X, MoreHorizontal, SlidersHorizontal, Image as ImageIcon, Code2, Bell, Layers, Clock, Zap, Bold, Italic, Heading, List, ListOrdered, Quote, Maximize2, Minimize2, Mic, MicOff, Activity
} from 'lucide-react';
import { ReadabilityScore } from './ReadabilityScore';
import { PromptReadabilityBar } from './PromptReadabilityBar';
import { PromptReadabilityDashboard } from './PromptReadabilityDashboard';
import { DuplicateTitleModal } from './DuplicateTitleModal';
import { ComplexityScoreBadge } from './ComplexityScoreBadge';
import { AiMetadataSuggestions } from './AiMetadataSuggestions';
import { TagCombobox } from './TagCombobox';
import Editor from 'react-simple-code-editor';
import * as Prism from 'prismjs';
import { Prompt, Folder, PlatformConfig, Category, PromptReminder } from '../types';
import { diffWords } from 'diff';

export interface PromptEditorProps {
  editingPrompt: any;
  setEditingPrompt: (p: any) => void;
  isRefining: boolean;
  handleRefinePrompt: () => void;
  showInlineDiff: boolean;
  setShowInlineDiff: (b: boolean) => void;
  handleSave: (p: any) => void;
  
  
  folders: Folder[];
  setIsNewFolderModalOpen: (b: boolean) => void;
  categories?: Category[];
  onOpenManageCategories?: () => void;
  
  chainNextPromptId?: string;
  prompts: Prompt[];
  checkPromptValidation: (content: string) => string | null;
  
  handleVarSelect: (v: string) => void;
  t: (key: string) => string;
  setIsRefining: (b: boolean) => void;
  setIsEditing: (b: boolean) => void;
  setSelectedPromptId: (id: string | null) => void;
  setCurrentView: (view: any) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
  handleMagicSuggest: () => void;
  isMagicSuggesting: boolean;
  magicSuggestions: any;
  setMagicSuggestions: (val: any) => void;
  handleContentChange: (e: any) => void;
  varSuggest: any;
  COMMON_VARS: any[];
  mlSuggestedFolder: any;
  handleAutoTag: () => void;
  isAutoTagging: boolean;
  allTags: string[];
  onOpenTemplateModal?: () => void;
}

export function PromptEditor({
  editingPrompt, setEditingPrompt, isRefining, handleRefinePrompt, showInlineDiff, setShowInlineDiff,
  handleSave, folders, setIsNewFolderModalOpen, categories = [], onOpenManageCategories, prompts, checkPromptValidation,
  handleVarSelect, t, 
  setIsRefining, setIsEditing, setSelectedPromptId, setCurrentView, showToast, handleMagicSuggest,
  isMagicSuggesting, magicSuggestions, setMagicSuggestions, handleContentChange, varSuggest,
  COMMON_VARS, mlSuggestedFolder, handleAutoTag, isAutoTagging, allTags, onOpenTemplateModal
}: PromptEditorProps) {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = React.useState(false);
  const [editorFontMode, setEditorFontMode] = React.useState<'sans' | 'mono'>('sans');
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = React.useState(false);
  const [isZenMode, setIsZenMode] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const titleInputRef = React.useRef<HTMLInputElement>(null);

  const handleToggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("דפדפן זה אינו תומך בהקלטה קולית (Speech-to-Text). נסה את Google Chrome.", "error");
      return;
    }
    if (isRecording) {
      if ((window as any).__activeRecognition) {
        try { (window as any).__activeRecognition.stop(); } catch(e) {}
      }
      setIsRecording(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'he-IL';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        showToast("הקלטה קולית החלה... דבר אל המיקרופון (עברית / אנגלית)", "info");
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript.trim()) {
          const current = editingPrompt?.content || '';
          const separator = current && !current.endsWith(' ') ? ' ' : '';
          setEditingPrompt({ ...editingPrompt, content: current + separator + finalTranscript.trim() });
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        showToast("שגיאה בהקלטה הקולית: " + event.error, "error");
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      (window as any).__activeRecognition = recognition;
      recognition.start();
    } catch (e: any) {
      console.error(e);
      setIsRecording(false);
      showToast("לא ניתן להפעיל זיהוי קול", "error");
    }
  };

  const insertFormatting = (wrapperPrefix: string, wrapperSuffix: string = '', defaultText: string = 'טקסט') => {
    const textarea = document.getElementById('prompt-content-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      const current = editingPrompt?.content || '';
      setEditingPrompt({ ...editingPrompt, content: current + wrapperPrefix + defaultText + wrapperSuffix });
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editingPrompt?.content || '';
    const selectedText = text.substring(start, end) || defaultText;
    const replacement = wrapperPrefix + selectedText + wrapperSuffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setEditingPrompt({ ...editingPrompt, content: newContent });
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + wrapperPrefix.length, start + wrapperPrefix.length + selectedText.length);
    }, 50);
  };

  const targetFolderId = editingPrompt?.folder || (folders.length > 0 ? folders[0].id : '');
  const trimmedTitle = (editingPrompt?.title || '').trim().toLowerCase();

  const duplicatePromptInFolder = React.useMemo(() => {
    if (!trimmedTitle) return null;
    return (prompts || []).find(p => 
      p.id !== editingPrompt?.id && 
      (p.folder || '') === targetFolderId && 
      (p.title || '').trim().toLowerCase() === trimmedTitle
    );
  }, [prompts, editingPrompt?.id, targetFolderId, trimmedTitle]);

  const readabilityAnalysis = React.useMemo(() => {
    const contentText = editingPrompt?.content || '';
    if (!contentText.trim()) return { score: 0, complexity: 'ריק', passiveCount: 0, longSentences: 0, avgWordsPerSentence: 0, tips: ['הזן תוכן לפרומפט כדי לקבל ניתוח קריאות ו-NLP.'] };
    const sentences = contentText.split(/[.!?\n]+/).filter(Boolean);
    const words = contentText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const avgWordsPerSentence = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;
    
    const hebrewPassives = /(הוכן|נכתב|בוצע|נוצר|מתבצע|נבחן|מנוהל|מתוכנן)/g;
    const englishPassives = /\b(is|are|was|were|been|being)\s+[a-z]+ed\b/gi;
    const passiveMatches = (contentText.match(hebrewPassives) || []).length + (contentText.match(englishPassives) || []).length;
    
    const longSentences = sentences.filter(s => s.trim().split(/\s+/).length > 25).length;
    
    let score = 90;
    if (avgWordsPerSentence > 30) score -= 20;
    else if (avgWordsPerSentence > 20) score -= 10;
    if (passiveMatches > 2) score -= (passiveMatches * 5);
    if (longSentences > 0) score -= (longSentences * 5);
    score = Math.max(30, Math.min(100, score));

    const tips: string[] = [];
    if (avgWordsPerSentence > 20) tips.push('משפטים ארוכים: מומלץ לקצר כדי לשפר את בהירות ההנחיות למודל ה-AI.');
    if (passiveMatches > 0) tips.push(`זוהו ${passiveMatches} מבני סביל (Passive Voice): עדיף לנסח בניסוח פעיל וישיר.`);
    if (longSentences > 0) tips.push(`${longSentences} משפטים חורגים מ-25 מילים.`);
    if (tips.length === 0) tips.push('מבנה הטקסט מצוין! נקי, בהיר ומתאים היטב לעיבוד מדויק.');

    return {
      score,
      wordCount,
      avgWordsPerSentence,
      passiveCount: passiveMatches,
      longSentences,
      complexity: avgWordsPerSentence > 22 ? 'מורכב' : avgWordsPerSentence > 12 ? 'בינוני' : 'פשוט ובהיר',
      tips
    };
  }, [editingPrompt?.content]);

  const handleSaveClick = () => {
    if (duplicatePromptInFolder) {
      setIsDuplicateModalOpen(true);
      return;
    }
    handleSave(editingPrompt || {});
  };

  return (
    
              <motion.div key="editing" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-[#0a0a0a] ${isZenMode ? 'fixed inset-0 z-[120] bg-white dark:bg-[#0c0c0c] p-6 md:p-12' : ''}`}>
                <div className="max-w-6xl mx-auto space-y-6">
                  {/* Clean Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {editingPrompt?.id ? 'ערוך פרומפט' : 'פרומפט חדש'}
                      </h2>
                      {/* Integrated Readability and Complexity Score Badges */}
                      <ComplexityScoreBadge content={editingPrompt?.content || ''} title={editingPrompt?.title} />
                      <ReadabilityScore content={editingPrompt?.content || ''} />
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap justify-end">
                      {/* Zen Focus Mode Button */}
                      <button
                        type="button"
                        onClick={async () => {
                          const nextZen = !isZenMode;
                          setIsZenMode(nextZen);
                          if (nextZen) {
                            try {
                              if (document.documentElement.requestFullscreen) {
                                await document.documentElement.requestFullscreen();
                              }
                            } catch (e) {}
                            try {
                              if ('wakeLock' in navigator) {
                                (window as any).__wakeLock = await (navigator as any).wakeLock.request('screen');
                              }
                            } catch (e) {}
                          } else {
                            try {
                              if (document.fullscreenElement && document.exitFullscreen) {
                                await document.exitFullscreen();
                              }
                            } catch (e) {}
                            try {
                              if ((window as any).__wakeLock) {
                                await (window as any).__wakeLock.release();
                                (window as any).__wakeLock = null;
                              }
                            } catch (e) {}
                          }
                        }}
                        className={`px-3 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors ${
                          isZenMode 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161616] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                        title="מצב כתיבה ממוקד (מסך מלא אמיתי + נעילת מסך מניעת כיבוי)"
                      >
                        {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        <span>{isZenMode ? 'צא ממצב ממוקד' : 'מצב כתיבה ממוקד'}</span>
                      </button>
                      {/* AI Optimize Button */}
                      <button 
                        type="button"
                        disabled={isRefining} 
                        onClick={handleRefinePrompt} 
                        className="px-3.5 py-2 rounded-xl font-bold text-purple-600 dark:text-purple-400 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 transition-colors text-xs sm:text-sm flex items-center gap-1.5"
                        title="שיפור וליטוש הניסוח בעזרת Gemini"
                      >
                        {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        <span>שפר ניסוח (AI)</span>
                      </button>

                      {/* Secondary Tools Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161616] hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                          <span>כלים נוספים</span>
                        </button>

                        {isMoreMenuOpen && (
                          <div 
                            className="absolute start-0 sm:end-0 mt-2 w-56 bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-1.5 z-50 text-xs font-bold space-y-1"
                            onClick={() => setIsMoreMenuOpen(false)}
                          >
                            <button 
                              type="button"
                              onClick={() => setShowInlineDiff(!showInlineDiff)} 
                              className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              <GitMerge className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{showInlineDiff ? 'הסתר שינויים (Diff)' : 'הצג שינויים (Diff)'}</span>
                            </button>

                            <button 
                              type="button"
                              disabled={isRefining} 
                              onClick={async () => {
                                setIsRefining(true);
                                try {
                                  const key = localStorage.getItem("promptvault_gemini_key") || "";
                                  const res = await apiFetch("/api/gemini/chat", {
                                     method: "POST",
                                     headers: { "Content-Type": "application/json", ...(key ? { "x-gemini-api-key": key } : {}) },
                                     body: JSON.stringify({
                                       systemInstruction: "You are a cybersecurity expert specializing in Prompt Injection and LLM vulnerabilities. Analyze the following prompt for potential injection risks, jailbreaks, or data leakage. Provide a short, direct security report in Hebrew.",
                                       messages: [{ role: "user", content: editingPrompt?.content || "" }]
                                     })
                                  });
                                  const data = await res.json();
                                  if (data.text) {
                                    showToast("סריקת אבטחה הושלמה בהצלחה!", "info");
                                  }
                                } catch(e) { console.error(e); }
                                setIsRefining(false);
                              }} 
                              className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-rose-600 dark:text-rose-400 transition-colors"
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span>סריקת אבטחה (Red Teaming)</span>
                            </button>

                            <button 
                              type="button"
                              onClick={() => {
                                setCurrentView("workflows");
                                setIsEditing(false);
                              }} 
                              className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              <GitMerge className="w-3.5 h-3.5 text-purple-500" />
                              <span>עבור לשרשרת ויזואלית</span>
                            </button>

                            <button 
                              type="button"
                              onClick={() => {
                                if (editingPrompt) {
                                  const vCount = (editingPrompt?.history?.length || 0) + 1;
                                  const versionName = `גרסה ${vCount} (${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`;
                                  handleSave({...editingPrompt, currentVersionName: versionName});
                                  showToast('נשמר כגרסה מיוחדת: ' + versionName, 'version');
                                }
                              }} 
                              className="w-full text-right flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-indigo-600 dark:text-indigo-400 transition-colors"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>שמור כגרסה מיוחדת</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Cancel */}
                      <button 
                        type="button"
                        onClick={() => { setIsEditing(false); if(!editingPrompt?.id) setSelectedPromptId(null); }} 
                        className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-xs sm:text-sm"
                      >
                        ביטול
                      </button>
                      
                      {/* Primary Save */}
                      <button 
                        type="button"
                        onClick={handleSaveClick} 
                        className="px-5 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02] text-xs sm:text-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>שמור שינויים</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Main Content Column */}
                    <div className="xl:col-span-2 space-y-6">
                      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6">
                        
                        {/* Prompt Type Selector */}
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            סוג הפרומפט (Prompt Type)
                          </label>
                          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl">
                            <button
                              type="button"
                              onClick={() => setEditingPrompt({ ...editingPrompt, type: 'text' })}
                              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                                (!editingPrompt?.type || editingPrompt?.type === 'text')
                                  ? 'bg-white dark:bg-[#1a1a1a] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-white/10'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <FileText className="w-4 h-4 text-blue-500" />
                              <span>טקסט / LLM</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingPrompt({ 
                                ...editingPrompt, 
                                type: 'image',
                                imageModel: editingPrompt?.imageModel || 'Midjourney v6',
                                aspectRatio: editingPrompt?.aspectRatio || '1:1'
                              })}
                              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                                editingPrompt?.type === 'image'
                                  ? 'bg-white dark:bg-[#1a1a1a] text-purple-600 dark:text-purple-400 shadow-sm border border-slate-200/50 dark:border-white/10'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <ImageIcon className="w-4 h-4 text-purple-500" />
                              <span>תמונה (Image AI)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingPrompt({ 
                                ...editingPrompt, 
                                type: 'code',
                                codeLanguage: editingPrompt?.codeLanguage || 'TypeScript'
                              })}
                              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                                editingPrompt?.type === 'code'
                                  ? 'bg-white dark:bg-[#1a1a1a] text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-white/10'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              <Code2 className="w-4 h-4 text-emerald-500" />
                              <span>קוד ותכנות (Code)</span>
                            </button>
                          </div>
                        </div>

                        {/* Image Specific Configuration Panel */}
                        {editingPrompt?.type === 'image' && (
                          <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 rounded-2xl space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-purple-800 dark:text-purple-300">
                              <ImageIcon className="w-4 h-4 text-purple-500" />
                              <span>הגדרות מחולל תמונות (Image Generator Parameters)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">מודל יעד</label>
                                <select
                                  value={editingPrompt?.imageModel || 'Midjourney v6'}
                                  onChange={e => setEditingPrompt({ ...editingPrompt, imageModel: e.target.value })}
                                  className="w-full bg-white dark:bg-[#1a1a1a] border border-purple-200 dark:border-purple-800/50 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  {['Midjourney v6', 'FLUX.1 [dev]', 'FLUX.1 [schnell]', 'DALL-E 3', 'Imagen 3', 'Stable Diffusion XL'].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">יחס תמונה (Aspect Ratio)</label>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {['1:1', '16:9', '9:16', '4:3'].map(ar => (
                                    <button
                                      key={ar}
                                      type="button"
                                      onClick={() => setEditingPrompt({ ...editingPrompt, aspectRatio: ar })}
                                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                                        (editingPrompt?.aspectRatio || '1:1') === ar
                                          ? 'bg-purple-600 text-white shadow-xs'
                                          : 'bg-white dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300 border border-purple-200/60 dark:border-purple-800/40 hover:bg-purple-50'
                                      }`}
                                    >
                                      {ar}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">פרומפט שלילי (Negative Prompt - מה לא לכלול)</label>
                              <input
                                type="text"
                                value={editingPrompt?.negativePrompt || ''}
                                onChange={e => setEditingPrompt({ ...editingPrompt, negativePrompt: e.target.value })}
                                placeholder="לדוגמה: blurry, low quality, distorted hands, watermark, text"
                                className="w-full bg-white dark:bg-[#1a1a1a] border border-purple-200 dark:border-purple-800/50 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        )}

                        {/* Code Specific Configuration Panel */}
                        {editingPrompt?.type === 'code' && (
                          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                              <Code2 className="w-4 h-4 text-emerald-500" />
                              <span>הגדרות פיתוח וקוד (Code & Programming)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">שפת תכנות ראשית</label>
                                <select
                                  value={editingPrompt?.codeLanguage || 'TypeScript'}
                                  onChange={e => setEditingPrompt({ ...editingPrompt, codeLanguage: e.target.value })}
                                  className="w-full bg-white dark:bg-[#1a1a1a] border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                  {['TypeScript', 'JavaScript', 'Python', 'React / TSX', 'SQL', 'Rust', 'Go', 'HTML / CSS', 'Bash / Shell', 'C# / .NET', 'PHP'].map(l => (
                                    <option key={l} value={l}>{l}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">פריימוורק / סביבה (אופציונלי)</label>
                                <input
                                  type="text"
                                  value={editingPrompt?.codeFramework || ''}
                                  onChange={e => setEditingPrompt({ ...editingPrompt, codeFramework: e.target.value })}
                                  placeholder="לדוגמה: Next.js 14, FastAPI, Tailwind CSS"
                                  className="w-full bg-white dark:bg-[#1a1a1a] border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">כותרת הפרומפט</label>
                          <input
                            ref={titleInputRef}
                            type="text"
                            value={editingPrompt?.title || ""}
                            onChange={(e) => setEditingPrompt({...editingPrompt, title: e.target.value})}
                            placeholder="לדוגמה: כתיבת פוסט ללינקדאין..."
                            className={`w-full bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl px-4 py-3 outline-none focus:ring-2 font-bold text-slate-900 dark:text-white transition-all ${
                              duplicatePromptInFolder
                                ? 'border-amber-400 dark:border-amber-600 focus:ring-amber-500/50'
                                : 'border-slate-200 dark:border-white/10 focus:ring-indigo-500/50'
                            }`}
                          />
                          {duplicatePromptInFolder && (
                            <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                              <div>
                                <span className="font-bold">אזהרת כפילות שם בתיקייה:</span> כבר קיים פרומפט עם השם &quot;{duplicatePromptInFolder.title}&quot; בתיקייה &quot;{folders.find(f => f.id === targetFolderId)?.name || 'כללי'}&quot;. מומלץ לבחור שם ייחודי.
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תיאור קצר</label>
                          <input
                            type="text"
                            value={editingPrompt?.description || ""}
                            onChange={(e) => setEditingPrompt({...editingPrompt, description: e.target.value})}
                            placeholder="תיאור קצר של מטרת הפרומפט..."
                            className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-slate-600 dark:text-slate-300"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">תוכן הפרומפט</label>
                            <div className="flex items-center gap-2">
                               <div className="flex items-center p-0.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200/60 dark:border-white/5 text-[10px] font-bold">
                                 <button
                                   type="button"
                                   onClick={() => setEditorFontMode('sans')}
                                   className={`px-2 py-0.5 rounded-md transition-all ${
                                     editorFontMode === 'sans' ? 'bg-white dark:bg-[#222] text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-500'
                                   }`}
                                 >
                                   טקסט
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => setEditorFontMode('mono')}
                                   className={`px-2 py-0.5 rounded-md transition-all ${
                                     editorFontMode === 'mono' ? 'bg-white dark:bg-[#222] text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-500'
                                   }`}
                                 >
                                   קוד
                                 </button>
                               </div>
                               <div className="px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-medium flex items-center gap-1">
                                 <BarChart2 className="w-3 h-3" />
                                 ~{Math.ceil((editingPrompt.content || '').length / 4)} טוקנים
                               </div>
                               <div className="flex items-center gap-1.5">
                                 {onOpenTemplateModal && (
                                   <button 
                                     type="button"
                                     onClick={onOpenTemplateModal}
                                     className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                     title="מנוע תבניות - הגדרת שדות ומילוי טופס"
                                   >
                                     <SlidersHorizontal className="w-3 h-3" />
                                     <span>שדות ותבנית</span>
                                   </button>
                                 )}
                                 <button onClick={handleMagicSuggest} disabled={isMagicSuggesting || !editingPrompt.content?.trim()} className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50">
                                   {isMagicSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                   {isMagicSuggesting ? 'מנתח...' : 'שפר בעזרת Magic AI'}
                                 </button>
                               </div>
                            </div>
                          </div>
                          
                          {magicSuggestions && (
                            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 rounded-xl relative">
                              <button onClick={() => setMagicSuggestions(null)} className="absolute top-2 right-2 text-purple-400 hover:text-purple-600">
                                <X className="w-3 h-3" />
                              </button>
                              <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1 mb-2">
                                <Sparkles className="w-3 h-3" /> Magic Insights:
                              </h4>
                              {magicSuggestions.missingRole && (
                                <p className="text-xs text-purple-700 dark:text-purple-400 mb-1">
                                  <strong>תפקיד מומלץ (Role Prompting):</strong> {magicSuggestions.missingRole}
                                </p>
                              )}
                              {magicSuggestions.suggestedVariables?.length > 0 && (
                                <p className="text-xs text-purple-700 dark:text-purple-400 mb-1">
                                  <strong>משתנים שחסרים:</strong> {magicSuggestions.suggestedVariables.map(v => `$(${v})`).join(', ')}
                                </p>
                              )}
                              {magicSuggestions.improvements?.length > 0 && (
                                <ul className="text-xs text-purple-700 dark:text-purple-400 list-disc list-inside">
                                  {magicSuggestions.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                                </ul>
                              )}
                            </div>
                          )}

                          {/* Real-time Readability Score & Simplification Assistant */}
                          <div className="mb-3 space-y-3">
                            <PromptReadabilityBar
                              content={editingPrompt?.content || ""}
                              onApplySimplifiedText={(newText) => setEditingPrompt({ ...editingPrompt, content: newText })}
                              showToast={showToast}
                            />
                            <PromptReadabilityDashboard
                              content={editingPrompt?.content || ""}
                              onApplyImprovement={(improved) => setEditingPrompt({ ...editingPrompt, content: improved })}
                              showToast={showToast}
                            />
                          </div>

                          {/* Rich Text / Markdown Formatting Toolbar */}
                          <div className="flex items-center justify-between gap-2 p-1.5 mb-2 bg-slate-100 dark:bg-[#161616] border border-slate-200/80 dark:border-white/10 rounded-xl flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button type="button" onClick={() => insertFormatting('**', '**', 'טקסט מודגש')} className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1" title="הדגשה (Bold)">
                                <Bold className="w-3.5 h-3.5 text-indigo-500" /> מודגש
                              </button>
                              <button type="button" onClick={() => insertFormatting('*', '*', 'טקסט נטוי')} className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 italic text-xs flex items-center gap-1" title="נטוי (Italic)">
                                <Italic className="w-3.5 h-3.5 text-indigo-500" /> נטוי
                              </button>
                              <button type="button" onClick={() => insertFormatting('## ', '', 'כותרת ראשית')} className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1" title="כותרת (Heading)">
                                <Heading className="w-3.5 h-3.5 text-indigo-500" /> כותרת
                              </button>
                              <button type="button" onClick={() => insertFormatting('\n- ', '', 'פריט ברשימה')} className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1" title="רשימת תבליטים">
                                <List className="w-3.5 h-3.5 text-indigo-500" /> רשימה
                              </button>
                              <button type="button" onClick={() => insertFormatting('\n1. ', '', 'פריט ממוספר')} className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1" title="רשימה ממוספרת">
                                <ListOrdered className="w-3.5 h-3.5 text-indigo-500" /> ממוספרת
                              </button>
                              <button type="button" onClick={() => insertFormatting('\n```\n', '\n```\n', 'קוד או סקריפט')} className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-mono text-xs flex items-center gap-1" title="בלוק קוד">
                                <Code2 className="w-3.5 h-3.5 text-indigo-500" /> קוד
                              </button>
                              <button type="button" onClick={() => insertFormatting('> ', '', 'ציטוט או הערה חשובה')} className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1" title="ציטוט (Quote)">
                                <Quote className="w-3.5 h-3.5 text-indigo-500" /> ציטוט
                              </button>
                              <button type="button" onClick={() => insertFormatting('{{', '}}', 'שם_משתנה')} className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-white/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1" title="הוסף משתנה דינמי">
                                <SlidersHorizontal className="w-3.5 h-3.5" /> משתנה
                              </button>
                            </div>

                            {/* Voice Recording Button */}
                            <button
                              type="button"
                              onClick={handleToggleRecording}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                                isRecording
                                  ? 'bg-rose-600 text-white animate-pulse shadow-md'
                                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/50 dark:border-indigo-800/50'
                              }`}
                              title="הקלטה קולית לטקסט (Speech-to-Text) בעברית או אנגלית"
                            >
                              {isRecording ? <MicOff className="w-3.5 h-3.5 animate-spin" /> : <Mic className="w-3.5 h-3.5" />}
                              <span>{isRecording ? 'מקליט... (לחץ לעצירה)' : 'הקלטה קולית (Voice)'}</span>
                            </button>
                          </div>

                          <div className="relative">
                            <textarea
                              id="prompt-content-textarea"
                              value={editingPrompt?.content || ""}
                              onChange={handleContentChange}
                              placeholder="הכנס את הפרומפט שלך כאן (כתוב הנחיות, שאלות או מבנה ברור או השתמש בהקלטה קולית)..."
                              className={`w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y min-h-[250px] leading-relaxed transition-all ${
                                editorFontMode === 'sans'
                                  ? 'font-sans text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400'
                                  : 'font-mono text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-500'
                              }`}
                              dir="auto"
                            />
                            <div className="absolute bottom-3 left-3 text-[10px] font-bold text-slate-400 bg-white/80 dark:bg-black/80 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                              ~{Math.ceil((editingPrompt?.content?.length || 0) / 3.5)} טוקנים
                            </div>
                            {varSuggest.show && (
                              <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
                                <div className="p-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">משתנים נפוצים</div>
                                {COMMON_VARS.filter(v => v.name.includes(varSuggest.filter)).map(v => (
                                  <button
                                    key={v.name}
                                    onClick={() => handleVarSelect(v.name)}
                                    className="w-full text-right px-4 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-700 dark:text-slate-300 transition-colors"
                                  >
                                    <div className="font-bold">{v.name}</div>
                                    <div className="text-[10px] text-slate-500">{v.desc}</div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {checkPromptValidation(editingPrompt?.content || '') && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-3 rounded-xl flex items-start gap-2 text-amber-700 dark:text-amber-400 text-xs mt-3">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{checkPromptValidation(editingPrompt?.content || '')}</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">פלט לדוגמה (Preview Output)</label>
                          <textarea
                            value={editingPrompt?.exampleOutput || ""}
                            onChange={(e) => setEditingPrompt({...editingPrompt, exampleOutput: e.target.value})}
                            placeholder="הוסף דוגמה של הפלט שהפרומפט הזה מייצר..."
                            className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-mono text-slate-800 dark:text-slate-200 resize-y min-h-[120px]"
                            dir="auto"
                          />
                        </div>

                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" /> דוגמאות Few-Shot
                            </label>
                            <button 
                              onClick={() => {
                                const newExample = { id: crypto.randomUUID?.() || Math.random().toString(), input: '', output: '', isActive: true };
                                setEditingPrompt({...editingPrompt, fewShotExamples: [...(editingPrompt?.fewShotExamples || []), newExample]});
                              }}
                              className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> הוסף דוגמה
                            </button>
                          </div>
                          <div className="space-y-3">
                            {(editingPrompt?.fewShotExamples || []).map((example, i) => (
                              <div key={example.id} className={`p-3 rounded-xl border ${example.isActive ? 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10' : 'bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5 opacity-70'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={example.isActive} onChange={(e) => {
                                      const newEx = [...(editingPrompt.fewShotExamples || [])];
                                      newEx[i] = { ...newEx[i], isActive: e.target.checked };
                                      setEditingPrompt({...editingPrompt, fewShotExamples: newEx});
                                    }} className="rounded text-blue-500 focus:ring-blue-500/30" />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">דוגמה {i + 1}</span>
                                  </div>
                                  <button onClick={() => {
                                    const newEx = editingPrompt.fewShotExamples.filter((_, idx) => idx !== i);
                                    setEditingPrompt({...editingPrompt, fewShotExamples: newEx});
                                  }} className="text-red-400 hover:text-red-500">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] text-slate-500 font-bold mb-1 block">קלט (Input)</label>
                                    <textarea value={example.input} onChange={(e) => {
                                      const newEx = [...(editingPrompt.fewShotExamples || [])];
                                      newEx[i] = { ...newEx[i], input: e.target.value };
                                      setEditingPrompt({...editingPrompt, fewShotExamples: newEx});
                                    }} className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500" rows={2} dir="auto" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-slate-500 font-bold mb-1 block">פלט (Output)</label>
                                    <textarea value={example.output} onChange={(e) => {
                                      const newEx = [...(editingPrompt.fewShotExamples || [])];
                                      newEx[i] = { ...newEx[i], output: e.target.value };
                                      setEditingPrompt({...editingPrompt, fewShotExamples: newEx});
                                    }} className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/5 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500" rows={2} dir="auto" />
                                  </div>
                                </div>
                              </div>
                            ))}
                            {(!editingPrompt?.fewShotExamples || editingPrompt.fewShotExamples.length === 0) && (
                              <div className="text-xs text-center text-slate-400 dark:text-slate-500 py-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                                אין דוגמאות Few-Shot. הוסף דוגמאות כדי לעזור ל-AI להבין את התבנית הרצויה.
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                      {/* AI Automatic Folder & Tag Suggester */}
                      <AiMetadataSuggestions
                        content={editingPrompt?.content || ''}
                        currentFolderId={editingPrompt?.folder || (folders.length > 0 ? folders[0].id : '')}
                        currentTags={editingPrompt?.tags || []}
                        folders={folders}
                        allTags={allTags}
                        onApplyFolder={(fId) => setEditingPrompt({ ...editingPrompt, folder: fId })}
                        onApplyTags={(tags) => setEditingPrompt({ ...editingPrompt, tags })}
                        onApplyAll={(fId, tags, title) => setEditingPrompt({
                          ...editingPrompt,
                          folder: fId,
                          tags,
                          ...(!editingPrompt?.title && title ? { title } : {})
                        })}
                      />

                      {/* Readability & NLP Dashboard */}
                      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-500" />
                            לוח בקרה לקריאות (Readability NLP)
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                            readabilityAnalysis.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' :
                            readabilityAnalysis.score >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          }`}>
                            ציון {readabilityAnalysis.score}/100
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-xl">
                            <div className="text-[10px] text-slate-400">רמת מורכבות</div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{readabilityAnalysis.complexity}</div>
                          </div>
                          <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-xl">
                            <div className="text-[10px] text-slate-400">מילים במשפט</div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{readabilityAnalysis.avgWordsPerSentence}</div>
                          </div>
                          <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-xl">
                            <div className="text-[10px] text-slate-400">ביטויי סביל</div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{readabilityAnalysis.passiveCount}</div>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">המלצות ניתוח טקסט (NLP):</div>
                          {readabilityAnalysis.tips.map((tip, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-white/[0.03] p-2 rounded-xl">
                              <span className="text-indigo-500 font-bold">•</span>
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prompt Chaining Workflow Builder */}
                      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <GitMerge className="w-4 h-4 text-purple-500" />
                            שרשור פרומפטים (Prompt Chaining)
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          הגדר פרומפט המשך בשרשרת שבו הפלט של פרומפט זה יועבר אוטומטית כקלט לשלב הבא.
                        </p>
                        <select
                          value={editingPrompt?.chainNextPromptId || ""}
                          onChange={(e) => setEditingPrompt({ ...editingPrompt, chainNextPromptId: e.target.value || undefined })}
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white"
                        >
                          <option value="">-- ללא פרומפט המשך (סוף השרשרת) --</option>
                          {(prompts || []).filter(p => p.id !== editingPrompt?.id).map(p => (
                            <option key={p.id} value={p.id}>🔗 {p.title || 'ללא כותרת'}</option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                              תיקייה
                              {folders.length === 0 && (
                                <button type="button" onClick={() => setIsNewFolderModalOpen(true)} className="ml-2 text-indigo-500 hover:text-indigo-600">
                                  + צור תיקייה
                                </button>
                              )}
                            </label>
                          </div>
                          <select 
                            value={editingPrompt?.folder || (folders.length > 0 ? folders[0].id : '')}
                            onChange={e => setEditingPrompt({...editingPrompt, folder: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-bold text-slate-900 dark:text-white"
                          >
                            {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">נושא (Topic)</label>
                          <select 
                            value={editingPrompt?.topic || "General"}
                            onChange={e => setEditingPrompt({...editingPrompt, topic: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm font-bold text-slate-900 dark:text-white"
                          >
                            {['General', 'Finance', 'Tech', 'Marketing', 'Sales', 'HR', 'Creative', 'Academic', 'Writing', 'SEO', 'Coding'].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>

                        {/* Multi-category assignment */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-indigo-500" />
                              <span>קטגוריות (Categories)</span>
                            </label>
                            {onOpenManageCategories && (
                              <button
                                type="button"
                                onClick={onOpenManageCategories}
                                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                <span>+ נהל קטגוריות</span>
                              </button>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl min-h-[42px] items-center">
                            {categories.map(cat => {
                              const isSelected = (editingPrompt?.categories || []).includes(cat.id) || (editingPrompt?.categories || []).includes(cat.name);
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    const current = editingPrompt?.categories || [];
                                    const next = isSelected
                                      ? current.filter((c: string) => c !== cat.id && c !== cat.name)
                                      : [...current, cat.id];
                                    setEditingPrompt({ ...editingPrompt, categories: next });
                                  }}
                                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                                    isSelected
                                      ? 'text-white shadow-xs'
                                      : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300'
                                  }`}
                                  style={isSelected ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                                >
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }}
                                  />
                                  <span>{cat.name}</span>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </button>
                              );
                            })}
                            {categories.length === 0 && (
                              <span className="text-xs text-slate-400 italic">אין קטגוריות זמינות</span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            בחר אחת או יותר לשיוך הפרומפט לקטגוריות רלוונטיות.
                          </p>
                        </div>

                        {/* Task Reminder Section */}
                        <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                              <Bell className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>תזכורת משימה (Notification)</span>
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!editingPrompt?.reminder}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    tomorrow.setHours(9, 0, 0, 0);
                                    const pad = (n: number) => n.toString().padStart(2, '0');
                                    const dt = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
                                    setEditingPrompt({
                                      ...editingPrompt,
                                      reminder: {
                                        id: `rem-${Date.now()}`,
                                        dateTime: dt,
                                        priority: 'normal',
                                        note: '',
                                        isCompleted: false,
                                        notified: false
                                      }
                                    });
                                  } else {
                                    setEditingPrompt({
                                      ...editingPrompt,
                                      reminder: undefined
                                    });
                                  }
                                }}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>

                          {editingPrompt?.reminder && (
                            <div className="space-y-2.5 pt-1">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">תאריך ושעת התראה</label>
                                <input
                                  type="datetime-local"
                                  value={editingPrompt.reminder.dateTime || ''}
                                  onChange={(e) => setEditingPrompt({
                                    ...editingPrompt,
                                    reminder: { ...editingPrompt.reminder, dateTime: e.target.value }
                                  })}
                                  className="w-full px-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-indigo-200 dark:border-indigo-800/50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">רמת דחיפות</label>
                                <div className="grid grid-cols-3 gap-1">
                                  {(['normal', 'high', 'urgent'] as const).map(p => (
                                    <button
                                      key={p}
                                      type="button"
                                      onClick={() => setEditingPrompt({
                                        ...editingPrompt,
                                        reminder: { ...editingPrompt.reminder, priority: p }
                                      })}
                                      className={`py-1 px-1.5 rounded-lg text-[10px] font-extrabold border transition-all ${
                                        editingPrompt.reminder.priority === p
                                          ? p === 'urgent'
                                            ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300'
                                            : p === 'high'
                                              ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                                              : 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300'
                                          : 'bg-white dark:bg-white/5 text-slate-500 border-transparent hover:bg-slate-100'
                                      }`}
                                    >
                                      {p === 'normal' ? 'רגיל' : p === 'high' ? 'גבוה' : 'דחוף ⚡'}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">הערת משימה (אופציונלי)</label>
                                <input
                                  type="text"
                                  value={editingPrompt.reminder.note || ''}
                                  onChange={(e) => setEditingPrompt({
                                    ...editingPrompt,
                                    reminder: { ...editingPrompt.reminder, note: e.target.value }
                                  })}
                                  placeholder="למשל: להריץ מול קובץ הלקוח..."
                                  className="w-full px-3 py-1.5 bg-white dark:bg-[#1a1a1a] border border-indigo-200 dark:border-indigo-800/50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>


                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">תגיות</label>
                            <button 
                              type="button"
                              onClick={handleAutoTag}
                              disabled={isAutoTagging}
                              className="text-xs flex items-center gap-1 text-indigo-500 hover:text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md transition-colors"
                            >
                              {isAutoTagging ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} תיוג אוטומטי
                            </button>
                          </div>
                          <TagCombobox 
                            tags={editingPrompt?.tags || []}
                            allTags={allTags}
                            onChange={(tags) => setEditingPrompt({...editingPrompt, tags})}
                          />
                          {/* Quick Popular Tags */}
                          <div className="mt-2 flex flex-wrap gap-1">
                            {['פיתוח', 'קוד', 'תמונות', 'שיווק', 'כתיבה', 'מחקר', 'אוטומציה', 'ChatGPT', 'Midjourney', 'Python']
                              .filter(t => !(editingPrompt?.tags || []).includes(t))
                              .slice(0, 6)
                              .map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => setEditingPrompt({ ...editingPrompt, tags: [...(editingPrompt?.tags || []), tag] })}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors"
                                >
                                  + {tag}
                                </button>
                              ))}
                          </div>
                        </div>


                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תאריך יעד</label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="date"
                              value={editingPrompt?.dueDate || ""}
                              onChange={(e) => setEditingPrompt({...editingPrompt, dueDate: e.target.value})}
                              className="w-full ps-9 pe-4 py-2 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">שם גרסה (אופציונלי)</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="לדוגמה: v1.1 - שיפור טון"
                              value={editingPrompt?.currentVersionName || ""}
                              onChange={(e) => setEditingPrompt({...editingPrompt, currentVersionName: e.target.value})}
                              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <DuplicateTitleModal
                  isOpen={isDuplicateModalOpen}
                  onClose={() => setIsDuplicateModalOpen(false)}
                  title={editingPrompt?.title || ""}
                  folderName={folders.find(f => f.id === targetFolderId)?.name || 'כללי'}
                  onConfirmSaveAnyway={() => {
                    setIsDuplicateModalOpen(false);
                    handleSave(editingPrompt || {});
                  }}
                  onFocusTitle={() => {
                    setIsDuplicateModalOpen(false);
                    setTimeout(() => {
                      titleInputRef.current?.focus();
                      titleInputRef.current?.select();
                    }, 100);
                  }}
                />
              </motion.div>
            
  );
}
