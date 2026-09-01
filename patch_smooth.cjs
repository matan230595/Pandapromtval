const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const handleTagRegex = /onChange=\{\(e\) => setTagFilter\(e.target.value\)\}/g;
const replacement = `onChange={(e) => {
                        setTagFilter(e.target.value);
                        setTimeout(() => {
                          const grid = document.getElementById('prompts-grid');
                          if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 50);
                      }}`;
code = code.replace(handleTagRegex, replacement);

const gridRegex = /<div className=\{!selectedPromptId && !isEditing \? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start \[perspective:1000px\]" : "space-y-2"\}>/g;
const newGrid = `<div id="prompts-grid" className={!selectedPromptId && !isEditing ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start [perspective:1000px]" : "space-y-2"}>`;
code = code.replace(gridRegex, newGrid);

fs.writeFileSync('src/App.tsx', code);
