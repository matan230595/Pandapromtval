const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("import { Prompt, Folder, PlatformConfig, ChatMessage, Project, PromptVersion, Review } from './types';", "import { Prompt, Folder, PlatformConfig, ChatMessage, Project, PromptVersion, Review, AutomationRule } from './types';");
fs.writeFileSync('src/App.tsx', code);
