const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

appTsx = appTsx.replace('handleSaveAsNew={handleSaveAsNew}', '');
appTsx = appTsx.replace('tags={tags}', '');
appTsx = appTsx.replace('platforms={platforms}', '');
appTsx = appTsx.replace('smartVariables={smartVariables}', '');

fs.writeFileSync('src/App.tsx', appTsx);

let editor = fs.readFileSync('src/components/PromptEditor.tsx', 'utf8');
editor = editor.replace('handleSaveAsNew: (p: any) => void;', '');
editor = editor.replace('tags: string[];', '');
editor = editor.replace('platforms: PlatformConfig[];', '');
editor = editor.replace('smartVariables: any[];', '');

editor = editor.replace('handleSaveAsNew, tags, folders', 'folders');
editor = editor.replace('platforms, prompts', 'prompts');
editor = editor.replace('smartVariables, handleVarSelect', 'handleVarSelect');
fs.writeFileSync('src/components/PromptEditor.tsx', editor);
