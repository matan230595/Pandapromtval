const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const additionalImports = `
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';
import html2pdf from 'html2pdf.js';
`;

code = code.replace(/import \{ DashboardView \} from "\.\/components\/DashboardView";/, 'import { DashboardView } from "./components/DashboardView";' + additionalImports);

const iconImportLine = code.match(/import \{([^}]+)\} from "lucide-react";/)[0];
if (!iconImportLine.includes('Calendar')) {
    code = code.replace('FileCode,', 'FileCode, Calendar, FileDown,');
}

fs.writeFileSync('src/App.tsx', code);
