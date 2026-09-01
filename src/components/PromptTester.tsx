import React, { useState } from 'react';
import { Send, Bot, User, Loader2, Play } from 'lucide-react';
import { Prompt } from '../types';

interface Props {
  prompt: Prompt;
}

export const PromptTester: React.FC<Props> = ({ prompt }) => {
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const startTest = async () => {
    setStarted(true);
    setMessages([{role: 'user', content: prompt.content}]);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{role: 'user', content: prompt.content}],
          systemInstruction: 'You are an AI model fulfilling a user prompt. Always follow the prompt constraints.'
        })
      });
      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, {role: 'assistant', content: data.text}]);
      } else {
         setMessages(prev => [...prev, {role: 'assistant', content: 'שגיאה: לא התקבל טקסט בתשובה'}]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {role: 'assistant', content: 'שגיאת רשת בבדיקת הפרומפט.'}]);
    }
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const newMsg = {role: 'user' as const, content: input};
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          systemInstruction: 'You are an AI model fulfilling a user prompt. Always follow the prompt constraints.'
        })
      });
      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, {role: 'assistant', content: data.text}]);
      } else {
        setMessages(prev => [...prev, {role: 'assistant', content: 'שגיאה'}]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {role: 'assistant', content: 'שגיאת רשת.'}]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <label className="hidden">
        <span className="flex items-center gap-2 text-indigo-500"><Bot className="w-4 h-4"/> בדיקת פרומפט מול מודל (Gemini)</span>
        {started && (
          <button onClick={() => {setStarted(false); setMessages([]);}} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors text-[10px] bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">איפוס צ'אט</button>
        )}
      </label>
      
      {!started ? (
        <div className="flex-1 border border-dashed border-slate-300 dark:border-white/20 rounded-2xl flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-500 gap-4 p-8 text-center">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 ml-1" />
          </div>
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">בדוק את הפרומפט שלך בלייב</p>
            <p className="text-sm">המערכת תשלח את הפרומפט הנוכחי למודל Gemini כדי לראות את התוצאה.</p>
          </div>
          <button onClick={startTest} className="mt-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm flex items-center gap-2 transition-colors">
            <Bot className="w-4 h-4" /> התחל בדיקה
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#111] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm whitespace-pre-wrap leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-tl-sm'}`} dir="auto">
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> מנסח תשובה...
                </div>
              </div>
            )}
          </div>
          <div className="p-3 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="המשך את השיחה מול המודל..."
              className="flex-1 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
