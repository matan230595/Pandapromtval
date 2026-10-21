const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "                              onClick={() => {\n                                if (editingPrompt?.content) {\n                                  // Call handleAutoTag directly if it's available, or just fetch the classification\n                                  fetch('/api/gemini/classify', {\n                                    method: 'POST',\n                                    headers: { 'Content-Type': 'application/json' },\n                                    body: JSON.stringify({ content: editingPrompt.content, existingTags: allTags })\n                                  }).then(r => r.json()).then(data => {\n                                    if (data.tags) {\n                                      setEditingPrompt({...editingPrompt, tags: [...new Set([...(editingPrompt.tags || []), ...data.tags])]});\n                                    }\n                                  }).catch(() => {});\n                                }\n                              }}",
  "                              onClick={handleAutoTag}\n                              disabled={isAutoTagging}"
);

code = code.replace(
  '<Sparkles className="w-3 h-3" /> תיוג אוטומטי',
  '{isAutoTagging ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} תיוג אוטומטי'
);

fs.writeFileSync('src/App.tsx', code);
