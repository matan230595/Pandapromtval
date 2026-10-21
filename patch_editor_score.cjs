const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('ReadabilityScore')) {
  code = code.replace(
    "import { CollectionAssistant } from './components/CollectionAssistant';", // Wait, this is not there yet.
    ""
  );
  code = code.replace(
    "import { VisualDiff } from './components/VisualDiff';",
    "import { VisualDiff } from './components/VisualDiff';\nimport { ReadabilityScore } from './components/ReadabilityScore';\nimport { CollectionAssistant } from './components/CollectionAssistant';"
  );
}

// Add Collection Assistant rendering in App return
code = code.replace(
  '    </motion.div>\n  );',
  '      <CollectionAssistant prompts={prompts} folders={folders} onSelectPrompt={setSelectedPromptId} />\n    </motion.div>\n  );'
);

// Add ReadabilityScore in Editor Toolbar
const readHTML = `<ReadabilityScore content={editingPrompt?.content || ''} />`;
code = code.replace(
  '<button disabled={isRefining} onClick={async () => {',
  readHTML + '\n                      <button disabled={isRefining} onClick={async () => {'
);

fs.writeFileSync('src/App.tsx', code);
