const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`');
  fs.writeFileSync(file, content);
}

fixFile('src/components/CollectionAssistant.tsx');
fixFile('src/components/ReadabilityScore.tsx');
