const fs = require('fs');
let path = 'src/components/TagCombobox.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '  const filteredTags = availableTags.filter(\n    (t) => t.toLowerCase().includes(input.toLowerCase()) && !(tags || []).includes(t)\n  );',
  '  const filteredTags = availableTags.filter((t) => {\n    if (!t.toLowerCase().includes(input.toLowerCase())) return false;\n    if (!isFilterMode && (tags || []).includes(t)) return false;\n    return true;\n  });'
);

fs.writeFileSync(path, code);
