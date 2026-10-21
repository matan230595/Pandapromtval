const fs = require('fs');
let code = fs.readFileSync('src/components/PromptTester.tsx', 'utf8');

if (!code.includes('SmartVariablesModal')) {
    code = code.replace("import { Prompt } from '../types';", "import { Prompt } from '../types';\nimport { SmartVariablesModal } from './SmartVariablesModal';");
}

code = code.replace("const [isABMode, setIsABMode] = useState(false);", "const [isABMode, setIsABMode] = useState(false);\n  const [showVarsModal, setShowVarsModal] = useState(false);");

code = code.replace("const startTest = async () => {\n    setStarted(true);\n    const initialMsg = {role: 'user' as const, content: prompt.content};", `const startTest = async () => {
    if (/\\$\\([^)]+\\)|\\{\\{[^}]+\\}\\}/.test(prompt.content)) {
      setShowVarsModal(true);
      return;
    }
    doStartTest(prompt.content);
  };

  const doStartTest = async (resolvedContent: string) => {
    setStarted(true);
    const initialMsg = {role: 'user' as const, content: resolvedContent};`);

code = code.replace(/<\/div>\n      \)\}\n    <\/div>\n  \);\n\};/g, `</div>
      )}
      <SmartVariablesModal 
        isOpen={showVarsModal} 
        onClose={() => setShowVarsModal(false)} 
        originalText={prompt.content}
        actionType="test"
        onComplete={(text) => {
           setShowVarsModal(false);
           doStartTest(text);
        }}
      />
    </div>
  );
};`);

fs.writeFileSync('src/components/PromptTester.tsx', code);
console.log("Patched PromptTester.tsx successfully!");
