const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const navRegex = /<button onClick=\{\(\) => \{ setCurrentView\("dashboard"\); setIsMobileMenuOpen\(false\); \}\} className=\{`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors \$\{currentView === "dashboard" \? "bg-slate-100 dark:bg-white\/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white\/5 text-slate-600 dark:text-slate-400"\}`\}>/;

const newNav = `<button onClick={() => { setCurrentView("profile"); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors \${currentView === "profile" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}\`}>
              <User className="w-4 h-4" /> הפרופיל שלי
            </button>
            <button onClick={() => { setCurrentView("dashboard"); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors \${currentView === "dashboard" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}\`}>`;

code = code.replace(navRegex, newNav);

const viewRegex = /\{currentView === "dashboard" \? \(/;
const newView = `{currentView === "profile" ? (
          <div className="flex-1 overflow-y-auto">
            <UserProfileView onShowToast={showToast} />
          </div>
        ) : currentView === "dashboard" ? (`;

code = code.replace(viewRegex, newView);

fs.writeFileSync('src/App.tsx', code);
