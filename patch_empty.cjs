const fs = require('fs');
let code = fs.readFileSync('src/components/EmptyStates.tsx', 'utf8');

code = code.replace(
  /className="text-xl font-bold text-slate-900 dark:text-white mb-2"/g,
  'className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3"'
);

code = code.replace(
  /className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-\[400px\]"/g,
  'className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px] border-2 border-dashed border-slate-200/60 dark:border-white/10 rounded-3xl m-4 glass-panel"'
);

fs.writeFileSync('src/components/EmptyStates.tsx', code);
