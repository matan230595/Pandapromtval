const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const useDocStr = 'await setDoc(doc(db, "users", user.uid, "prompts", prompt.id), updatedPrompt);';
const useDocNew = 'setSyncStatus("syncing");\n      await setDoc(doc(db, "users", user.uid, "prompts", prompt.id), updatedPrompt);\n      setSyncStatus("saved");\n      setTimeout(() => setSyncStatus("idle"), 2000);';
code = code.replace(useDocStr, useDocNew);

fs.writeFileSync(path, code);
