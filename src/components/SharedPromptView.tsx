import React, { useEffect, useState } from 'react';
import { Prompt } from '../types';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Bot, Link, AlertTriangle, Loader2, Sparkles, Copy, Check, 
  Share2, ArrowRight, Download, ExternalLink, QrCode
} from 'lucide-react';
import { motion } from 'motion/react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';

interface Props {
  promptId: string;
}

export const SharedPromptView: React.FC<Props> = ({ promptId }) => {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      // 1. Check if payload is in base64 URL param
      const urlParams = new URLSearchParams(window.location.search);
      const b64 = urlParams.get('shared_prompt_b64');
      if (b64) {
        try {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(b64))));
          if (decoded && decoded.title) {
            setPrompt(decoded as Prompt);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to decode base64 prompt:", e);
        }
      }

      // 2. Check local prompts in localStorage
      try {
        const local = localStorage.getItem("promptvault_prompts");
        if (local) {
          const parsed: Prompt[] = JSON.parse(local);
          const found = parsed.find(p => p.id === promptId);
          if (found) {
            setPrompt(found);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Local prompt lookup error:", e);
      }

      // 3. Query Firestore public_prompts collection
      try {
        const docRef = doc(db, "public_prompts", promptId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPrompt({ id: docSnap.id, ...docSnap.data() } as Prompt);
        }
      } catch (err) {
        console.error("Error fetching public prompt:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [promptId]);

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportToMyVault = () => {
    if (!prompt) return;
    try {
      const saved = localStorage.getItem("promptvault_prompts");
      const current: Prompt[] = saved ? JSON.parse(saved) : [];
      const newPrompt: Prompt = {
        ...prompt,
        id: 'p_imported_' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        useCount: 0
      };
      localStorage.setItem("promptvault_prompts", JSON.stringify([newPrompt, ...current]));
      setImported(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (e) {
      console.error("Failed to import prompt to vault", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-xs text-slate-500 font-semibold">טוען פרומפט משותף...</span>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#111] rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200 dark:border-white/10 text-center space-y-4" dir="rtl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white">הפרומפט לא נמצא</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            ייתכן שהקישור שגוי, שהפרומפט טרם פורסם לציבור, או שהוסר.
          </p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-xs"
          >
            חזרה לכספת הפרומפטים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] font-sans selection:bg-indigo-500/20" dir="rtl">
      {/* Header */}
      <header className="bg-white/90 dark:bg-[#111]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">PandaPrompt</span>
              <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full mr-2">
                Shared Prompt
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleImportToMyVault}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
                imported 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {imported ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{imported ? 'נשמר לכספת שלך! ✓' : 'שמור לכספת שלי'}</span>
            </button>

            <button 
              onClick={() => window.location.href = '/'}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 transition-colors"
            >
              פתח אפליקציה
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#121212] rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-white/10"
        >
          {/* Prompt Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8 border-b border-slate-100 dark:border-white/5 pb-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {prompt.platform}
                </span>

                {(prompt.tags || []).map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 bg-slate-50 dark:bg-white/5 text-slate-500 rounded-md">
                    #{t}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {prompt.title}
              </h1>

              {prompt.description && (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {prompt.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-xs"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'הועתק ללוח!' : 'העתק פרומפט'}</span>
              </button>
            </div>
          </div>

          {/* Prompt Body */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              תוכן הפרומפט:
            </label>
            <div 
              className="p-5 bg-slate-50 dark:bg-[#181818] rounded-2xl border border-slate-200/80 dark:border-white/5 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap selection:bg-indigo-500/30"
              dir="auto"
              dangerouslySetInnerHTML={{ __html: Prism.highlight(prompt.content, Prism.languages.markdown, 'markdown') }}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};
