const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexToggleFavorite = /const toggleFavorite = \(id: string, e\?: React\.MouseEvent\) => \{[\s\S]*?\}\;/;
const replacement = `const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const prompt = prompts.find(p => p.id === id);
    if (prompt) handleSave({ ...prompt, favorite: !prompt.favorite });
  };
  
  const handleQuickArchive = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const prompt = prompts.find(p => p.id === id);
    if (prompt) handleSave({ ...prompt, folder: "archive" });
  };
`;
code = code.replace(regexToggleFavorite, replacement);

const regexCardHeart = /<button onClick=\{\(e\) => toggleFavorite\(p\.id, e\)\} className="text-slate-300 hover:text-red-500 transition-colors">\n\s*<Heart className=\{`w-4 h-4 \$\{p\.favorite \? "fill-red-500 text-red-500" : ""\}`\} \/>\n\s*<\/button>/g;
const replacementCardHeart = `
                          <div className="flex items-center gap-2">
                            <button onClick={(e) => handleQuickArchive(p.id, e)} className="text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors" title="העבר לארכיון">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => toggleFavorite(p.id, e)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Heart className={\`w-4 h-4 \${p.favorite ? "fill-red-500 text-red-500" : ""}\`} />
                            </button>
                          </div>
`;
code = code.replace(regexCardHeart, replacementCardHeart);

fs.writeFileSync('src/App.tsx', code);
