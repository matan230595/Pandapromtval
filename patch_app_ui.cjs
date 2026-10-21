const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Upgrade the card design in the Kanban view
code = code.replace(
  /className=\{`cursor-pointer rounded-xl border p-4 bg-white dark:bg-\[\#111\] hover:-translate-y-1 hover:shadow-lg transition-all active:cursor-grabbing border-slate-200 dark:border-white\/5 hover:border-slate-300 dark:hover:border-white\/20`\}/g,
  'className={`cursor-pointer rounded-2xl border p-5 bg-white dark:bg-[#111] hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 active:cursor-grabbing border-slate-200/60 dark:border-white/10 hover:border-blue-400/50 dark:hover:border-blue-500/50`}'
);

// Upgrade the card design in the Grid/List view
code = code.replace(
  /className=\{`cursor-pointer rounded-2xl border transition-all active:cursor-grabbing \$\{\!selectedPromptId && \!isEditing \? 'p-5 hover:-translate-y-1 hover:shadow-lg' : 'p-3'\} \$\{pulsingPromptId === p.id \? 'animate-pulse ring-2 ring-blue-500 shadow-lg' : ''\} \$\{selectedPromptId === p.id \|\| focusedPromptIndex === filteredPrompts.indexOf\(p\) \? 'bg-blue-50 dark:bg-blue-900\/10 border-blue-200 dark:border-blue-800\/50 ring-2 ring-blue-500\/30' : 'bg-white dark:bg-\[\#111\] border-slate-200 dark:border-white\/5 hover:border-slate-300 dark:hover:border-white\/20'\}\`/g,
  'className={`cursor-pointer rounded-[20px] border transition-all duration-300 active:cursor-grabbing ${!selectedPromptId && !isEditing ? \'p-6 hover:-translate-y-1.5 hover:shadow-xl\' : \'p-4 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]\'} ${pulsingPromptId === p.id ? \'animate-pulse ring-2 ring-blue-500 shadow-xl\' : \'\'} ${selectedPromptId === p.id || focusedPromptIndex === filteredPrompts.indexOf(p) ? \'bg-blue-50/80 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700/50 ring-2 ring-blue-500/40\' : \'bg-white dark:bg-[#111] border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20\'}`'
);

// Enhance search input
code = code.replace(
  /className="w-full ps-9 pe-10 py-2 bg-slate-100 dark:bg-white\/5 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500\/50"/g,
  'className="w-full ps-10 pe-12 py-2.5 bg-white dark:bg-[#111] border border-slate-200/60 dark:border-white/10 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all focus:shadow-md"'
);

// Enhance top bar
code = code.replace(
  /className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-\[\#111\] border-b border-slate-200 dark:border-white\/10 shrink-0"/g,
  'className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-slate-200/50 dark:border-white/10 shrink-0 sticky top-0 z-40"'
);

fs.writeFileSync('src/App.tsx', code);
