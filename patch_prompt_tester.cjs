const fs = require('fs');
let code = fs.readFileSync('src/components/PromptTester.tsx', 'utf8');

// Add props
code = code.replace(
  'interface Props {\n  onChain?: (text: string) => void;\n  prompt: Prompt;\n  onUpdate?: (prompt: Prompt) => void;\n}',
  'interface Props {\n  onChain?: (text: string) => void;\n  prompt: Prompt;\n  onUpdate?: (prompt: Prompt) => void;\n  nextPromptName?: string;\n  onAutoChain?: (text: string) => void;\n}'
);

code = code.replace(
  'export const PromptTester: React.FC<Props> = ({ prompt, onUpdate, onChain }) => {',
  'export const PromptTester: React.FC<Props> = ({ prompt, onUpdate, onChain, nextPromptName, onAutoChain }) => {'
);

// Add AutoChain button after the message bubble for assistant if it's the last message
const autoChainBtn = `
            {m.role === 'assistant' && !isABMode && i === msgs.length - 1 && nextPromptName && onAutoChain && (
              <div className="w-full mt-2 ml-12">
                <button 
                  onClick={() => onAutoChain(m.content)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 animate-in fade-in"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  העבר אוטומטית לפרומפט הבא: {nextPromptName}
                </button>
              </div>
            )}
`;

code = code.replace(
  /(\s*)(<\/div>\s*\{\/\* end message bubble \*\/\} \/\* Note: I will just inject it inside the map \*\/\s*)\}?\s*<\/div>\s*\)\)}/s,
  ''
);
// To be safe, I'll just use string replacement on a unique part
code = code.replace(
  '              </button>\n            )}\n          </div>',
  '              </button>\n            )}\n          </div>' + autoChainBtn
);

fs.writeFileSync('src/components/PromptTester.tsx', code);
