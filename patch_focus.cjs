const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'title="מסך מלא"',
  'title="מצב מיקוד (Focus Mode)"'
);
code = code.replace(
  'title="מסך מלא"', // doing it again for the second occurrence
  'title="מצב מיקוד (Focus Mode)"'
);

fs.writeFileSync('src/App.tsx', code);
