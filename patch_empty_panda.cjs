const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldIcon = `<div className="w-16 h-16 bg-white dark:bg-[#111] rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-sm mb-4">
                      <Terminal className="w-8 h-8" />
                    </div>`;
                    
const newIcon = `<div className="w-24 h-24 mb-4 relative drop-shadow-md">
                      <img src="/A0494A97-E398-4199-83C8-6FE4369108B2.png" alt="Panda Mascot" className="w-full h-full object-contain" />
                    </div>`;

if (code.includes('Terminal className="w-8 h-8"')) {
    code = code.replace(oldIcon, newIcon);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched empty library with Panda.");
} else {
    console.log("Could not find icon.");
}
