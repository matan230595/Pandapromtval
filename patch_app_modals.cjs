const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '      <SmartVariablesModal',
  '      <ComparePromptsView \n        isOpen={showCompare}\n        onClose={() => setShowCompare(false)}\n        prompts={prompts.filter(p => selectedIds.includes(p.id))}\n        onShowToast={showToast}\n      />\n      <DueReminderModal\n        prompt={duePrompt}\n        onClose={() => setDuePrompt(null)}\n        onSnooze={handleSnooze}\n      />\n      <SmartVariablesModal'
);

// We also need to make sure FloatingActionBar passes onCompare!
code = code.replace(
  '        onExport={handleBulkExport}',
  '        onExport={handleBulkExport}\n        onCompare={() => setShowCompare(true)}'
);

fs.writeFileSync('src/App.tsx', code);
