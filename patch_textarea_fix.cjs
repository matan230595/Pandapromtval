const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תיאור קצר</label>`;
                        
const addition = `                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">תוכן הפרומפט</label>
                          <button onClick={handleEnhancePrompt} disabled={isEnhancing} className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50">
                            {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            שפר בעזרת AI
                          </button>
                        </div>
                        <div className="relative">
                          <textarea
                            value={editingPrompt?.content || ""}
                            onChange={handleContentChange}
                            placeholder="הכנס את הפרומפט שלך כאן..."
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-mono text-slate-800 dark:text-slate-200 resize-y min-h-[200px]"
                            dir="auto"
                          />
                          {varSuggest.show && (
                            <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
                              <div className="p-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">משתנים נפוצים</div>
                              {COMMON_VARS.filter(v => v.name.includes(varSuggest.filter)).map(v => (
                                <button
                                  key={v.name}
                                  onClick={() => handleVarSelect(v.name)}
                                  className="w-full text-right px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 transition-colors"
                                >
                                  <div className="font-bold">{v.name}</div>
                                  <div className="text-[10px] text-slate-500">{v.desc}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
`;

if (!code.includes("onChange={handleContentChange}")) {
    code = code.replace(anchor, addition + anchor);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched successfully.");
} else {
    console.log("Already exists.");
}
