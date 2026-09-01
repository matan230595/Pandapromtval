const fs = require('fs');
let code = fs.readFileSync('src/components/InsightsDashboard.tsx', 'utf8');

code = code.replace(
  'const avgUsage = prompts.length ? (totalUsage / prompts.length).toFixed(1) : \'0\';',
  'const avgUsageStr = prompts.length ? (totalUsage / prompts.length).toFixed(1) : \'0\';\n  const avgUsage = parseFloat(avgUsageStr);'
);

code = code.replace(
  'value={avgUsage}',
  'value={avgUsageStr}'
);

fs.writeFileSync('src/components/InsightsDashboard.tsx', code);
