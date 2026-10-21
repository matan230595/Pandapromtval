const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`');
  fs.writeFileSync(file, content);
}

fixFile('src/components/EvaluationPanel.tsx');
fixFile('src/components/IntegrationPanel.tsx');
