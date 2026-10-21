const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("return (", `const handleQuickTest = (prompt: Prompt) => {
    setSelectedPromptId(prompt.id);
    setIsEditing(false);
  };
  
  return (`);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched successfully!");
