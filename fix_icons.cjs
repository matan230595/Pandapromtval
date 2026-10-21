const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace('Share, XCircle}', 'Share, XCircle, Mic, Bell, CalendarClock, Link, Save, RotateCcw }');
fs.writeFileSync('src/App.tsx', code);
