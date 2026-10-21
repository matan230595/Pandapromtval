const fs = require('fs');
let code = fs.readFileSync('src/components/PromptTester.tsx', 'utf8');

const replacementState = `  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string}[]>(prompt.testChatHistory || []);
  const [isTyping, setIsTyping] = useState(false);
  const [isTypingModel2, setIsTypingModel2] = useState(false);
  const [messagesModel2, setMessagesModel2] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  
  const [splitTesting, setSplitTesting] = useState(false);
  const [model1, setModel1] = useState("gemini-1.5-flash");
  const [model2, setModel2] = useState("gemini-1.5-pro");`;

code = code.replace(
  /const \[inputText, setInputText\] = useState\(""\);\n  const \[messages, setMessages\] = useState<\{role: 'user'\|'assistant', content: string\}\[]>[\s\S]*?const \[isTyping, setIsTyping\] = useState\(false\);/,
  replacementState
);

const sendLogicReplace = `  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessages = [...messages, { role: "user" as const, content: inputText }];
    setMessages(newMessages);
    
    let newMessages2 = [...messagesModel2];
    if (splitTesting) {
       newMessages2 = [...messagesModel2, { role: "user" as const, content: inputText }];
       setMessagesModel2(newMessages2);
    }
    
    setInputText("");
    setIsTyping(true);
    if (splitTesting) setIsTypingModel2(true);

    try {
      const key = localStorage.getItem("promptvault_gemini_key") || "";
      const basePayload = {
         messages: newMessages.length === 1 
            ? [{ role: "user", content: \`\${prompt.content}\\n\\n[קלט]:\\n\${newMessages[0].content}\` }]
            : newMessages,
         systemInstruction: prompt.content
      };

      // Model 1 Request
      const p1 = fetch("/api/gemini/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(key ? { "x-gemini-api-key": key } : {})
        },
        body: JSON.stringify({ ...basePayload, modelId: model1 })
      }).then(res => res.json()).then(data => {
         setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
         onUpdate({ testChatHistory: [...newMessages, { role: "assistant", content: data.text }] });
         setIsTyping(false);
      });

      // Model 2 Request
      if (splitTesting) {
        const p2 = fetch("/api/gemini/chat", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(key ? { "x-gemini-api-key": key } : {})
          },
          body: JSON.stringify({ ...basePayload, modelId: model2 })
        }).then(res => res.json()).then(data => {
           setMessagesModel2(prev => [...prev, { role: "assistant", content: data.text }]);
           setIsTypingModel2(false);
        });
      }

    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setIsTypingModel2(false);
    }
  };`;

code = code.replace(/const handleSend = async \(\) => \{[\s\S]*?catch \(error\) \{\n      console.error\(error\);\n      setIsTyping\(false\);\n    \}\n  \};/, sendLogicReplace);

const uiReplace = `
      <div className="flex items-center justify-between gap-2 mb-4 bg-slate-50 dark:bg-white/5 p-2 rounded-xl">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
          <input 
            type="checkbox" 
            checked={splitTesting} 
            onChange={(e) => setSplitTesting(e.target.checked)} 
            className="rounded text-indigo-500 focus:ring-indigo-500 bg-slate-200 dark:bg-white/10 border-transparent"
          />
          השוואת מודלים (Arena)
        </label>
        {splitTesting && (
          <div className="flex items-center gap-2">
            <select value={model1} onChange={e => setModel1(e.target.value)} className="bg-white dark:bg-[#1a1a1a] text-xs px-2 py-1 rounded border border-slate-200 dark:border-white/10 outline-none">
              <option value="gemini-1.5-flash">Flash (מהיר)</option>
              <option value="gemini-1.5-pro">Pro (חכם)</option>
            </select>
            <span className="text-slate-400 text-xs">vs</span>
            <select value={model2} onChange={e => setModel2(e.target.value)} className="bg-white dark:bg-[#1a1a1a] text-xs px-2 py-1 rounded border border-slate-200 dark:border-white/10 outline-none">
              <option value="gemini-1.5-pro">Pro (חכם)</option>
              <option value="gemini-1.5-flash">Flash (מהיר)</option>
            </select>
          </div>
        )}
      </div>

      <div className={\`flex-1 overflow-y-auto mb-4 space-y-4 pr-2 \${splitTesting ? 'grid grid-cols-2 gap-4 space-y-0' : ''}\`}>
        {/* Model 1 Chat */}
        <div className="flex flex-col space-y-4">
          {splitTesting && <div className="text-xs font-bold text-center text-indigo-500 border-b border-slate-100 dark:border-white/5 pb-2">מודל 1: {model1}</div>}
          {messages.map((m, i) => (
`;

code = code.replace(/<div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">[\s\S]*?\{messages.map\(\(m, i\) => \(/, uiReplace);

const uiReplaceEnd = `
        </div>
        
        {/* Model 2 Chat */}
        {splitTesting && (
          <div className="flex flex-col space-y-4 border-r border-slate-100 dark:border-white/5 pr-4">
            <div className="text-xs font-bold text-center text-emerald-500 border-b border-slate-100 dark:border-white/5 pb-2">מודל 2: {model2}</div>
            {messagesModel2.map((m, i) => (
              <div key={i} className={\`flex \${m.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                <div className={\`max-w-[90%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed \${
                  m.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-sm' 
                    : 'bg-slate-100 dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-white/5'
                }\`}>
                  <div className="whitespace-pre-wrap font-mono" dir="auto" dangerouslySetInnerHTML={{ __html: Prism.highlight(m.content, Prism.languages.markdown, 'markdown') }} />
                </div>
              </div>
            ))}
            {isTypingModel2 && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
`;

code = code.replace(/<\/div>\n            \)\}\n          <\/div>\n        \)\}\n      <\/div>/, uiReplaceEnd);

fs.writeFileSync('src/components/PromptTester.tsx', code);
