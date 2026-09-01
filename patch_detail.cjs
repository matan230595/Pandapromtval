const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexDetail = /<div className="font-mono text-\[15px\] leading-8 whitespace-pre-wrap text-slate-800 dark:text-slate-200 flex-1" dir="auto">\s*\{selectedPrompt\.content\}\s*<\/div>/m;

const replacementDetail = `
  <div className="font-mono text-[15px] leading-8 whitespace-pre-wrap text-slate-800 dark:text-slate-200 flex-1" dir="ltr" dangerouslySetInnerHTML={{ __html: Prism.highlight(selectedPrompt.content, Prism.languages.markdown, 'markdown') }} />
`;

code = code.replace(regexDetail, replacementDetail);
fs.writeFileSync('src/App.tsx', code);
