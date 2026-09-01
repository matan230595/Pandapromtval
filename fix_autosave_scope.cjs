const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Move useEffect down
const autosaveLogic = `
  // Auto-save draft
  useEffect(() => {
    if (isEditing && editingPrompt) {
      const timeout = setTimeout(() => {
        localStorage.setItem("promptvault_draft", JSON.stringify(editingPrompt));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isEditing, editingPrompt]);
`;

code = code.replace(
  /\/\/ Auto-save draft\n  useEffect\(\(\) => \{\n    if \(isEditing && editingPrompt\) \{\n      const timeout = setTimeout\(\(\) => \{\n        localStorage\.setItem\("promptvault_draft", JSON\.stringify\(editingPrompt\)\);\n      \}, 1000\);\n      return \(\) => clearTimeout\(timeout\);\n    \}\n  \}, \[isEditing, editingPrompt\]\);/,
  ""
);

code = code.replace(
  /const \[editingPrompt, setEditingPrompt\] = useState<Partial<Prompt> \| null>\(null\);/,
  `$&
  ${autosaveLogic}`
);

// Fix Unlock import
code = code.replace(/FileCode, Lock, Tag/, 'FileCode, Lock, Unlock, Tag');

fs.writeFileSync('src/App.tsx', code);
