const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update INITIAL_PROMPTS to add dummy usageHistory (spread out over days and hours)
code = code.replace(
  'useCount: 12, projectId: "default", language: "he"',
  'useCount: 12, usageHistory: Array.from({length: 12}, (_, i) => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()), projectId: "default", language: "he"'
);
code = code.replace(
  'useCount: 5, projectId: "default", language: "he"',
  'useCount: 5, usageHistory: Array.from({length: 5}, (_, i) => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()), projectId: "default", language: "he"'
);
code = code.replace(
  'useCount: 8, projectId: "default", language: "he"',
  'useCount: 8, usageHistory: Array.from({length: 8}, (_, i) => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()), projectId: "default", language: "he"'
);

// Update handleCopy
code = code.replace(
  'if (p) handleSave({...p, useCount: (p.useCount || 0) + 1, lastUsedAt: new Date().toISOString()});',
  'if (p) handleSave({...p, useCount: (p.useCount || 0) + 1, lastUsedAt: new Date().toISOString(), usageHistory: [...(p.usageHistory || []), new Date().toISOString()]});'
);

fs.writeFileSync('src/App.tsx', code);
