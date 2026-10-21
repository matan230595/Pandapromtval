const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const mailBtnHTML = `
                          <button title="שלח למייל" onClick={() => {
                            const md = \`# \${selectedPrompt.title}\\n\\n**פלטפורמה:** \${PLATFORMS[selectedPrompt.platform]?.name || selectedPrompt.platform}\\n**תגיות:** \${(selectedPrompt.tags||[]).join(', ')}\\n\\n\${selectedPrompt.content}\`;
                            window.open(\`mailto:?subject=\${encodeURIComponent(selectedPrompt.title)}&body=\${encodeURIComponent(md)}\`);
                          }} className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-50 hover:bg-emerald-50 dark:bg-white/5 dark:hover:bg-emerald-900/20 rounded-lg">
                            <Mail className="w-4.5 h-4.5" />
                          </button>
`;

code = code.replace(
  '<button title="ייצא כ-PDF"',
  mailBtnHTML + '\n                          <button title="ייצא כ-PDF"'
);

fs.writeFileSync('src/App.tsx', code);
