const fs = require('fs');
let code = fs.readFileSync('src/components/PromptTester.tsx', 'utf8');

const exportBtn = `
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
                    const webhookUrl = prompt("הזן כתובת Webhook לייצוא:");
                    if (webhookUrl) {
                      fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: m.content, promptId: prompt.id })
                      }).then(() => alert("נשלח בהצלחה!")).catch(() => alert("שגיאה בשליחה"));
                    }
                  }}
                  title="ייצא ל-Webhook"
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-emerald-600"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
`;

code = code.replace(
  '            {m.role === \'assistant\' && !isABMode && onChain && (\n              <button \n                onClick={() => onChain(m.content)}\n                title="שרשר פלט זה לפרומפט הבא"\n                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-indigo-600 transition-all self-end mb-1"\n              >\n                <Link2 className="w-4 h-4" />\n              </button>\n            )}',
  exportBtn
);

fs.writeFileSync('src/components/PromptTester.tsx', code);
