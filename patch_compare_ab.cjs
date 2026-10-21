const fs = require('fs');
let code = fs.readFileSync('src/components/ComparePromptsView.tsx', 'utf8');

code = code.replace(
  "import { X, Copy, ArrowRightLeft } from 'lucide-react';",
  "import { X, Copy, ArrowRightLeft, Play, Loader2, Sparkles } from 'lucide-react';\nimport { useState } from 'react';"
);

code = code.replace(
  'const [p1, p2] = prompts;',
  'const [p1, p2] = prompts;\n  const [testInput, setTestInput] = useState("");\n  const [isTesting, setIsTesting] = useState(false);\n  const [results, setResults] = useState(["", ""]);\n\n  const handleRunABTest = async () => {\n    setIsTesting(true);\n    try {\n      const [res1, res2] = await Promise.all([\n        fetch("/api/gemini/chat", {\n          method: "POST",\n          headers: { "Content-Type": "application/json" },\n          body: JSON.stringify({ message: p1.content + "\\n\\n" + testInput })\n        }),\n        fetch("/api/gemini/chat", {\n          method: "POST",\n          headers: { "Content-Type": "application/json" },\n          body: JSON.stringify({ message: p2.content + "\\n\\n" + testInput })\n        })\n      ]);\n      const data1 = await res1.json();\n      const data2 = await res2.json();\n      setResults([data1.text || "שגיאה", data2.text || "שגיאה"]);\n    } catch (e) {\n      onShowToast("שגיאה בהרצת הבדיקה", "error");\n    }\n    setIsTesting(false);\n  };\n'
);

const sandboxHTML = `
            <div className="p-6 bg-slate-100 dark:bg-[#151515] border-t border-slate-200 dark:border-white/10 shrink-0">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">A/B Testing Sandbox (קלט למבחן)</label>
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="הזן משתנים או טקסט לבדיקה משותפת..."
                  className="flex-1 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                />
                <button 
                  onClick={handleRunABTest}
                  disabled={isTesting || !testInput.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                  {isTesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  הרץ בדיקה
                </button>
              </div>
            </div>
`;

code = code.replace(
  '            </div>\n\n          </div>\n        </motion.div>',
  '            </div>\n' + sandboxHTML + '\n          </div>\n        </motion.div>'
);

const resultsHTML = `
                  {results[idx] && (
                    <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/30">
                      <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> תוצאת מודל
                      </h4>
                      <div className="font-mono text-[14px] leading-7 whitespace-pre-wrap text-slate-800 dark:text-slate-200" dir="auto" dangerouslySetInnerHTML={{ __html: Prism.highlight(results[idx], Prism.languages.markdown, 'markdown') }} />
                    </div>
                  )}
`;

code = code.replace(
  '                  </div>\n                </div>\n              ))}',
  '                  </div>\n' + resultsHTML + '\n                </div>\n              ))}'
);

fs.writeFileSync('src/components/ComparePromptsView.tsx', code);
