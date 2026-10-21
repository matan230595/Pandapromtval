const fs = require('fs');

let pgPath = 'src/components/PromptGeneratorModal.tsx';
let pgCode = fs.readFileSync(pgPath, 'utf8');
pgCode = pgCode.replace('alert("שגיאה ביצירת הפרומפט");', '// alert disabled in iframe');
fs.writeFileSync(pgPath, pgCode);

let appPath = 'src/App.tsx';
let appCode = fs.readFileSync(appPath, 'utf8');
appCode = appCode.replace('alert("שגיאה בשיפור הפרומפט");', 'showToast("שגיאה בשיפור הפרומפט", "error");');
fs.writeFileSync(appPath, appCode);

console.log("Patched alerts");
