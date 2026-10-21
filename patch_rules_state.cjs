const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `const [appLanguage, setAppLanguage] = useState<Language>(() => {`;

const addition = `
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => {
    const saved = localStorage.getItem("promptvault_rules");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("promptvault_rules", JSON.stringify(automationRules));
  }, [automationRules]);
  
  const [isFilterRulesModalOpen, setIsFilterRulesModalOpen] = useState(false);
`;

if (!code.includes("automationRules")) {
    code = code.replace(anchor, addition + "\\n  " + anchor);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched state");
} else {
    console.log("State already patched");
}
