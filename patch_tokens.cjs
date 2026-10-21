const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `                          {varSuggest.show && (`;

const addition = `                          <div className="absolute bottom-3 left-3 text-[10px] font-bold text-slate-400 bg-white/80 dark:bg-black/80 px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                            ~{Math.ceil((editingPrompt?.content?.length || 0) / 3.5)} טוקנים
                          </div>
`;

if (!code.includes("טוקנים")) {
    code = code.replace(anchor, addition + anchor);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched token counter successfully.");
} else {
    console.log("Already exists.");
}
