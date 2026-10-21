const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert import
if (!code.includes('TeamComments')) {
  code = code.replace(
    "import { DueReminderModal } from './components/DueReminderModal';",
    "import { DueReminderModal } from './components/DueReminderModal';\nimport { TeamComments } from './components/TeamComments';"
  );
}

// Add state for sidebar tab
if (!code.includes('sidebarTab')) {
  code = code.replace(
    "  const [isDueReminderOpen, setIsDueReminderOpen] = useState(false);",
    "  const [isDueReminderOpen, setIsDueReminderOpen] = useState(false);\n  const [sidebarTab, setSidebarTab] = useState<'sandbox' | 'comments'>('sandbox');"
  );
}

// Update the right sidebar rendering
const rightSidebarHTML = `
                      <div className="w-full 2xl:w-[400px] shrink-0 border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#111] shadow-sm flex flex-col mt-8 2xl:mt-0 2xl:sticky 2xl:top-0 2xl:h-[calc(100vh-140px)] overflow-hidden">
                        <div className="flex border-b border-slate-200 dark:border-white/10">
                          <button 
                            onClick={() => setSidebarTab('sandbox')}
                            className={\`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors \${sidebarTab === 'sandbox' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}\`}
                          >
                            <Bot className="w-4 h-4" /> Sandbox
                          </button>
                          <button 
                            onClick={() => setSidebarTab('comments')}
                            className={\`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors \${sidebarTab === 'comments' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}\`}
                          >
                            <MessageSquare className="w-4 h-4" /> צוות {(selectedPrompt?.teamComments || []).length > 0 && \`(\${selectedPrompt?.teamComments?.length})\`}
                          </button>
                        </div>
                        
                        {sidebarTab === 'sandbox' ? (
                          <div className="flex-1 overflow-y-auto p-4">
                            <PromptTester 
                                prompt={selectedPrompt!}
                                onUpdate={handleSave}
                                onChain={(text) => setChainingText(text)}
                                nextPromptName={selectedPrompt?.chainNextPromptId ? prompts.find(p => p.id === selectedPrompt.chainNextPromptId)?.title : undefined}
                                onAutoChain={(text) => {
                                   if (selectedPrompt?.chainNextPromptId) {
                                      const nextP = prompts.find(p => p.id === selectedPrompt.chainNextPromptId);
                                      if (nextP) {
                                        const newContent = nextP.content + "\\n\\n[קלט מהפרומפט הקודם]:\\n" + text;
                                        setSelectedPromptId(nextP.id);
                                        setIsEditing(false);
                                        setSmartVarsText(newContent);
                                        setChainingText(null);
                                      }
                                   }
                                }}
                            />
                          </div>
                        ) : (
                          <TeamComments prompt={selectedPrompt!} onUpdate={handleSave} />
                        )}
                      </div>
`;

code = code.replace(/<div className="w-full 2xl:w-\[400px\] shrink-0 border border-slate-200 dark:border-white\/10 rounded-2xl bg-white dark:bg-\[\#111\] shadow-sm flex flex-col mt-8 2xl:mt-0 2xl:sticky 2xl:top-0 2xl:h-\[calc\(100vh-140px\)\]">[\s\S]*?<\/div>\n                                          <\/div>/, rightSidebarHTML + '\n                                          </div>');

fs.writeFileSync('src/App.tsx', code);
