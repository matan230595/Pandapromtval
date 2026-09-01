const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  /className=\{`w-14 h-14 rounded-2xl flex items-center justify-center text-\$\{stat\.color\}-600 dark:text-\$\{stat\.color\}-400 bg-\$\{stat\.color\}-50 dark:bg-\$\{stat\.color\}-900\/20 shadow-inner`\}/,
  'className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.colorClass} shadow-inner`}'
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
