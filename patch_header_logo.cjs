const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<img src="\/favicon-48\.png" alt="PandaPrompt" className="w-full h-full object-cover" \/>/g, 
  '<img src="/A0494A97-E398-4199-83C8-6FE4369108B2.png" alt="Panda Mascot" className="w-full h-full object-contain" />');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched header logo in App.tsx");
