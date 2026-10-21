const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'oldText={selectedPrompt.history[historyIndex].content}',
  'oldText={selectedPrompt.history[historyIndex]?.content || \'\'}'
);
code = code.replace(
  'newText={historyCompareIndex === -1 ? selectedPrompt.content : selectedPrompt.history[historyCompareIndex].content}',
  'newText={historyCompareIndex === -1 ? selectedPrompt.content : (selectedPrompt.history[historyCompareIndex]?.content || \'\')}'
);
code = code.replace(
  'new Date(selectedPrompt.history[historyCompareIndex].updatedAt)',
  'new Date(selectedPrompt.history[historyCompareIndex]?.updatedAt || Date.now())'
);
code = code.replace(
  'new Date(selectedPrompt.history[historyIndex].updatedAt)',
  'new Date(selectedPrompt.history[historyIndex]?.updatedAt || Date.now())'
);
code = code.replace(
  'handleSave({...selectedPrompt, content: selectedPrompt.history![historyIndex].content});',
  'if(selectedPrompt.history![historyIndex]) handleSave({...selectedPrompt, content: selectedPrompt.history![historyIndex].content});'
);

fs.writeFileSync(path, code);
