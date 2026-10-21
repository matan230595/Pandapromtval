const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace {isEditing ? ( with <AnimatePresence mode="wait">{isEditing ? ( <motion.div ...
code = code.replace(
  '{/* Main Content Area */}\n            {isEditing ? (\n              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-[#0a0a0a]">',
  '{/* Main Content Area */}\n            <AnimatePresence mode="wait">\n            {isEditing ? (\n              <motion.div key="editing" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-[#0a0a0a]">'
);

// Replace ) : selectedPrompt ? ( with ) : selectedPrompt ? ( <motion.div ...
code = code.replace(
  '            ) : selectedPrompt ? (\n                  <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#111] overflow-hidden">',
  '            ) : selectedPrompt ? (\n                  <motion.div key="reading" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col h-full bg-white dark:bg-[#111] overflow-hidden">'
);

// Replace ) : ( with ) : ( <motion.div ...
code = code.replace(
  '            ) : (\n              <div className="flex-1 hidden xl:flex items-center justify-center p-8 bg-slate-50/50 dark:bg-[#0a0a0a]">',
  '            ) : (\n              <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 hidden xl:flex items-center justify-center p-8 bg-slate-50/50 dark:bg-[#0a0a0a]">'
);

// Close the AnimatePresence at the end of the Main Content Area block
// Wait, the end of the block is at around line 2380.
code = code.replace(
  '                </div>\n              </div>\n            )}\n          </>',
  '                </div>\n              </motion.div>\n            )}\n            </AnimatePresence>\n          </>'
);

fs.writeFileSync('src/App.tsx', code);
