const fs = require('fs');
let code = fs.readFileSync('src/components/BulkRenameModal.tsx', 'utf8');

code = code.replace(
  'תבנית שם (השתמש ב- {n} למספור)',
  'תבנית שם (השתמש ב- {"{n}"} למספור)'
);

fs.writeFileSync('src/components/BulkRenameModal.tsx', code);
