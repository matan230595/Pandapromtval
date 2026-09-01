const fs = require('fs');
let code = fs.readFileSync('src/components/PromptTester.tsx', 'utf8');

code = code.replace(
  '<div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col h-[400px]">',
  '<div className="flex flex-col h-full">'
);
code = code.replace(
  '<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">',
  '<label className="hidden">'
);
fs.writeFileSync('src/components/PromptTester.tsx', code);
