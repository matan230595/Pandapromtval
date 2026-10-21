import { apiFetch } from '../utils/api';
import React, { useState } from 'react';
import { X, Link2, Upload, Loader2, Check } from 'lucide-react';
import { Prompt } from '../types';

interface Props {
  onClose: () => void;
  onImport: (prompts: Partial<Prompt>[]) => void;
}

export const SmartImportModal: React.FC<Props> = ({ onClose, onImport }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Partial<Prompt>[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUrlImport = async () => {
    if (!url) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const key = localStorage.getItem("promptvault_gemini_key") || "";
      const res = await apiFetch('/api/gemini/smart-import', {
        method: 'POST',
        headers: { "Content-Type": "application/json", ...(key ? { "x-gemini-api-key": key } : {}) },
        body: JSON.stringify({ type: 'url', data: url })
      });
      const data = await res.json();
      if (data.prompts) setResults(data.prompts);
    } catch(e) {
      setErrorMsg("שגיאה בייבוא URL. אנא ודא שהקישור נגיש ומכיל תוכן מתאים.");
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const key = localStorage.getItem("promptvault_gemini_key") || "";
        const res = await apiFetch('/api/gemini/smart-import', {
          method: 'POST',
          headers: { "Content-Type": "application/json", ...(key ? { "x-gemini-api-key": key } : {}) },
          body: JSON.stringify({ type: 'pdf', data: base64 })
        });
        const data = await res.json();
        if (data.prompts) setResults(data.prompts);
      } catch(e) {
        setErrorMsg("שגיאה בפענוח המסמך. אנא ודא שהקובץ תקין.");
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-[#111] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">ייבוא חכם (Smart Import)</h2>
            <p className="text-sm text-slate-500 mt-1">חילוץ אוטומטי של פרומפטים מתוך אתרים או מסמכים.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 font-bold">
              {errorMsg}
            </div>
          )}
          {results.length === 0 ? (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">ייבוא מקישור (URL)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="url" 
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://example.com/prompts..." 
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl ps-10 pe-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      dir="ltr"
                    />
                  </div>
                  <button 
                    onClick={handleUrlImport}
                    disabled={loading || !url}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "סרוק"}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
                <span className="text-xs text-slate-400 font-bold uppercase">או</span>
                <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">העלאת מסמך (PDF)</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors relative">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">גרור קובץ או לחץ להעלאה</h3>
                  <p className="text-xs text-slate-500">תומך ב-PDF, עד 15MB.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">נמצאו {results.length} פרומפטים:</h3>
              {results.map((p, i) => (
                <div key={i} className="bg-slate-50 dark:bg-[#1a1a1a] p-4 rounded-xl border border-slate-200 dark:border-white/10">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{p.title}</h4>
                  <div className="text-xs text-slate-500 font-mono line-clamp-2 mb-2" dir="auto">{p.content}</div>
                  <div className="flex gap-1 flex-wrap">
                    {p.tags?.map(t => <span key={t} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-[10px]">{t}</span>)}
                  </div>
                </div>
              ))}
              
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => onImport(results)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> יבא הכל למאגר
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
