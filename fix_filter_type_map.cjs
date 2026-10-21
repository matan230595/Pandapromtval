const fs = require('fs');
let path = 'src/components/TagCombobox.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /Object\.entries\(groupedTags\)\.map\(\(\[groupName, groupTags\]\) => \{/g,
  'Object.entries(groupedTags).map(([groupName, groupTags]: [string, any]) => {'
);

fs.writeFileSync(path, code);
