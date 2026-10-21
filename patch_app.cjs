const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Imports
code = code.replace(
  'import { RTLTestResults } from \'./components/RTLTestResults\';',
  'import { RTLTestResults } from \'./components/RTLTestResults\';\nimport { ComparePromptsView } from \'./components/ComparePromptsView\';\nimport { DueReminderModal } from \'./components/DueReminderModal\';'
);

// State
code = code.replace(
  '  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);',
  '  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);\n  const [showCompare, setShowCompare] = useState(false);\n  const [duePrompt, setDuePrompt] = useState<Prompt | null>(null);'
);

// Notification Due Date Interval
const oldNotificationCode = `          if (Math.abs(now.getTime() - due.getTime()) < 60000) {
            if (Notification.permission === "granted") {
              new Notification("תזכורת לפרומפט!", { body: p.title });
            }
          }`;
const newNotificationCode = `          if (Math.abs(now.getTime() - due.getTime()) < 60000) {
            if (Notification.permission === "granted") {
              const n = new Notification("תזכורת לפרומפט!", { body: p.title });
              n.onclick = () => { window.focus(); setDuePrompt(p); };
            }
            setDuePrompt(p);
          }`;

code = code.replace(oldNotificationCode, newNotificationCode);

// Add the snooze handler
code = code.replace(
  '  const handleBulkTag = async (tagsToAdd: string[], tagsToRemove: string[]) => {',
  '  const handleSnooze = (minutes: number) => {\n    if (duePrompt) {\n      const newDue = new Date();\n      newDue.setMinutes(newDue.getMinutes() + minutes);\n      handleSave({...duePrompt, dueDate: newDue.toISOString()});\n      setDuePrompt(null);\n    }\n  };\n\n  const handleBulkTag = async (tagsToAdd: string[], tagsToRemove: string[]) => {'
);


// Framer motion
code = code.replace(
  /\{filteredPrompts\.map\(\(p, idx\) => \(\s*<div\s*key=\{p\.id\}\s*draggable=\{true\}/g,
  '{filteredPrompts.map((p, idx) => (\n                      <motion.div\n                        layout\n                        initial={{ opacity: 0, y: 15 }}\n                        animate={{ opacity: 1, y: 0 }}\n                        transition={{ delay: Math.min(idx * 0.05, 0.5) }}\n                        key={p.id}\n                        draggable={true}'
);

code = code.replace(
  /<\/div>\s*\)\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
  '</motion.div>\n                    ))}\n                  </div>\n                )}\n              </div>\n            </div>\n            </div>\n            </div>'
); // Adjust the replace to match what it is... wait, this is risky. Let's do a more precise replacement for `</motion.div>`.

fs.writeFileSync('src/App.tsx', code);
