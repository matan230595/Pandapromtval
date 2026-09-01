const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{selectedFolder === "community" \? \([\s\S]*?<\/CommunityTemplates>\s*\)\s*:\s*\(/;

const replacement = `{selectedFolder === "community" ? (
                  <CommunityView onImport={(p) => {
                    handleSave({ ...p, folder: folders.length > 0 ? folders[0].id : 'all' });
                    setSelectedFolder('all');
                  }} onShowToast={showToast} />
                ) : (`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
