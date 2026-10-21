const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const oldRecent = `<div className="w-16 h-16 bg-white dark:bg-[#111] rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-sm mb-4">
                <Terminal className="w-8 h-8" />
              </div>`;
              
const newRecent = `<div className="w-20 h-20 mb-4 relative drop-shadow-md">
                <img src="/A0494A97-E398-4199-83C8-6FE4369108B2.png" alt="Panda Mascot" className="w-full h-full object-contain" />
              </div>`;

const oldFav = `<div className="w-16 h-16 bg-white dark:bg-[#111] rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-sm mb-4">
                <Star className="w-8 h-8" />
              </div>`;

code = code.replace(oldRecent, newRecent);
code = code.replace(oldFav, newRecent);

fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log("Patched empty states in DashboardView");
