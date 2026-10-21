const fs = require('fs');
let content = fs.readFileSync('src/components/AdvancedAnalytics.tsx', 'utf8');

content = content.replace(
  'key={\\`cell-\\${index}\\`}',
  'key={`cell-${index}`}'
);

fs.writeFileSync('src/components/AdvancedAnalytics.tsx', content);
