const fs = require('fs');

function replaceCrypto(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(/crypto\.randomUUID\(\)/g, '(window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36))');
  // Also fix the ones that had a partial fallback just in case 'crypto' is undefined
  code = code.replace(/\(crypto\.randomUUID \? crypto\.randomUUID\(\) : Math\.random\(\)\.toString\(36\)\.substring\(2\)\)/g, '(window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36))');
  fs.writeFileSync(filePath, code);
}

replaceCrypto('src/components/FilterRulesModal.tsx');
replaceCrypto('src/App.tsx');
console.log("Patched crypto.randomUUID");
