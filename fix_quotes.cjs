const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(/\\`\\\$\\{Math\.floor\(minutes \/ 60\)\\} שעות\\`/, '`${Math.floor(minutes / 60)} שעות`');
code = code.replace(/\\`\\\$\\{minutes\\} דקות\\`/, '`${minutes} דקות`');

fs.writeFileSync('src/components/DashboardView.tsx', code);
