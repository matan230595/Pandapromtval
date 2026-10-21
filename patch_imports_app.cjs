const fs = require('fs');
let codeApp = fs.readFileSync('src/App.tsx', 'utf8');

if (!codeApp.includes('Mail,')) {
  codeApp = codeApp.replace(/XCircle, LayoutTemplate, GitMerge, Users, ChevronDown \} from "lucide-react";/, 'XCircle, LayoutTemplate, GitMerge, Users, ChevronDown, Mail } from "lucide-react";');
}

fs.writeFileSync('src/App.tsx', codeApp);
