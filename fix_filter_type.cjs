const fs = require('fs');
let path = 'src/components/TagCombobox.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '  const groupedTags = useMemo(() => {',
  '  const groupedTags = useMemo<Record<string, string[]>>(() => {'
);

fs.writeFileSync(path, code);
