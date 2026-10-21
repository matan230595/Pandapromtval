const fs = require('fs');

let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Import
code = code.replace(
  'import { InsightsDashboard } from "./components/InsightsDashboard";',
  'import { InsightsDashboard } from "./components/InsightsDashboard";\nimport { DeleteConfirmModal } from "./components/DeleteConfirmModal";'
);

// 2. Add state
code = code.replace(
  'const [varSuggest, setVarSuggest] = useState({show: false, filter: \'\', cursorIndex: 0});',
  'const [varSuggest, setVarSuggest] = useState({show: false, filter: \'\', cursorIndex: 0});\n  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);'
);

// 3. Update the onClick
code = code.replace(
  'onClick={() => handleDelete(selectedPrompt.id)}',
  'onClick={() => setPromptToDelete(selectedPrompt.id)}'
);

// 4. Add the component at the end of the return statement
code = code.replace(
  '<ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />',
  '<ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />\n      <DeleteConfirmModal \n        isOpen={!!promptToDelete}\n        onClose={() => setPromptToDelete(null)}\n        onConfirm={() => promptToDelete && handleDelete(promptToDelete)}\n        title={prompts.find(p => p.id === promptToDelete)?.title}\n      />'
);

fs.writeFileSync(path, code);
console.log("Patched App.tsx with DeleteConfirmModal");
