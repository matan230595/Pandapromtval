const fs = require('fs');
let code = fs.readFileSync('src/components/VisualWorkflow.tsx', 'utf8');

const importReplacement = `import { GitMerge, Play, Save, Loader2, CheckCircle2, AlertCircle, Webhook } from 'lucide-react';`;
code = code.replace(/import \{ GitMerge, Play, Save, Loader2, CheckCircle2, AlertCircle \} from 'lucide-react';/, importReplacement);

const newNodesReplace = `
const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'קלט התחלתי (Input)', isInput: true }, type: 'input' },
];
`;
const newNodesValue = `
const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Webhook (Trigger)', isInput: true }, type: 'input' },
];
`;
code = code.replace(newNodesReplace, newNodesValue);

const addTriggerBtnHTML = `
            <button 
              onClick={() => {
                const newNode: Node = {
                  id: (nodes.length + 1).toString(),
                  position: { x: 250, y: nodes.length * 100 + 50 },
                  data: { label: 'Webhook Trigger', isInput: true },
                  type: 'input'
                };
                setNodes((nds) => nds.concat(newNode));
              }}
              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <Webhook className="w-3.5 h-3.5" /> הוסף טריגר
            </button>
`;

code = code.replace(
  '              הוסף צומת\n            </button>\n          </div>',
  '              הוסף צומת\n            </button>\n' + addTriggerBtnHTML + '\n          </div>'
);

fs.writeFileSync('src/components/VisualWorkflow.tsx', code);
