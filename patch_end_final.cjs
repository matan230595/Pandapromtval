const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\s*\}\)\s*<\/div>\s*<\/div>\s*\) : \(\s*<div className="flex-1 hidden xl:flex/g;

if (regex.test(code)) {
    code = code.replace(regex, `
                  )}
                </div>
              ) : (
                <div className="flex-1 hidden xl:flex`);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched successfully!");
} else {
    console.log("Not found.");
}
