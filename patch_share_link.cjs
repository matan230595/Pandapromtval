const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const shareBtnHTML = `
                          <button title="העתק קישור ציבורי (Share)" onClick={() => {
                            const url = window.location.origin + '?shared=' + selectedPrompt.id;
                            navigator.clipboard.writeText(url);
                            showToast("קישור ציבורי הועתק בהצלחה!", "success");
                          }} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 hover:bg-blue-50 dark:bg-white/5 dark:hover:bg-blue-900/20 rounded-lg">
                            <Link className="w-4.5 h-4.5" />
                          </button>
`;

code = code.replace(
  '<button title="ייצא כ-PDF"',
  shareBtnHTML + '\n                          <button title="ייצא כ-PDF"'
);

// We need a toast system that can show the message. "showToast" is available in App.tsx.

fs.writeFileSync('src/App.tsx', code);
