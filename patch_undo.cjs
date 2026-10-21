const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Undo the first replacement
code = code.replace(`const handleQuickTest = (prompt: Prompt) => {
    setSelectedPromptId(prompt.id);
    setIsEditing(false);
  };
  
  return (`, `return (`);

// Now put it in the correct place, right before: <div className={`flex flex-col md:flex-row h-screen
code = code.replace(`  return (
    <div className={\`flex flex-col md:flex-row h-screen`, `  const handleQuickTest = (prompt: Prompt) => {
    setSelectedPromptId(prompt.id);
    setIsEditing(false);
  };

  return (
    <div className={\`flex flex-col md:flex-row h-screen`);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched successfully!");
