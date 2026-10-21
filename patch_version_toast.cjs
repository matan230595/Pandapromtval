const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "showToast('נשמר כגרסה מיוחדת: ' + versionName, 'success');",
  "showToast('נשמר כגרסה מיוחדת: ' + versionName, 'version');"
);

fs.writeFileSync('src/App.tsx', code);
