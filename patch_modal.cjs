const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importAnchor = `import { FloatingActionBar } from "./components/FloatingActionBar";`;
const importAddition = `\nimport { FilterRulesModal } from "./components/FilterRulesModal";`;
if (!code.includes("FilterRulesModal")) {
    code = code.replace(importAnchor, importAnchor + importAddition);
}

const mountAnchor = `<SmartVariablesModal 
        isOpen={!!smartVarsText}
        onClose={() => setSmartVarsText(null)}
        promptText={smartVarsText || ""}
      />`;
const mountAddition = `
      <FilterRulesModal
        isOpen={isFilterRulesModalOpen}
        onClose={() => setIsFilterRulesModalOpen(false)}
        rules={automationRules}
        setRules={setAutomationRules}
        folders={folders}
      />
`;
code = code.replace(mountAnchor, mountAnchor + mountAddition);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched modal mount");
