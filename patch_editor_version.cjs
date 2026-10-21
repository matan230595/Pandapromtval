const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const versionNameHTML = `
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">שם גרסה (אופציונלי)</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="לדוגמה: v1.1 - שיפור טון"
                              value={editingPrompt?.currentVersionName || ""}
                              onChange={(e) => setEditingPrompt({...editingPrompt, currentVersionName: e.target.value})}
                              className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white"
                            />
                          </div>
                        </div>
`;

code = code.replace(
  '                        </div>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            ) : selectedPrompt ? (',
  '                        </div>\n' + versionNameHTML + '                      </div>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            ) : selectedPrompt ? ('
);

fs.writeFileSync('src/App.tsx', code);
