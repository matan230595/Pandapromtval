const fs = require('fs');
let code = fs.readFileSync('src/components/FloatingActionBar.tsx', 'utf8');

code = code.replace(
  '  onCopyList?: () => void;',
  '  onCopyList?: () => void;\n  onCompare?: () => void;'
);

code = code.replace(
  '  onCopyList\n}) => {',
  '  onCopyList,\n  onCompare\n}) => {'
);

code = code.replace(
  '          <button\n            onClick={onExport}',
  '          {selectedCount === 2 && onCompare && (\n            <button\n              onClick={onCompare}\n              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-colors"\n            >\n              <ArrowRightLeft className="w-4 h-4" /> השווה\n            </button>\n          )}\n          <button\n            onClick={onExport}'
);

code = code.replace(
  'import { Trash2, FolderPlus, Download, X, Tags, Copy } from \'lucide-react\';',
  'import { Trash2, FolderPlus, Download, X, Tags, Copy, ArrowRightLeft } from \'lucide-react\';'
);

fs.writeFileSync('src/components/FloatingActionBar.tsx', code);
