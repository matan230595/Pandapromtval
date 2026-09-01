const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/alert\("הועתק כרשימה!"\);/g, `showToast("הועתק כרשימה!", "success");`);
code = code.replace(/alert\("הועתק ללוח!"\);/g, `showToast("הועתק ללוח!", "success");`);
code = code.replace(/alert\("הועתק כ-Markdown!"\);/g, `showToast("הועתק כ-Markdown!", "success");`);

fs.writeFileSync('src/App.tsx', code);
