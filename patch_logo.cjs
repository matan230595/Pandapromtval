const fs = require('fs');
let codeApp = fs.readFileSync('src/App.tsx', 'utf8');
let codeDash = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

codeApp = codeApp.replace(
  /<img src="\/logo\.png" alt="Panda Mascot"[^>]*>/g,
  '<Bot className="w-full h-full text-blue-500 opacity-20" />'
);

codeDash = codeDash.replace(
  /<img src="\/logo\.png" alt="Panda Mascot"[^>]*>/g,
  '<Bot className="w-full h-full text-blue-500 opacity-20" />'
);
codeDash = codeDash.replace(
  '<Bot className="w-full h-full text-blue-500 opacity-20" />',
  '<Bot className="relative z-10 w-48 h-48 lg:w-64 lg:h-64 text-blue-400 opacity-20 drop-shadow-2xl" />'
);

if (!codeDash.includes('Bot')) {
  codeDash = codeDash.replace(/Calendar } from 'lucide-react';/, "Calendar, Bot } from 'lucide-react';");
}

fs.writeFileSync('src/App.tsx', codeApp);
fs.writeFileSync('src/components/DashboardView.tsx', codeDash);
