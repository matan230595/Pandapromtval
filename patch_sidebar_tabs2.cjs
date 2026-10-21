const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert imports
if (!code.includes('IntegrationPanel')) {
  code = code.replace(
    "import { SharedPromptView } from './components/SharedPromptView';",
    "import { SharedPromptView } from './components/SharedPromptView';\nimport { IntegrationPanel } from './components/IntegrationPanel';\nimport { EvaluationPanel } from './components/EvaluationPanel';"
  );
}

// Update state for sidebar tab
if (code.includes("useState<'sandbox' | 'comments'>('sandbox')")) {
  code = code.replace(
    "useState<'sandbox' | 'comments'>('sandbox')",
    "useState<'sandbox' | 'comments' | 'api' | 'eval'>('sandbox')"
  );
}

// Update the right sidebar rendering
const tabsButtonsHTML = `
                        <div className="flex border-b border-slate-200 dark:border-white/10 overflow-x-auto scrollbar-hide">
                          <button 
                            onClick={() => setSidebarTab('sandbox')}
                            className={\`flex-1 min-w-[80px] p-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors \${sidebarTab === 'sandbox' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}\`}
                          >
                            <Bot className="w-3.5 h-3.5" /> Sandbox
                          </button>
                          <button 
                            onClick={() => setSidebarTab('eval')}
                            className={\`flex-1 min-w-[80px] p-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors \${sidebarTab === 'eval' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}\`}
                          >
                            <Beaker className="w-3.5 h-3.5" /> Eval
                          </button>
                          <button 
                            onClick={() => setSidebarTab('api')}
                            className={\`flex-1 min-w-[80px] p-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors \${sidebarTab === 'api' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}\`}
                          >
                            <Code2 className="w-3.5 h-3.5" /> API
                          </button>
                          <button 
                            onClick={() => setSidebarTab('comments')}
                            className={\`flex-1 min-w-[80px] p-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors \${sidebarTab === 'comments' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}\`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> {(selectedPrompt?.teamComments || []).length > 0 && \`(\${selectedPrompt?.teamComments?.length})\`}
                          </button>
                        </div>
`;

const contentLogicHTML = `
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
                        ) : sidebarTab === 'eval' ? (
                          <EvaluationPanel prompt={selectedPrompt!} />
                        ) : sidebarTab === 'api' ? (
                          <IntegrationPanel prompt={selectedPrompt!} />
                        ) : (
                          <TeamComments prompt={selectedPrompt!} onUpdate={handleSave} />
                        )}
`;

code = code.replace(/<div className="flex border-b border-slate-200 dark:border-white\/10">[\s\S]*?<\/button>\n                        <\/div>/, tabsButtonsHTML);
code = code.replace(/\{sidebarTab === 'sandbox' \? \([\s\S]*?\) : \(\n                          <TeamComments prompt=\{selectedPrompt!\} onUpdate=\{handleSave\} \/>\n                        \)\}/, contentLogicHTML);

// Import icons
if (!code.includes('Code2,')) {
  code = code.replace(
    'AlertTriangle, Filter, Bot, User as UserIcon',
    'AlertTriangle, Filter, Bot, User as UserIcon, Code2, Beaker'
  );
}

fs.writeFileSync('src/App.tsx', code);
