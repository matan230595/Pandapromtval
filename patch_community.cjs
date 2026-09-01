const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importCommunity = `import { CommunityTemplates } from "./components/CommunityTemplates";\n`;
code = code.replace('import { TagCombobox }', importCommunity + 'import { TagCombobox }');

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
code = code.replace('</AnimatePresence>\n                </div>\n              </div>\n            ) : (', '</AnimatePresence>\n                </div>\n                )}\n              </div>\n            ) : (');

fs.writeFileSync('src/App.tsx', code);
