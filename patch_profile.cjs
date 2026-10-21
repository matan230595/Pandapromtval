const fs = require('fs');
let code = fs.readFileSync('src/components/UserProfileView.tsx', 'utf8');

code = code.replace(
  /<h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">הפרופיל שלי<\/h2>/,
  '<h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 tracking-tight mb-8">הפרופיל שלי</h2>'
);

code = code.replace(
  /className="bg-white dark:bg-\[\#111\] p-6 rounded-2xl border border-slate-200 dark:border-white\/10 shadow-sm/g,
  'className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm'
);

code = code.replace(
  /className="w-24 h-24 rounded-full border-4 border-white dark:border-\[\#111\] shadow-md/g,
  'className="w-24 h-24 rounded-full border-4 border-white dark:border-[#111] shadow-lg ring-4 ring-emerald-50 dark:ring-emerald-900/20'
);

fs.writeFileSync('src/components/UserProfileView.tsx', code);
