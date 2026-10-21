const fs = require('fs');
let path = 'src/components/TagCombobox.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'const filteredTags = availableTags.filter((t) => {',
  'const filteredTags = availableTags.filter((t) => {\n    if (!t) return false;'
);

fs.writeFileSync(path, code);
