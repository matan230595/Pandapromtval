const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const colorMap = `
          { label: 'סה״כ פרומפטים', value: prompts.length, icon: Terminal, colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'סך שימושים', value: totalUses, icon: Activity, colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'מועדפים', value: favoritePrompts.length, icon: Heart, colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' },
          { label: 'זמן שנחסך', value: timeSaved, icon: Zap, colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
`;

code = code.replace(
  /\{\s*label: 'סה״כ פרומפטים', value: prompts\.length, icon: Terminal, color: 'blue'\s*\},[\s\S]*?\{\s*label: 'זמן שנחסך', value: timeSaved, icon: Zap, color: 'amber'\s*\},\n/,
  colorMap
);

code = code.replace(
  /className=\{\`w-14 h-14 rounded-2xl flex items-center justify-center text-\\\$\{stat\.color\}-600 dark:text-\\\$\{stat\.color\}-400 bg-\\\$\{stat\.color\}-50 dark:bg-\\\$\{stat\.color\}-900\/20 shadow-inner\`\}/,
  `className={\`w-14 h-14 rounded-2xl flex items-center justify-center \${stat.colorClass} shadow-inner\`}`
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
