const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '}{isReadingMode && <button onClick={() => setIsReadingMode(false)} className="absolute top-4 left-4 z-50 px-4 py-2 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 flex items-center gap-2"><BookOpen className="w-4 h-4"/> יציאה ממצב קריאה</button>}<div className={`flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-[#0a0a0a] overflow-y-auto selection:bg-blue-200 dark:selection:bg-blue-900/50 flex flex-col 2xl:flex-row gap-8 ${isReadingMode ? "mt-12" : ""}`}>',
  '<div className={`flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-[#0a0a0a] overflow-y-auto selection:bg-blue-200 dark:selection:bg-blue-900/50 flex flex-col 2xl:flex-row gap-8 ${isReadingMode ? "mt-12" : ""}`}>{isReadingMode && <button onClick={() => setIsReadingMode(false)} className="absolute top-4 left-4 z-50 px-4 py-2 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 flex items-center gap-2"><BookOpen className="w-4 h-4"/> יציאה ממצב קריאה</button>}'
);

// also I see I replaced it partially in `fix_syntax.cjs`? No, I ran fix_syntax.cjs but let me check if it replaced.
// I will just use regex to fix it safely.
