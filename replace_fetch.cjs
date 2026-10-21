const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('fetch("/api/gemini/') || content.includes("fetch('/api/gemini/")) {
    // Add import if not present
    if (!content.includes('import { apiFetch } from')) {
      const depth = filePath.split(path.sep).length - 2; // src/ is 0 depth basically
      const relPath = depth === 0 ? './utils/api' : '../'.repeat(depth) + 'utils/api';
      content = `import { apiFetch } from '${relPath}';\n` + content;
    }
    
    // Replace fetch with apiFetch
    content = content.replace(/fetch\("\/api\/gemini\//g, 'apiFetch("/api/gemini/');
    content = content.replace(/fetch\('\/api\/gemini\//g, "apiFetch('/api/gemini/");
    
    fs.writeFileSync(filePath, content);
    console.log(`Replaced in ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      replaceInFile(filePath);
    }
  }
}

walk('src');
