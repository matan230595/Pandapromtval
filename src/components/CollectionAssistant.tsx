import { apiFetch } from '../utils/api';
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { Prompt, Folder } from '../types';

interface Props {
  prompts: Prompt[];
  folders: Folder[];
  onSelectPrompt: (id: string) => void;
}

export const CollectionAssistant: React.FC<Props> = ({ prompts, folders, onSelectPrompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'assistant', text: string}[]>([{
    role: 'assistant', text: 'היי! אני העוזר האישי של המאגר שלך. תשאל אותי משהו כמו "איפה יש לי פרומפטים לשיווק?" או "תסכם לי את התיקייה הכללית".'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user' as const, text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const key = localStorage.getItem("promptvault_gemini_key") || "";
      const collectionData = {
        folders: folders.map(f => ({ id: f.id, name: f.name })),
        prompts: prompts.map(p => ({ id: p.id, title: p.title, folder: p.folder, tags: p.tags }))
      };

      const res = await apiFetch('/api/gemini/collection-chat', {
        method: 'POST',
        headers: { "Content-Type": "application/json", ...(key ? { "x-gemini-api-key": key } : {}) },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.text })),
          collectionData
        })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', text: data.text }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', text: 'שגיאה בתקשורת עם השרת.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-50"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 left-6 w-80 md:w-96 h-[500px] bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold">
              <Bot className="w-5 h-5" /> 
              Vault Assistant
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#111]">
            {messages.map((m, i) => (
              <div key={i} className={`flex \${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm \${m.role === 'user' ? 'bg-indigo-600 text-white rounded-bl-sm' : 'bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 rounded-br-sm border border-slate-200 dark:border-white/10 shadow-sm'}`} dir="auto">
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                 <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 shadow-sm rounded-2xl rounded-br-sm px-4 py-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 bg-white dark:bg-[#1a1a1a] border-t border-slate-200 dark:border-white/10">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="שאל אותי משהו..."
                className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none text-slate-900 dark:text-white"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 dark:text-indigo-400 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
