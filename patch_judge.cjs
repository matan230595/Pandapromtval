const fs = require('fs');
let code = fs.readFileSync('src/components/PromptTester.tsx', 'utf8');

const importRegex = /import \{ (.*?) \} from 'lucide-react';/;
if (code.match(importRegex)) {
    code = code.replace(importRegex, "import { $1, Scale } from 'lucide-react';");
}

code = code.replace("const [isABMode, setIsABMode] = useState(false);", "const [isABMode, setIsABMode] = useState(false);\n  const [judgeResult, setJudgeResult] = useState<{winner: 'A' | 'B' | 'Tie', reason: string} | null>(null);\n  const [isJudging, setIsJudging] = useState(false);");

const judgeFunc = `
  const handleJudge = async () => {
    if (messagesA.length < 2 || messagesB.length < 2) return;
    setIsJudging(true);
    try {
      const lastA = messagesA[messagesA.length - 1].content;
      const lastB = messagesB[messagesB.length - 1].content;
      
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{role: 'user', content: \`You are an impartial AI judge. Evaluate these two responses based on clarity, creativity, and instruction-following.\\n\\nResponse A:\\n\${lastA}\\n\\nResponse B:\\n\${lastB}\\n\\nReturn ONLY a JSON object with 'winner' ("A", "B", or "Tie") and 'reason' (short explanation in Hebrew).\`}],
          systemInstruction: 'You are an AI judge. Return valid JSON only.',
          temperature: 0.1
        })
      });
      const data = await res.json();
      let parsed = data.text;
      if (parsed.includes('\`\`\`json')) {
        parsed = parsed.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
      }
      setJudgeResult(JSON.parse(parsed.trim()));
    } catch (e) {
      console.error(e);
    }
    setIsJudging(false);
  };
`;

code = code.replace("const handleSend = async () => {", judgeFunc + "\n  const handleSend = async () => {");

const startTestReplace = `const startTest = async () => {
    setJudgeResult(null);`;
code = code.replace("const startTest = async () => {", startTestReplace);

const handleSendReplace = `const handleSend = async () => {
    setJudgeResult(null);`;
code = code.replace("const handleSend = async () => {", handleSendReplace);

const uiAnchor = `{isABMode && <ChatPane msgs={messagesB} title="מודל B" tag="יצירתי (Temp 0.9)" />}`;
const uiAddition = `
          {judgeResult && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1a1a1a] p-4 rounded-2xl shadow-2xl border border-indigo-200 dark:border-indigo-900/50 z-20 w-80 text-center animate-in fade-in slide-in-from-top-4">
              <div className="text-2xl mb-2">{judgeResult.winner === 'Tie' ? '🤝' : '🏆'}</div>
              <div className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">
                המנצח: {judgeResult.winner === 'Tie' ? 'תיקו' : \`מודל \${judgeResult.winner}\`}
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
`;

code = code.replace(uiAnchor, uiAnchor + uiAddition);

fs.writeFileSync('src/components/PromptTester.tsx', code);
console.log("Patched PromptTester LLM judge successfully!");
