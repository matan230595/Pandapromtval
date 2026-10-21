const fs = require('fs');
let path = 'src/components/CommunityView.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
  'p.likes.filter(id => id !== auth.currentUser?.uid)',
  '(p.likes || []).filter(id => id !== auth.currentUser?.uid)'
);
fs.writeFileSync(path, code);
console.log("Patched p.likes in CommunityView");
