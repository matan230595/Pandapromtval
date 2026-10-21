const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\\\\$/g, '$');
  content = content.replace(/\\\\\n/g, '\\n');
  content = content.replace(/\\\\\`/g, '`');
  content = content.replace(/\\\\"score\\\\"/g, '"score"');
  fs.writeFileSync(file, content);
}

fixFile('src/components/EvaluationPanel.tsx');
