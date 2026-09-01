const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{selectedFolder === "community" \? \(\n\s*<CommunityTemplates onImport=\{\(p\) => \{\n\s*handleSave\(\{ \.\.\.p, folder: folders\[0\]\?\.id \|\| 'all' \}\);\n\s*setSelectedFolder\('all'\);\n\s*\}\} \/>\n\s*\) : \(\n\s*<div className=\{!selectedPromptId && !isEditing \? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start \[perspective:1000px\]" : "space-y-2"\}>/m, '<div className={!selectedPromptId && !isEditing ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start [perspective:1000px]" : "space-y-2"}>');

// Now add it back properly
const renderCommunity = `
                {selectedFolder === "community" ? (
                  <CommunityTemplates onImport={(p) => {
                    handleSave({ ...p, folder: folders[0]?.id || 'all' });
                    setSelectedFolder('all');
                  }} />
                ) : (
                  <div className={!selectedPromptId && !isEditing ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start [perspective:1000px]" : "space-y-2"}>
`;

code = code.replace('<div className={!selectedPromptId && !isEditing ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start [perspective:1000px]" : "space-y-2"}>', renderCommunity);

code = code.replace('</AnimatePresence>\n                </div>\n              </div>\n            </div>', '</AnimatePresence>\n                </div>\n                )}\n              </div>\n            </div>');

fs.writeFileSync('src/App.tsx', code);
