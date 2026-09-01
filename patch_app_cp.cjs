const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<CommandPalette\s*prompts=\{prompts\}\s*folders=\{folders\}\s*onSelectPrompt=\{setSelectedPromptId\}\s*onSelectFolder=\{setActiveFolder\}\s*onCreatePrompt=\{\(\) => setIsEditing\(true\)\}\s*isOpen=\{isCommandPaletteOpen\}\s*setIsOpen=\{setIsCommandPaletteOpen\}\s*\/>/g,
  '<CommandPalette\n        prompts={prompts}\n        folders={folders}\n        onSelectPrompt={setSelectedPromptId}\n        onSelectFolder={setActiveFolder}\n        onCreatePrompt={() => setIsEditing(true)}\n        isOpen={isCommandPaletteOpen}\n        setIsOpen={setIsCommandPaletteOpen}\n        isDarkMode={isDarkMode}\n        toggleTheme={() => setIsDarkMode(!isDarkMode)}\n      />'
);

fs.writeFileSync('src/App.tsx', code);
