const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const exportPdfFn = `
  const handleExportPDF = (prompt: Prompt) => {
    const element = document.createElement('div');
    element.innerHTML = \`
      <div style="font-family: system-ui, sans-serif; direction: rtl; padding: 40px; color: #111;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">\${prompt.title}</h1>
        <div style="font-size: 14px; color: #666; margin-bottom: 24px;">תאריך: \${new Date().toLocaleDateString('he-IL')}</div>
        \${prompt.tags ? \`<div style="margin-bottom: 24px;">\${prompt.tags.map(t => \`<span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">\${t}</span>\`).join('')}</div>\` : ''}
        <pre style="background: #f8fafc; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 14px; white-space: pre-wrap; line-height: 1.6; border: 1px solid #e2e8f0;">\${prompt.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        \${prompt.exampleOutput ? \`
          <h3 style="font-size: 16px; margin-top: 32px; font-weight: bold;">פלט לדוגמה:</h3>
          <pre style="background: #f8fafc; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 14px; white-space: pre-wrap; line-height: 1.6; border: 1px solid #e2e8f0;">\${prompt.exampleOutput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        \` : ''}
      </div>
    \`;
    
    html2pdf().from(element).set({
      margin: 10,
      filename: \`\${prompt.title || 'prompt'}.pdf\`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
    showToast('ה-PDF בתהליך יצירה', 'info');
  };
`;

code = code.replace('  const handleExportAll = () => {', exportPdfFn + '\n  const handleExportAll = () => {');

// Insert due date in saving logic
const saveLogicNew = `
        tags: promptData.tags || [],
        dueDate: promptData.dueDate || undefined,
        folder: promptData.folder || folders[0]?.id,
`;
code = code.replace(/tags: promptData\.tags \|\| \[\],\n\s*folder: promptData\.folder \|\| folders\[0\]\?\.id,/, saveLogicNew);

// UI For due date editor
const dueDateUI = `
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תאריך יעד / תזכורת</label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="date"
                              value={editingPrompt?.dueDate || ""}
                              onChange={(e) => setEditingPrompt({...editingPrompt, dueDate: e.target.value})}
                              className="w-full ps-9 pe-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
`;
code = code.replace(/<\/div>\n\s*<div>\n\s*<label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">פלט לדוגמה/, dueDateUI + '<div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">פלט לדוגמה');

// UI for PDF button in detail header
const pdfButton = `
                          <button title="ייצא כ-PDF" onClick={() => handleExportPDF(selectedPrompt)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg">
                            <FileDown className="w-4.5 h-4.5" />
                          </button>
`;
code = code.replace(/<button title="מסך מלא" onClick=\{\(\) => setIsFullscreen\(!isFullscreen\)\}/, pdfButton + '<button title="מסך מלא" onClick={() => setIsFullscreen(!isFullscreen)}');

// UI for Due Date in detail header
const dueDateBadge = `
                      {selectedPrompt.dueDate && (
                        <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                          <Calendar className="w-3.5 h-3.5" />
                          תזכורת: {new Date(selectedPrompt.dueDate).toLocaleDateString('he-IL')}
                        </div>
                      )}
`;
code = code.replace(/<div className="flex flex-wrap items-center gap-2 mt-4">/, '<div className="flex flex-wrap items-center gap-2 mt-4">' + dueDateBadge);


fs.writeFileSync('src/App.tsx', code);
