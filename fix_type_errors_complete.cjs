const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add missing imports
if (!code.includes('import Joyride')) {
  code = code.replace(
    'import { SmartVariablesModal } from "./components/SmartVariablesModal";',
    'import { SmartVariablesModal } from "./components/SmartVariablesModal";\nimport Joyride, { CallBackProps, STATUS } from "react-joyride";\nimport { ReadabilityScore } from "./components/ReadabilityScore";\nimport { CollectionAssistant } from "./components/CollectionAssistant";\nimport { SmartImportModal } from "./components/SmartImportModal";'
  );
}

fs.writeFileSync('src/App.tsx', code);
