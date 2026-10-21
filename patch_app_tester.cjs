const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                           <PromptTester 
                              prompt={selectedPrompt} 
                              onUpdate={handleSave} 
                              onChain={(text) => setChainingText(text)}
                            />`;

const replacement = `                           <PromptTester 
                              prompt={selectedPrompt} 
                              onUpdate={handleSave} 
                              onChain={(text) => setChainingText(text)}
                              nextPromptName={selectedPrompt.chainNextPromptId ? prompts.find(p => p.id === selectedPrompt.chainNextPromptId)?.title : undefined}
                              onAutoChain={(text) => {
                                 if (selectedPrompt.chainNextPromptId) {
                                    setChainingText(text);
                                    const nextP = prompts.find(p => p.id === selectedPrompt.chainNextPromptId);
                                    if (nextP) {
                                      // Directly move to the next prompt and append chaining text
                                      const newContent = nextP.content + "\\n\\n[קלט מהפרומפט הקודם]:\\n" + text;
                                      setSelectedPromptId(nextP.id);
                                      setIsEditing(false);
                                      setSmartVarsText(newContent);
                                      setChainingText(null);
                                    }
                                 }
                              }}
                            />`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
