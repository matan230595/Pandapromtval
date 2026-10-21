const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newSaveLogic = `
      const existing = prompts.find(p => p.id === promptData.id);
      if (!existing) return;
      
      const newHistory = existing.history ? [...existing.history] : [];
      if (existing.content !== promptData.content || (promptData.currentVersionName && existing.currentVersionName !== promptData.currentVersionName)) {
        newHistory.unshift({
          content: existing.content,
          updatedAt: existing.updatedAt,
          versionName: existing.currentVersionName,
          versionId: (crypto.randomUUID ? (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)) : Math.random().toString(36).substring(2))
        });
      }
`;

code = code.replace(
  '      const existing = prompts.find(p => p.id === promptData.id);\n      if (!existing) return;\n      \n      const newHistory = existing.history ? [...existing.history] : [];\n      if (existing.content !== promptData.content) {\n        newHistory.unshift({\n          content: existing.content,\n          updatedAt: existing.updatedAt,\n          versionId: (crypto.randomUUID ? (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)) : Math.random().toString(36).substring(2))\n        });\n      }',
  newSaveLogic
);

fs.writeFileSync('src/App.tsx', code);
