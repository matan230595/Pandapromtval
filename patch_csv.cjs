const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const csvFunction = `
  const handleExportCSV = () => {
    // Standard CSV export
    const headers = ["ID", "Title", "Content", "Platform", "Topic", "Folder", "Tags", "Favorite", "Language", "Created At", "Use Count"];
    
    // Function to escape CSV values
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\\n')) {
        str = str.replace(/"/g, '""');
        return \`"\${str}"\`;
      }
      return str;
    };
    
    const rows = prompts.map(p => {
      return [
        escapeCSV(p.id),
        escapeCSV(p.title),
        escapeCSV(p.content),
        escapeCSV(p.platform),
        escapeCSV(p.topic || ''),
        escapeCSV(folders.find(f => f.id === p.folder)?.name || p.folder),
        escapeCSV((p.tags || []).join(', ')),
        escapeCSV(p.favorite ? 'Yes' : 'No'),
        escapeCSV(p.language),
        escapeCSV(p.createdAt),
        escapeCSV(p.useCount || 0)
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\\uFEFF" + [headers.join(','), ...rows].join('\\n');
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = \`promptvault_export_\${new Date().toISOString().split('T')[0]}.csv\`;
    a.click();
    showToast('יוצא בהצלחה כ-CSV', 'success');
  };

  const handleExportAll = () => {`;

code = code.replace(/const handleExportAll = \(\) => \{/g, csvFunction);

fs.writeFileSync('src/App.tsx', code);
