const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">תוכן הפרומפט</label>
                            <button onClick={handleEnhancePrompt} disabled={isEnhancing} className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50">
                              {isEnhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                              שפר בעזרת AI
                            </button>
                          </div>
`;

// Build the replacement
const replacement = `
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">תוכן הפרומפט</label>
                            <div className="flex items-center gap-2">
                               <div className="px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-medium flex items-center gap-1">
                                 <BarChart2 className="w-3 h-3" />
                                 ~{Math.ceil((editingPrompt.content || '').length / 4)} טוקנים
                               </div>
                               <button onClick={handleMagicSuggest} disabled={isMagicSuggesting || !editingPrompt.content?.trim()} className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50">
                                 {isMagicSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                 {isMagicSuggesting ? 'מנתח...' : 'שפר בעזרת Magic AI'}
                               </button>
                            </div>
                          </div>
                          
                          {magicSuggestions && (
                            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 rounded-xl relative">
                              <button onClick={() => setMagicSuggestions(null)} className="absolute top-2 right-2 text-purple-400 hover:text-purple-600">
                                <X className="w-3 h-3" />
                              </button>
                              <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1 mb-2">
                                <Sparkles className="w-3 h-3" /> Magic Insights:
                              </h4>
                              {magicSuggestions.missingRole && (
                                <p className="text-xs text-purple-700 dark:text-purple-400 mb-1">
                                  <strong>תפקיד מומלץ (Role Prompting):</strong> {magicSuggestions.missingRole}
                                </p>
                              )}
                              {magicSuggestions.suggestedVariables?.length > 0 && (
                                <p className="text-xs text-purple-700 dark:text-purple-400 mb-1">
                                  <strong>משתנים שחסרים:</strong> {magicSuggestions.suggestedVariables.map(v => \`$(\${v})\`).join(', ')}
                                </p>
                              )}
                              {magicSuggestions.improvements?.length > 0 && (
                                <ul className="text-xs text-purple-700 dark:text-purple-400 list-disc list-inside">
                                  {magicSuggestions.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                                </ul>
                              )}
                            </div>
                          )}
`;

code = code.replace(targetStr.trim(), replacement.trim());
fs.writeFileSync('src/App.tsx', code);
