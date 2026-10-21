const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
if (!code.includes('import { FilterRulesModal }')) {
  code = code.replace(
    'import { UserProfileView } from "./components/UserProfileView";', 
    'import { UserProfileView } from "./components/UserProfileView";\nimport { FilterRulesModal } from "./components/FilterRulesModal";'
  );
  
  const rulesModalStr = `<FilterRulesModal 
        isOpen={isFilterRulesModalOpen} 
        onClose={() => setIsFilterRulesModalOpen(false)} 
        rules={automationRules} 
        setRules={setAutomationRules} 
        folders={folders} 
      />`;
      
  code = code.replace('<AnimatePresence>', rulesModalStr + '\n      <AnimatePresence>');
  
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx imports and component");
}
