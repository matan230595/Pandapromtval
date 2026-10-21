const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '<div className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-500"/> שימושים: {selectedPrompt.useCount || 0}</div>',
  '<motion.div key={selectedPrompt.useCount} initial={{ scale: 1.5, color: "#3b82f6" }} animate={{ scale: 1, color: "inherit" }} transition={{ duration: 0.3 }} className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-500"/> שימושים: {selectedPrompt.useCount || 0}</motion.div>'
);

fs.writeFileSync('src/App.tsx', code);
