const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const refineAndTagFns = `
  const [isRefining, setIsRefining] = useState(false);
  const [isAutoTagging, setIsAutoTagging] = useState(false);

  const handleRefinePrompt = async () => {
    if (!editingPrompt || !editingPrompt.content) return;
    setIsRefining(true);
    try {
      const response = await fetch('/api/gemini/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: editingPrompt.content,
          mode: 'enhance',
          language: editingPrompt.language || 'he'
        })
      });
      const data = await response.json();
      if (data.text) {
        setEditingPrompt(prev => prev ? {...prev, content: data.text} : prev);
        showToast('הפרומפט שודרג בהצלחה ע"י AI', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('שגיאה בשדרוג הפרומפט', 'error');
    }
    setIsRefining(false);
  };

  const handleAutoTag = async () => {
    if (!editingPrompt || !editingPrompt.content) return;
    setIsAutoTagging(true);
    try {
      const response = await fetch('/api/gemini/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editingPrompt.content
        })
      });
      const data = await response.json();
      if (data.tags || data.platform || data.title) {
        setEditingPrompt(prev => prev ? {
          ...prev, 
          tags: Array.from(new Set([...(prev.tags || []), ...(data.tags || [])])),
          platform: prev.platform === 'General' && data.platform ? data.platform : prev.platform,
          title: prev.title === 'פרומפט חדש' && data.title ? data.title : prev.title
        } : prev);
        showToast('תגיות הוספו בהצלחה ע"י AI', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('שגיאה בסיווג הפרומפט', 'error');
    }
    setIsAutoTagging(false);
  };
`;

code = code.replace('  const handleSmartAssign = () => {', refineAndTagFns + '\n  const handleSmartAssign = () => {');

// Now add the buttons to the editor
const editorUI = `
                      <div className="flex gap-2">
                        <button 
                          onClick={handleRefinePrompt}
                          disabled={isRefining}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-200 dark:border-indigo-800/30"
                        >
                          {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                          שדרוג חכם (AI Refiner)
                        </button>
                        <button 
                          onClick={handleAutoTag}
                          disabled={isAutoTagging}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200 dark:border-emerald-800/30"
                        >
                          {isAutoTagging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
                          תיוג אוטומטי (AI)
                        </button>
                      </div>
                      <textarea
`;

code = code.replace(/<textarea([^>]*)value=\{editingPrompt\?\.content \|\| ""\}/, editorUI + '<textarea$1value={editingPrompt?.content || ""}');

fs.writeFileSync('src/App.tsx', code);
