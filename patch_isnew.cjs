const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(`    // Apply automation rules
    for (const rule of automationRules) {`, `    // Apply automation rules
    if (isNew) {
      for (const rule of automationRules) {`);

code = code.replace(`        break; // First matching rule wins
      }
    }

    if (user) {`, `        break; // First matching rule wins
      }
    }
    } // End if(isNew)

    if (user) {`);

fs.writeFileSync('src/App.tsx', code);
