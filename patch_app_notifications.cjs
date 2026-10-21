const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Desktop Notifications
const notifCode = `
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const checkDueDates = () => {
      if ("Notification" in window && Notification.permission === "granted") {
        const notified = JSON.parse(localStorage.getItem('notified_prompts') || '{}');
        const now = new Date();
        
        prompts.forEach(p => {
          if (p.dueDate) {
            const dueDate = new Date(p.dueDate);
            // If due date is today or passed and not notified
            if (dueDate <= now && !notified[p.id]) {
              new Notification("תזכורת: פרומפט דורש טיפול", {
                body: p.title,
                icon: "/logo.png"
              });
              notified[p.id] = true;
            }
          }
        });
        localStorage.setItem('notified_prompts', JSON.stringify(notified));
      }
    };

    checkDueDates();
    const interval = setInterval(checkDueDates, 60000);
    return () => clearInterval(interval);
  }, [prompts]);
`;

if (!code.includes('checkDueDates = () =>')) {
  code = code.replace(
    '  useEffect(() => {\n    localStorage.setItem("promptvault_rules", JSON.stringify(automationRules));\n  }, [automationRules]);',
    '  useEffect(() => {\n    localStorage.setItem("promptvault_rules", JSON.stringify(automationRules));\n  }, [automationRules]);\n\n' + notifCode
  );
}

// 2. Bulk Auto-tagging Untagged
const autoTagCode = `
  const handleBulkAutoTagUntagged = async () => {
    const untagged = prompts.filter(p => !p.tags || p.tags.length === 0);
    if (untagged.length === 0) {
      showToast("כל הפרומפטים כבר מתויגים!", "success");
      return;
    }
    
    if (!window.confirm(\`נמצאו \${untagged.length} פרומפטים ללא תגיות. האם תרצה לתייג אותם אוטומטית בעזרת AI כעת?\`)) return;
    
    showToast("מתחיל תיוג אוטומטי...", "info");
    
    let taggedCount = 0;
    for (const p of untagged) {
      try {
        const key = localStorage.getItem("promptvault_gemini_key") || "";
        const res = await fetch('/api/gemini/classify', {
          method: 'POST',
          headers: { 
             "Content-Type": "application/json",
             ...(key ? { "x-gemini-api-key": key } : {})
          },
          body: JSON.stringify({ content: p.content })
        });
        const data = await res.json();
        if (data.tags && data.tags.length > 0) {
          await updateDoc(doc(db, "prompts", p.id), { tags: data.tags });
          taggedCount++;
        }
      } catch (err) {
        console.error("Failed to auto-tag", p.id, err);
      }
    }
    
    showToast(\`תיוג אוטומטי הושלם! (\${taggedCount} תוייגו)\`, "success");
  };
`;

if (!code.includes('handleBulkAutoTagUntagged')) {
  code = code.replace(
    '  const handleBulkTag = async (tagsToAdd: string[], tagsToRemove: string[]) => {',
    autoTagCode + '\n  const handleBulkTag = async (tagsToAdd: string[], tagsToRemove: string[]) => {'
  );
}

// Add the button in the Library Top Bar
const autoTagBtnHTML = `
                <button onClick={handleBulkAutoTagUntagged} className="p-2 text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-xl transition-colors hidden md:flex items-center gap-1" title="תיוג חכם לכל החסרים">
                  <Wand2 className="w-4 h-4" />
                </button>
`;

code = code.replace(
  '<button onClick={() => setIsGeneratorOpen(true)} className="p-2 text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-xl transition-colors" title="אשף יצירת פרומפטים">',
  autoTagBtnHTML + '\n                <button onClick={() => setIsGeneratorOpen(true)} className="p-2 text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-xl transition-colors" title="אשף יצירת פרומפטים">'
);

// 3. Inline Diff in Editor
if (!code.includes('showInlineDiff')) {
  code = code.replace(
    '  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);',
    '  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);\n  const [showInlineDiff, setShowInlineDiff] = useState(false);'
  );
}

// UI for Inline diff toggle
const diffToggleHTML = `
                          <button onClick={() => setShowInlineDiff(!showInlineDiff)} className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 \${showInlineDiff ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'}\`}>
                            <GitMerge className="w-3.5 h-3.5" /> {showInlineDiff ? 'הסתר שינויים' : 'הצג שינויים (Diff)'}
                          </button>
`;

// Find where to put it (near the Optimize button)
code = code.replace(
  '<button disabled={isRefining} onClick={async () => {',
  diffToggleHTML + '\n                      <button disabled={isRefining} onClick={async () => {'
);

// The actual editor render logic
const editorReplace = `
                        {showInlineDiff && selectedPromptId ? (
                          <div className="border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-1 bg-indigo-50/30 dark:bg-indigo-900/10 min-h-[200px]">
                            <VisualDiff oldVersion={{ content: selectedPrompt?.content || '' }} newVersion={{ content: editingPrompt?.content || '' }} />
                          </div>
                        ) : (
                          <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 bg-slate-50 dark:bg-[#1a1a1a] transition-all" dir="ltr">
                            <Editor
                              value={editingPrompt?.content || ""}
                              onValueChange={(code) => setEditingPrompt({...editingPrompt, content: code})}
                              highlight={(code) => Prism.highlight(code, Prism.languages.markdown, 'markdown')}
                              padding={16}
                              style={{
                                fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                                fontSize: 14,
                                minHeight: '200px',
                                direction: 'ltr',
                                backgroundColor: 'transparent'
                              }}
                              className="w-full text-slate-900 dark:text-slate-100 outline-none"
                              textareaClassName="outline-none"
                            />
                          </div>
                        )}
`;

code = code.replace(
  /<div className="border border-slate-200 dark:border-white\/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500\/50 bg-slate-50 dark:bg-\[\#1a1a1a\] transition-all" dir="ltr">[\s\S]*?<\/div>/,
  editorReplace
);

// 4. RTL Variables Guard in handleSave
const rtlGuardHTML = `
    // RTL Check
    const hasHebrew = /[\\u0590-\\u05FF]/.test(prompt.content);
    const hasEnglishVars = /\\$\\([a-zA-Z0-9_]+\\)|\\{[a-zA-Z0-9_]+\\}/.test(prompt.content);
    if (hasHebrew && hasEnglishVars) {
      if (!prompt.content.includes('\\u200E') && !prompt.content.includes('dir="ltr"')) {
        const proceed = window.confirm("שים לב: זוהו משתנים באנגלית בתוך טקסט בעברית שעשויים להופיע הפוך (בעיות RTL). מומלץ לוודא שהם מיושרים כראוי (למשל בעזרת סימני כיווניות). האם להמשיך בשמירה בכל זאת?");
        if (!proceed) return;
      }
    }
`;

code = code.replace(
  '  const handleSave = async (prompt: Partial<Prompt>) => {',
  '  const handleSave = async (prompt: Partial<Prompt>) => {\n' + rtlGuardHTML
);


fs.writeFileSync('src/App.tsx', code);
