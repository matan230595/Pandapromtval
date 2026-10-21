const fs = require('fs');
let code = fs.readFileSync('src/components/FloatingActionBar.tsx', 'utf8');

code = code.replace(
  '  onMove: () => void;',
  '  onMove: () => void;\n  onRename?: () => void;'
);

code = code.replace(
  '  onMove,\n  onExport,',
  '  onMove,\n  onExport,\n  onRename,'
);

code = code.replace(
  '          <button\n            onClick={onMove}',
  '          {onRename && (\n            <button\n              onClick={onRename}\n              className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-slate-700 dark:text-slate-300"\n            >\n              <Edit3 className="w-4 h-4" /> שנה שם\n            </button>\n          )}\n          <button\n            onClick={onMove}'
);

code = code.replace(
  'import { Trash2, FolderPlus, Download, X, Tags, Copy, ArrowRightLeft } from \'lucide-react\';',
  'import { Trash2, FolderPlus, Download, X, Tags, Copy, ArrowRightLeft, Edit3 } from \'lucide-react\';'
);

fs.writeFileSync('src/components/FloatingActionBar.tsx', code);
