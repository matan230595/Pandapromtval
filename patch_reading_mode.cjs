const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "                          <div className=\"font-mono text-[15px] leading-8 whitespace-pre-wrap text-slate-800 dark:text-slate-200 flex-1\" dir=\"auto\" dangerouslySetInnerHTML={{ __html: Prism.highlight(selectedPrompt.content, Prism.languages.markdown, 'markdown') }} />",
  "                          <div className={`font-mono leading-8 whitespace-pre-wrap text-slate-800 dark:text-slate-200 flex-1 transition-all duration-300 ${isFullscreen ? \"text-[18px] md:text-[22px] max-w-4xl mx-auto my-8 leading-[1.8]\" : \"text-[15px]\"}`} dir=\"auto\" dangerouslySetInnerHTML={{ __html: Prism.highlight(selectedPrompt.content, Prism.languages.markdown, 'markdown') }} />"
);

fs.writeFileSync('src/App.tsx', code);
