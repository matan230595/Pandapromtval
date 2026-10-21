const fs = require('fs');
let code = fs.readFileSync('src/components/PromptTester.tsx', 'utf8');

const importRegex = /import \{ (.*?) \} from 'lucide-react';/;
if (code.match(importRegex)) {
    code = code.replace(importRegex, "import { $1, Link2 } from 'lucide-react';");
}

code = code.replace("interface Props {", "interface Props {\n  onChain?: (text: string) => void;");
code = code.replace("export const PromptTester: React.FC<Props> = ({ prompt, onUpdate }) => {", "export const PromptTester: React.FC<Props> = ({ prompt, onUpdate, onChain }) => {");

const uiAnchor = `{m.content}\n            </div>`;
const uiAddition = `
            {m.role === 'assistant' && !isABMode && onChain && (
              <button 
                onClick={() => onChain(m.content)}
                title="שרשר פלט זה לפרומפט הבא"
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-indigo-600 transition-all self-end mb-1"
              >
                <Link2 className="w-4 h-4" />
              </button>
            )}
`;
code = code.replace(uiAnchor, uiAnchor + uiAddition);
code = code.replace("key={i} className={`flex gap-3", "key={i} className={`flex gap-3 group");

fs.writeFileSync('src/components/PromptTester.tsx', code);
console.log("Patched PromptTester chain successfully!");
