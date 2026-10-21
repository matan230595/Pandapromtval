import { apiFetch } from '../utils/api';
import React, { useState } from 'react';
import { Send, Bot, User, Loader2, Play, SplitSquareHorizontal, Scale, Link2, Mic } from 'lucide-react';
import { Prompt } from '../types';
import { SmartVariablesModal } from './SmartVariablesModal';

interface Props {
  onChain?: (text: string) => void;
  prompt: Prompt;
  onUpdate?: (prompt: Prompt) => void;
  nextPromptName?: string;
  onAutoChain?: (text: string) => void;
}

export const PromptTester: React.FC<Props> = ({ prompt, onUpdate, onChain, nextPromptName, onAutoChain }) => {
  const [messagesA, setMessagesA] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [messagesB, setMessagesB] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [isABMode, setIsABMode] = useState(false);
  const [judgeResult, setJudgeResult] = useState<{winner: 'A' | 'B' | 'Tie', reason: string} | null>(null);
  const [isJudging, setIsJudging] = useState(false);
  const [showVarsModal, setShowVarsModal] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [testerToast, setTesterToast] = useState<string | null>(null);

  const showTempToast = (msg: string) => {
    setTesterToast(msg);
    setTimeout(() => setTesterToast(null), 3500);
  };

  const handleVoiceRecord = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showTempToast("הדפדפן שלך אינו תומך בהכתבה קולית.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'he-IL';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + " " + transcript : transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  
  React.useEffect(() => {
    if (prompt.testChatHistory && prompt.testChatHistory.length > 0) {
      setMessagesA(prompt.testChatHistory);
      setStarted(true);
      setIsABMode(false);
    } else {
      setMessagesA([]);
      setMessagesB([]);
      setStarted(false);
    }
  }, [prompt.id]);

  const startTest = async () => {
    setJudgeResult(null);
    if (/\$\([^)]+\)|\{\{[^}]+\}\}/.test(prompt.content)) {
      setShowVarsModal(true);
      return;
    }
    doStartTest(prompt.content);
  };

  const doStartTest = async (resolvedContent: string) => {
    setStarted(true);
    const initialMsg = {role: 'user' as const, content: resolvedContent};
    setMessagesA([initialMsg]);
    if (isABMode) setMessagesB([initialMsg]);
    
    setIsLoading(true);
    try {
      const pA = apiFetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [initialMsg],
          systemInstruction: 'You are an AI model fulfilling a user prompt. Follow constraints.',
          temperature: 0.2
        })
      });
      
      let pB = null;
      if (isABMode) {
        pB = apiFetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [initialMsg],
            systemInstruction: 'You are an AI model fulfilling a user prompt. Follow constraints. Be highly creative.',
            temperature: 0.9
          })
        });
      }

      const [resA, resB] = await Promise.all([pA, pB]);
      const dataA = await resA.json();
      const dataB = resB ? await resB.json() : null;

      if (dataA.text) {
        setMessagesA(prev => {
          const msgs = [...prev, {role: 'assistant' as const, content: dataA.text}];
          if (!isABMode) onUpdate?.({...prompt, testChatHistory: msgs});
          return msgs;
        });
      }
      if (dataB && dataB.text) {
        setMessagesB(prev => [...prev, {role: 'assistant' as const, content: dataB.text}]);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  
  const handleJudge = async () => {
    if (messagesA.length < 2 || messagesB.length < 2) return;
    setIsJudging(true);
    try {
      const lastA = messagesA[messagesA.length - 1].content;
      const lastB = messagesB[messagesB.length - 1].content;
      
      const res = await apiFetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{role: 'user', content: `You are an impartial AI judge. Evaluate these two responses based on clarity, creativity, and instruction-following.\n\nResponse A:\n${lastA}\n\nResponse B:\n${lastB}\n\nReturn ONLY a JSON object with 'winner' ("A", "B", or "Tie") and 'reason' (short explanation in Hebrew).`}],
          systemInstruction: 'You are an AI judge. Return valid JSON only.',
          temperature: 0.1
        })
      });
      const data = await res.json();
      let parsed = data.text || '';
      try {
        if (parsed.includes('```json')) {
          parsed = parsed.replace(/```json/g, '').replace(/```/g, '');
        } else if (parsed.includes('```')) {
          parsed = parsed.replace(/```/g, '');
        }
        setJudgeResult(JSON.parse(parsed.trim()));
      } catch {
        setJudgeResult({ winner: 'Tie', reason: parsed.trim() || 'שני המודלים הפיקו תוצאות דומות באיכותן.' });
      }
    } catch (e) {
      console.error(e);
    }
    setIsJudging(false);
  };

  const handleSend = async () => {
    setJudgeResult(null);
    if (!input.trim() || isLoading) return;
    const userMsg = {role: 'user' as const, content: input};
    
    const updatedA = [...messagesA, userMsg];
    setMessagesA(updatedA);
    
    let updatedB: any = [];
    if (isABMode) {
      updatedB = [...messagesB, userMsg];
      setMessagesB(updatedB);
    }
    
    setInput('');
    setIsLoading(true);

    try {
      const pA = apiFetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedA,
          systemInstruction: 'You are an AI model fulfilling a user prompt. Follow constraints.',
          temperature: 0.2
        })
      });

      let pB = null;
      if (isABMode) {
        pB = apiFetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedB,
            systemInstruction: 'You are an AI model fulfilling a user prompt. Follow constraints. Be highly creative.',
            temperature: 0.9
          })
        });
      }

      const [resA, resB] = await Promise.all([pA, pB]);
      const dataA = await resA.json();
      const dataB = resB ? await resB.json() : null;

      if (dataA.text) {
        setMessagesA(prev => {
           const msgs = [...prev, {role: 'assistant' as const, content: dataA.text}];
           if (!isABMode) onUpdate?.({...prompt, testChatHistory: msgs});
           return msgs;
        });
      }
      if (dataB && dataB.text) {
        setMessagesB(prev => [...prev, {role: 'assistant' as const, content: dataB.text}]);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const ChatPane = ({ msgs, title, tag }: { msgs: any[], title: string, tag?: string }) => (
    <div className="flex-1 flex flex-col min-w-0 border-l last:border-l-0 border-slate-200 dark:border-white/10">
      {isABMode && (
        <div className="p-2 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-between shrink-0">
          <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{title}</span>
          {tag && <span className="text-[10px] bg-white dark:bg-[#111] px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 text-slate-500">{tag}</span>}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-3 group ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-tl-sm'} ${isABMode ? 'max-w-[95%]' : 'max-w-[85%]'}`} dir="auto">
              {m.content}
            </div>

            {m.role === 'assistant' && (
              <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 self-end mb-1 transition-all">
                {!isABMode && onChain && (
                  <button 
                    onClick={() => onChain(m.content)}
                    title="שרשר פלט זה לפרומפט הבא"
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-indigo-600"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(m.content);
                    showTempToast("התוכן הועתק ללוח לצורך שיתוף או Webhook!");
                  }}
                  title="העתק ללוח"
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-emerald-600"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}


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
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-indigo-500 text-sm font-bold"><Bot className="w-4 h-4"/> בדיקת פרומפט (Gemini)</span>
        <div className="flex items-center gap-2">
          {!started && (
            <button onClick={() => setIsABMode(!isABMode)} className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded transition-colors ${isABMode ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
              <SplitSquareHorizontal className="w-3.5 h-3.5" />
              A/B Test
            </button>
          )}
          {started && (
            <button onClick={() => { setStarted(false); setMessagesA([]); setMessagesB([]); onUpdate?.({...prompt, testChatHistory: []}); }} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors text-[10px] bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">איפוס צ'אט</button>
          )}
        </div>
      </div>
      
      {!started ? (
        <div className="flex-1 border border-dashed border-slate-300 dark:border-white/20 rounded-2xl flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-500 gap-4 p-8 text-center">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 ml-1" />
          </div>
          <div>
            <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">בדוק את הפרומפט שלך בלייב</p>
            <p className="text-sm">המערכת תשלח את הפרומפט הנוכחי למודל Gemini כדי לראות את התוצאה.</p>
            {isABMode && <p className="text-xs text-indigo-500 mt-2 font-bold bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded inline-block">מצב A/B פעיל - השוואת יצירתיות מודל</p>}
          </div>
          <button onClick={startTest} id="start-test-btn" className="mt-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 transition-all duration-300">
            <Bot className="w-4 h-4" /> התחל בדיקה
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#111] overflow-hidden">
          <div className="flex-1 flex flex-row overflow-hidden">
             <ChatPane msgs={messagesA} title="מודל A" tag="מדויק (Temp 0.2)" />
             {isABMode && <ChatPane msgs={messagesB} title="מודל B" tag="יצירתי (Temp 0.9)" />}
          {judgeResult && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-2xl border border-indigo-200 dark:border-indigo-900/50 z-20 w-80 text-center animate-in fade-in slide-in-from-top-4">
              <div className="text-2xl mb-2">{judgeResult.winner === 'Tie' ? '🤝' : '🏆'}</div>
              <div className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">
                המנצח: {judgeResult.winner === 'Tie' ? 'תיקו' : `מודל ${judgeResult.winner}`}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed" dir="auto">{judgeResult.reason}</div>
              <button onClick={() => setJudgeResult(null)} className="mt-4 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors">סגור</button>
            </div>
          )}
          {isABMode && messagesA.length > 1 && !judgeResult && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
               <button onClick={handleJudge} disabled={isJudging || isLoading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg flex items-center gap-2 text-xs transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100">
                 {isJudging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" />}
                 שופט AI
               </button>
             </div>
          )}

          </div>
          
          
          <div className="p-3 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex gap-2 shrink-0 items-center">
            <button
              onClick={handleVoiceRecord}
              title="הכתבה קולית"
              className={`p-2 rounded-xl transition-colors shrink-0 ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 dark:bg-white/10 text-slate-500 hover:text-indigo-600'}`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <input 
              id="sandbox-chat-input"
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={isABMode ? "שאל את שני המודלים במקביל..." : "המשך את השיחה מול המודל..."}
              className="flex-1 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
              disabled={isLoading}
            />
            <button 
              id="sandbox-send-btn"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {testerToast && (
        <div className="absolute bottom-16 start-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-50 animate-fade-in">
          {testerToast}
        </div>
      )}
      <SmartVariablesModal 
        isOpen={showVarsModal} 
        onClose={() => setShowVarsModal(false)} 
        originalText={prompt.content}
        actionType="test"
        onComplete={(text) => {
           setShowVarsModal(false);
           doStartTest(text);
        }}
      />
    </div>
  );
};
