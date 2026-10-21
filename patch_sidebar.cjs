const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '          <button onClick={() => setIsSettingsModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 py-2.5 rounded-xl font-medium transition-colors text-sm mb-2">',
  '          <button onClick={() => setIsShortcutsOpen(true)} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 py-2.5 rounded-xl font-medium transition-colors text-sm mb-2">\n            <Command className="w-4 h-4" /> קיצורי מקלדת\n          </button>\n          <button onClick={() => setIsSettingsModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 py-2.5 rounded-xl font-medium transition-colors text-sm mb-2">'
);

fs.writeFileSync('src/App.tsx', code);
