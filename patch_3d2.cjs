const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexContainer = /<div className=\{!\(selectedPromptId && !isEditing\) \? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start" : "space-y-2"\}>/;
code = code.replace(
  '<div className={!selectedPromptId && !isEditing ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start" : "space-y-2"}>',
  '<div className={!selectedPromptId && !isEditing ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start [perspective:1000px]" : "space-y-2"}>'
);

code = code.replace(
  /transition=\{\{ duration: 0\.2 \}\}/,
  'transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}\n                    whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2, z: 20, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}'
);

fs.writeFileSync('src/App.tsx', code);
