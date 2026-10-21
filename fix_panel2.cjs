const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationPanel.tsx', 'utf8');

content = content.replace(
  '{"score": number}"',
  '{\\"score\\": number}"'
);

fs.writeFileSync('src/components/EvaluationPanel.tsx', content);
