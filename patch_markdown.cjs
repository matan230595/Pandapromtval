const fs = require('fs');

let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

const markdownExportFn = `
  const handleExportMarkdown = () => {
    let md = "# Prompt Vault Backup\\n\\n";
    // Group prompts by folder
    const grouped = prompts.reduce((acc, p) => {
      const folderName = folders.find(f => f.id === p.folder)?.name || "ללא תיקייה";
      if (!acc[folderName]) acc[folderName] = [];
      acc[folderName].push(p);
      return acc;
    }, {} as Record<string, typeof prompts>);

    for (const [folder, pList] of Object.entries(grouped)) {
      md += \`## 📁 \${folder}\\n\\n\`;
      for (const p of pList) {
        md += \`### \${p.title}\\n\\n\`;
        if (p.tags && p.tags.length > 0) md += \`**תגיות:** \${p.tags.join(', ')}\\n\\n\`;
        md += \`**פלטפורמה:** \${p.platform}\\n\\n\`;
        md += \`\`\`\`text\\n\${p.content}\\n\`\`\`\\n\\n\`;
      }
    }

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = \`promptvault_backup_\${new Date().toISOString().split('T')[0]}.md\`;
    a.click();
    showToast('יוצא בהצלחה כ-Markdown', 'success');
  };
`;

code = code.replace(
  'const handleExportAll = () => {',
  markdownExportFn + '\n  const handleExportAll = () => {'
);

const markdownExportBtn = `
            <button onClick={handleExportMarkdown} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400">
              <FileText className="w-4 h-4" /> ייצוא כ-Markdown
            </button>
`;

code = code.replace(
  '<button onClick={handleExportAll}',
  markdownExportBtn + '            <button onClick={handleExportAll}'
);

fs.writeFileSync(path, code);
console.log("Patched Markdown export");
