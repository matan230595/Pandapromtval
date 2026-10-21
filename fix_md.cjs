const fs = require('fs');

let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'md += \\`\\`\\`\\`text\\n${p.content}\\n\\`\\`\\`\\n\\n\\`;',
  'md += "```text\\n" + p.content + "\\n```\\n\\n";'
);
code = code.replace(
  'md += ````text\\n${p.content}\\n```\\n\\n`;',
  'md += "```text\\n" + (p.content || "") + "\\n```\\n\\n";'
);

fs.writeFileSync(path, code);
