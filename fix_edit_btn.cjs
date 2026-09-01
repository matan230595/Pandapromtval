const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I'll undo the incorrect `{!selectedPrompt.isReadOnly && ` that I might have placed.
code = code.replace(/\{!selectedPrompt\.isReadOnly && <button title="ערוך פרומפט"/, 
  `{!selectedPrompt.isReadOnly && ( <button title="ערוך פרומפט"`);

code = code.replace(/<Edit3 className="w-4\.5 h-4\.5" \/>\s*<\/button>/g, 
  `<Edit3 className="w-4.5 h-4.5" />\n</button>\n)}`);

fs.writeFileSync('src/App.tsx', code);
