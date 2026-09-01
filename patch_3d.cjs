const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexContainer = /<div className=\{!\(selectedPromptId \|\| isEditing\) \? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start" : "space-y-2"\}>/;
const newContainer = `<div className={!(selectedPromptId || isEditing) ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 content-start perspective-[2000px]" : "space-y-2 perspective-[2000px]"}>`;
code = code.replace(regexContainer, newContainer);

const regexCard = /<div\n\s*key=\{p\.id\}\n\s*onClick=\{\(\) => \{/;
const newCard = `<motion.div
                    layout
                    initial={{ opacity: 0, y: 20, rotateX: -5 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    whileHover={{ scale: 1.01, z: 10, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    key={p.id}
                    onClick={() => {`;
code = code.replace(regexCard, newCard);

const closingDiv = /<\/div>\n\s*\)\)\n\s*\}<\/div>/;
const closingMotion = `</motion.div>\n                  ))\n                }</div>`;
code = code.replace(closingDiv, closingMotion);

fs.writeFileSync('src/App.tsx', code);
