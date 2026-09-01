const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexFolders = /(<div className="flex-1 overflow-y-auto p-4 space-y-6">[\s\S]*?<FolderIcon className="w-4 h-4 opacity-70" \/> \{f\.name\}\n\s*<\/button>\n\s*\)\)}\n\s*<\/div>)/;

const replacementFolders = `$1

          <div className="space-y-1">
            <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-6">גיבוי וייצוא</div>
            <button onClick={handleExportCSV} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400">
              <Download className="w-4 h-4" /> ייצוא ל-CSV (Excel)
            </button>
            <button onClick={handleExportAll} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400">
              <FileCode className="w-4 h-4" /> גיבוי מלא (JSON)
            </button>
          </div>
`;

code = code.replace(regexFolders, replacementFolders);

fs.writeFileSync('src/App.tsx', code);
