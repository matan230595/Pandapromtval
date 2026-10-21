const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<button onClick=\{user \? \(\) => logout\(\) : \(\) => loginWithGoogle\(\)\} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white\/5 dark:hover:bg-white\/10 py-2.5 rounded-xl font-medium transition-colors text-sm">/;
const replacement = `<button onClick={() => setIsSettingsModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 py-2.5 rounded-xl font-medium transition-colors text-sm mb-2">
            <Settings className="w-4 h-4" /> {t('nav.settings')}
          </button>
          <button onClick={user ? () => logout() : () => loginWithGoogle()} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 py-2.5 rounded-xl font-medium transition-colors text-sm">`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
