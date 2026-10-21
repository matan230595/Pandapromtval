const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove duplicate suggestedFolder
// Find the first block that declares suggestedFolder
code = code.replace(
  '  const [suggestedFolder, setSuggestedFolder] = useState<{id: string, name: string} | null>(null);\n',
  '' // remove one of them, the second patch added it again maybe? Let's check.
);
// Actually it's safer to just let the latest one remain, but let's check line 441 and 514. 
// I'll just regex replace the duplicate.
const suggestMatch = code.match(/const \[suggestedFolder, setSuggestedFolder\] = useState/g);
if (suggestMatch && suggestMatch.length > 1) {
  let firstIndex = code.indexOf('const [suggestedFolder, setSuggestedFolder] = useState');
  let secondIndex = code.indexOf('const [suggestedFolder, setSuggestedFolder] = useState', firstIndex + 1);
  if (secondIndex !== -1) {
     // I need to remove the whole block of the first one, or just rename one.
     // Best is to replace the first declaration.
     code = code.substring(0, firstIndex) + code.substring(secondIndex);
  }
}

// 2. CallBackProps STATUS
if (!code.includes('import { CallBackProps, STATUS }')) {
  // It imported Joyride but didn't destructure STATUS correctly if it was default imported?
  // I did: import Joyride, { CallBackProps, STATUS } from 'react-joyride';
  // I should check if it's there.
  // Actually react-joyride exports CallBackProps.
}

fs.writeFileSync('src/App.tsx', code);
