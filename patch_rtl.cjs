const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importRtl = `import { RTLTestResults } from './components/RTLTestResults';\n`;
if (!code.includes('RTLTestResults')) {
  code = code.replace("import { EmptyState } from \"./components/EmptyStates\";", "import { EmptyState } from \"./components/EmptyStates\";\n" + importRtl);
}

const stateRegex = /const \[isShortcutsOpen, setIsShortcutsOpen\] = useState\(false\);/;
code = code.replace(stateRegex, 'const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);\n  const [isRtlTestsOpen, setIsRtlTestsOpen] = useState(false);');

const btnHTML = `
          <button onClick={() => setIsRtlTestsOpen(true)} className="p-2 text-emerald-500 hover:text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-xl transition-colors" title="דוח בדיקות RTL">
            <Check className="w-4 h-4" />
          </button>
`;
code = code.replace(/<button onClick=\{\(\) => setIsShortcutsOpen\(true\)\} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="קיצורי מקלדת">/, btnHTML + '<button onClick={() => setIsShortcutsOpen(true)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="קיצורי מקלדת">');

const modalRender = `      {isRtlTestsOpen && <RTLTestResults onClose={() => setIsRtlTestsOpen(false)} />}\n`;
code = code.replace('{isShortcutsOpen && <ShortcutsModal onClose={() => setIsShortcutsOpen(false)} />}', '{isShortcutsOpen && <ShortcutsModal onClose={() => setIsShortcutsOpen(false)} />}\n' + modalRender);

fs.writeFileSync('src/App.tsx', code);
