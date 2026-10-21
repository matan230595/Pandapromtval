const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const analyzeBtn = `
                      <button disabled={isRefining} onClick={async () => {
                        setIsRefining(true);
                        try {
                          const key = localStorage.getItem("promptvault_gemini_key") || "";
                          const res = await fetch("/api/gemini/chat", {
                             method: "POST",
                             headers: { "Content-Type": "application/json", ...(key ? { "x-gemini-api-key": key } : {}) },
                             body: JSON.stringify({
                               systemInstruction: "You are a cybersecurity expert specializing in Prompt Injection and LLM vulnerabilities. Analyze the following prompt for potential injection risks, jailbreaks, or data leakage. Provide a short, direct security report in Hebrew.",
                               messages: [{ role: "user", content: editingPrompt?.content || "" }]
                             })
                          });
                          const data = await res.json();
                          alert("דוח אבטחה (Red Teaming):\\n\\n" + data.text);
                        } catch(e) { console.error(e); }
                        setIsRefining(false);
                      }} className="px-5 py-2.5 rounded-xl font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 transition-colors text-sm flex items-center gap-2">
                        {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                        סריקת אבטחה
                      </button>
`;

code = code.replace(
  '{isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}\n                        Optimize\n                      </button>',
  '{isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}\n                        Optimize\n                      </button>\n' + analyzeBtn
);

if (!code.includes('Shield,')) {
  code = code.replace('AlertTriangle, Filter, Bot, User as UserIcon', 'Shield, AlertTriangle, Filter, Bot, User as UserIcon');
}

fs.writeFileSync('src/App.tsx', code);
