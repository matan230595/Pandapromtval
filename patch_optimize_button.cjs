const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '                      <button onClick={() => { setIsEditing(false); if(!editingPrompt?.id) setSelectedPromptId(null); }} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm">',
  '                      <button disabled={isRefining} onClick={handleRefinePrompt} className="px-5 py-2.5 rounded-xl font-bold text-purple-600 dark:text-purple-400 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 transition-colors text-sm flex items-center gap-2">\n                        {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}\n                        Optimize\n                      </button>\n                      <button onClick={() => { setIsEditing(false); if(!editingPrompt?.id) setSelectedPromptId(null); }} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm">'
);

fs.writeFileSync('src/App.tsx', code);
