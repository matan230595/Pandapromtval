const fs = require('fs');

const appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const editorStart = appTsx.indexOf('{isEditing ? (');
const editorEnd = appTsx.indexOf(') : selectedPrompt ? (');

if (editorStart !== -1 && editorEnd !== -1) {
  let editorJSX = appTsx.substring(editorStart + '{isEditing ? ('.length, editorEnd);
  // Remove the wrapper AnimatePresence motion.div if needed, or keep it.
  
  fs.writeFileSync('editor_jsx.txt', editorJSX);
  console.log("Editor JSX extracted");
} else {
  console.log("Could not find boundaries");
}
