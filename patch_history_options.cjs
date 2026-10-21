const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<option key=\{i\} value=\{i\}>גרסה ישנה: \{new Date\(h.updatedAt\).toLocaleString\('he-IL'\)\}<\/option>/g,
  '<option key={i} value={i}>{h.versionName ? `[${h.versionName}] ` : ""}גרסה ישנה: {new Date(h.updatedAt).toLocaleString("he-IL")}</option>'
);

code = code.replace(
  '<option value={-1}>גרסה נוכחית (היום)</option>',
  '<option value={-1}>{selectedPrompt.currentVersionName ? `[${selectedPrompt.currentVersionName}] ` : ""}גרסה נוכחית (היום)</option>'
);

code = code.replace(
  "גרסה מתאריך ${new Date(selectedPrompt.history[historyCompareIndex]?.updatedAt || Date.now()).toLocaleDateString('he-IL')}`}",
  "${selectedPrompt.history[historyCompareIndex]?.versionName ? `[${selectedPrompt.history[historyCompareIndex]?.versionName}]` : \"\"} גרסה מתאריך ${new Date(selectedPrompt.history[historyCompareIndex]?.updatedAt || Date.now()).toLocaleDateString('he-IL')}`}"
);

code = code.replace(
  "לגרסה מתאריך {new Date(selectedPrompt.history[historyIndex]?.updatedAt || Date.now()).toLocaleDateString('he-IL')}",
  "ל{selectedPrompt.history[historyIndex]?.versionName ? `[${selectedPrompt.history[historyIndex]?.versionName}] ` : \"\"}גרסה מתאריך {new Date(selectedPrompt.history[historyIndex]?.updatedAt || Date.now()).toLocaleDateString('he-IL')}"
);

fs.writeFileSync('src/App.tsx', code);
