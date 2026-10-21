const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /\) : selectedPrompt \? \(\s*<div className="flex-1 flex flex-col h-full bg-white dark:bg-\[#111\] overflow-hidden">\s*<div className="md:hidden border-b/,
  ') : selectedPrompt ? (\n                  <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#111] overflow-hidden">\n                    <div className="flex-1 overflow-y-auto flex flex-col">\n                    <div className="md:hidden border-b'
);

code = code.replace(
  'overflow-y-auto selection:bg-blue-200',
  'selection:bg-blue-200'
);

code = code.replace(
  '                    </div>\n                  )}\n                </div>\n            ) : (\n              <div className="flex-1 hidden xl:flex',
  '                    </div>\n                  )}\n                  </div>\n                </div>\n            ) : (\n              <div className="flex-1 hidden xl:flex'
);

code = code.replace(
  '<FolderIcon className="w-4 h-4 opacity-70" /> {f.name}',
  '<FolderIcon className="w-4 h-4" style={{ color: f.color || \'currentColor\', opacity: f.color ? 1 : 0.7 }} /> {f.name}'
);

fs.writeFileSync('src/App.tsx', code);
