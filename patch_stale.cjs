const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const staleCheck = `
                        {selectedPrompt.lastUsedAt && differenceInDays(new Date(), new Date(selectedPrompt.lastUsedAt)) > 30 && !isReadingMode && (
                          <div className="mx-6 lg:mx-8 mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800 dark:text-amber-400">
                              <span className="font-bold">שים לב:</span> לא עשית שימוש בפרומפט זה מעל ל-30 ימים. 
                              שקול לארכב או למחוק פרומפטים שאינם רלוונטיים כדי לשמור על סביבת העבודה מסודרת.
                            </div>
                          </div>
                        )}
`;

// Insert it right after the header of the viewer
// We have:
// <div className="p-6 lg:p-8 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#111]">
// Let's insert it inside the flex-1 area:
// <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-[#0a0a0a] overflow-y-auto selection:bg-blue-200 dark:selection:bg-blue-900/50 flex flex-col 2xl:flex-row gap-8">
code = code.replace(
  '<div className="flex-1 flex flex-col min-w-0">',
  '<div className="flex-1 flex flex-col min-w-0">' + staleCheck
);

fs.writeFileSync(path, code);
