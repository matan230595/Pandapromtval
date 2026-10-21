const fs = require('fs');

function replaceFile(path, replacements) {
    let code = fs.readFileSync(path, 'utf8');
    for (const [search, replace] of replacements) {
        code = code.replace(search, replace);
    }
    fs.writeFileSync(path, code);
}

// UserProfileView.tsx
replaceFile('src/components/UserProfileView.tsx', [
    ['text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300', 'text-slate-900 dark:text-white']
]);

// PromptTester.tsx
replaceFile('src/components/PromptTester.tsx', [
    ['bg-gradient-to-l from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400', 'bg-indigo-600 hover:bg-indigo-700']
]);

// DashboardView.tsx
replaceFile('src/components/DashboardView.tsx', [
    ['bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500', 'bg-slate-900 dark:bg-black border border-slate-800']
]);

// InsightsDashboard.tsx
replaceFile('src/components/InsightsDashboard.tsx', [
    ['text-transparent bg-clip-text bg-gradient-to-l from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-300', 'text-slate-900 dark:text-white']
]);

console.log("Patched slop gradients.");
