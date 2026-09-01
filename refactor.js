const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace sharp corners with rounded corners
code = code.replace(/rounded-none/g, 'rounded-xl');
code = code.replace(/border-\[\#1A1A1A\]\/10/g, 'border-slate-200 dark:border-slate-700');
code = code.replace(/border-\[\#1A1A1A\]\/20/g, 'border-slate-300 dark:border-slate-600');
code = code.replace(/border-\[\#1A1A1A\]\/15/g, 'border-slate-200 dark:border-slate-700');
code = code.replace(/border-\[\#F5F5F0\]\/10/g, 'border-slate-700');
code = code.replace(/border-\[\#F5F5F0\]\/20/g, 'border-slate-600');
code = code.replace(/border-\[\#F5F5F0\]\/15/g, 'border-slate-700');
code = code.replace(/border-\[\#1A1A1A\]/g, 'border-slate-200 dark:border-slate-700');
code = code.replace(/border-2 border-\[\#1A1A1A\]/g, 'border border-slate-200 shadow-xl dark:border-slate-700');

// Replace dark colors
code = code.replace(/bg-\[\#1A1A1A\]/g, 'bg-blue-600');
code = code.replace(/text-\[\#1A1A1A\]/g, 'text-slate-900');
code = code.replace(/text-\[\#F5F5F0\]/g, 'text-white');
code = code.replace(/bg-\[\#F5F5F0\]/g, 'bg-slate-800');

// Replace warm colors
code = code.replace(/bg-\[\#EFEBE6\]/g, 'bg-slate-100');
code = code.replace(/bg-\[\#F7F4F0\]/g, 'bg-slate-50');
code = code.replace(/bg-\[\#1E1C1A\]/g, 'bg-slate-900');
code = code.replace(/bg-\[\#151413\]/g, 'bg-slate-950');

// Replace fonts
code = code.replace(/font-serif/g, '');
code = code.replace(/font-black/g, 'font-bold');

// Other UI improvements
code = code.replace(/backdrop-blur-xs/g, 'backdrop-blur-sm');

fs.writeFileSync('src/App.tsx', code);
console.log('Done refactoring basic styles');
