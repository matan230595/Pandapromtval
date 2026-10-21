const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import Clipboard
code = code.replace(/Clipboard, /g, '');
code = code.replace(/} from "lucide-react";/, ', Clipboard} from "lucide-react";');

// Add handlePasteAndParse
const handlePasteAndParseCode = `
  const handlePasteAndParse = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      // Extract variables in format {{var}} or [var]
      const varRegex = /\\{\\{([^}]+)\\}\\}/g;
      const bracketRegex = /\\[([^\\]]+)\\]/g;
      
      let match;
      const detectedTags = new Set();
      
      while ((match = varRegex.exec(text)) !== null) {
        if (match[1] && match[1].length > 1 && match[1].length < 20) {
          detectedTags.add(match[1].toLowerCase().replace(/[^a-zא-ת0-9\\-]/g, ''));
        }
      }
      while ((match = bracketRegex.exec(text)) !== null) {
        if (match[1] && match[1].length > 1 && match[1].length < 20) {
          detectedTags.add(match[1].toLowerCase().replace(/[^a-zא-ת0-9\\-]/g, ''));
        }
      }

      setEditingPrompt(prev => {
        if (!prev) return prev;
        const currentTags = prev.tags || [];
        const newTags = [...new Set([...currentTags, ...detectedTags])].filter(Boolean);
        return {
          ...prev,
          content: (prev.content ? prev.content + '\\n\\n' : '') + text,
          tags: newTags
        };
      });
      showToast("הטקסט הודבק ופוענח", "success");
    } catch (e) {
      showToast("שגיאה בגישה ללוח הגזירים", "error");
    }
  };
`;
code = code.replace(/  const handleRefinePrompt = async/, handlePasteAndParseCode + '\n  const handleRefinePrompt = async');

// Add Paste Button
const pasteBtn = `
                        <button 
                          onClick={handlePasteAndParse}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors border border-slate-200 dark:border-white/10"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                          הדבק ופענח
                        </button>
                      </div>`;
code = code.replace(/                      <\/div>\n                        <div className="w-full bg-slate-50 dark:bg-\[\#0a0a0a\] border border-slate-200 dark:border-white\/10 rounded-xl outline-none focus-within:ring-2 focus-within:ring-blue-500\/50 text-sm font-mono text-slate-900 dark:text-white" dir="auto" style=\{\{ minHeight: '256px' \}\}>/g, pasteBtn + '\n                        <div className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus-within:ring-2 focus-within:ring-blue-500/50 text-sm font-mono text-slate-900 dark:text-white" dir="auto" style={{ minHeight: \'256px\' }}>');

// Add aiOptimized update to AI enhancers
code = code.replace(/setEditingPrompt\(prev => \(\{ \.\.\.prev, content: data\.text \}\)\);/g, 'setEditingPrompt(prev => ({ ...prev, content: data.text, aiOptimized: true }));');

fs.writeFileSync('src/App.tsx', code);
