const fs = require('fs');
let code = fs.readFileSync('src/components/CommunityView.tsx', 'utf8');

const oldHeader = `<h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-500" />
              קהילת הפרומפטים
            </h2>`;
            
const newHeader = `<h2 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 overflow-hidden relative drop-shadow-md">
                <img src="/A0494A97-E398-4199-83C8-6FE4369108B2.png" alt="Panda Mascot" className="w-full h-full object-contain" />
              </div>
              קהילת הפרומפטים
            </h2>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/components/CommunityView.tsx', code);
console.log("Patched CommunityView hero");
