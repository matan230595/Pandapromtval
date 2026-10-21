const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The checkDueDates relies on prompts, but useEffect is outside or prompts is undefined?
// Let's move the useEffect after prompts declaration.
const notifRegex = /  useEffect\(\(\) => \{\n    if \("Notification" in window && Notification\.permission !== "granted"[\s\S]*?\}, \[prompts\]\);\n\n/;

const notifMatch = code.match(notifRegex);
if (notifMatch) {
  code = code.replace(notifMatch[0], '');
  // Insert it after `const [prompts, setPrompts] = useState...` which doesn't exist? Oh, `prompts` is part of `usePrompts` hook or similar?
  // Let's check where `prompts` is defined.
}

fs.writeFileSync('src/App.tsx', code);
