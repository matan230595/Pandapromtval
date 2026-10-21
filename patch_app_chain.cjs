const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("const [smartVarsText, setSmartVarsText] = useState<string | null>(null);", "const [smartVarsText, setSmartVarsText] = useState<string | null>(null);\n  const [chainingText, setChainingText] = useState<string | null>(null);");

const paletteAnchor = `<CommandPalette 
        isOpen={isPaletteOpen}`;
const paletteReplace = `<CommandPalette 
        isOpen={isPaletteOpen || !!chainingText}
        setIsOpen={(open) => {
           if (!open) { setIsPaletteOpen(false); setChainingText(null); }
           else setIsPaletteOpen(true);
        }}`;
code = code.replace(paletteAnchor, paletteReplace);

const selectPromptAnchor = `onSelectPrompt={(id) => { setSelectedPromptId(id); setIsEditing(false); }}`;
const selectPromptReplace = `onSelectPrompt={(id) => { 
          const p = prompts.find(pr => pr.id === id);
          if (chainingText && p) {
             const newContent = p.content + "\\n\\n[קלט מהפרומפט הקודם]:\\n" + chainingText;
             setSmartVarsText(newContent);
             setChainingText(null);
          } else {
             setSelectedPromptId(id); 
             setIsEditing(false); 
          }
        }}`;
code = code.replace(selectPromptAnchor, selectPromptReplace);

const promptTesterAnchor = `<PromptTester prompt={selectedPrompt} onUpdate={handleSave} />`;
const promptTesterReplace = `<PromptTester 
                              prompt={selectedPrompt} 
                              onUpdate={handleSave} 
                              onChain={(text) => setChainingText(text)}
                            />`;
code = code.replace(promptTesterAnchor, promptTesterReplace);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx chain successfully!");
