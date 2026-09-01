const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove from sidebar
const badSidebarHtml = `<div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium border border-slate-200 dark:border-white/10 text-slate-500">
                            {Math.max(1, Math.ceil((selectedPrompt.content.match(/\\S+/g) || []).length / 200))} דק' קריאה
                          </span>`;

code = code.replace(badSidebarHtml, `<div className="flex flex-wrap items-center gap-2">`);

// Add to detail view correctly. The detail view header is around line 911 (based on previous greps).
// It looks like:
// <div className="flex flex-wrap items-center gap-2">
//   <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${PLATFORMS[selectedPrompt.platform]?.bgColor} ${PLATFORMS[selectedPrompt.platform]?.textColor}`}>

const detailHeaderMatch = `<div className="flex flex-wrap items-center gap-2">
                          <span className={\`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider \${PLATFORMS[selectedPrompt.platform]?.bgColor} \${PLATFORMS[selectedPrompt.platform]?.textColor}\`}>`;

const correctedDetailHeader = `<div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium border border-slate-200 dark:border-white/10 text-slate-500">
                            {Math.max(1, Math.ceil((selectedPrompt.content.match(/\\S+/g) || []).length / 200))} דק' קריאה
                          </span>
                          <span className={\`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider \${PLATFORMS[selectedPrompt.platform]?.bgColor} \${PLATFORMS[selectedPrompt.platform]?.textColor}\`}>`;

code = code.replace(detailHeaderMatch, correctedDetailHeader);

fs.writeFileSync('src/App.tsx', code);
