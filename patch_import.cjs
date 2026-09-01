const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityView.tsx', 'utf8');

const importRegex = /const handleImport = async \(prompt: PublicPrompt\) => \{[\s\S]*?onImport\(prompt\);/;
const replacement = `const handleImport = async (prompt: PublicPrompt) => {
    const newPrompt = {
      ...prompt,
      id: Date.now().toString(),
      useCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isReadOnly: false,
      history: []
    };
    onImport(newPrompt);`;

code = code.replace(importRegex, replacement);

fs.writeFileSync('src/components/CommunityView.tsx', code);
