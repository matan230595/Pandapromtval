const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexTags = /<div className="flex gap-2">\s*<span className=\{`text-\[10px\] px-2 py-0\.5 rounded-md font-medium \$\{PLATFORMS\[p\.platform\]\?\.bgColor\} \$\{PLATFORMS\[p\.platform\]\?\.textColor\}`\}>\s*\{PLATFORMS\[p\.platform\]\?\.name \|\| p\.platform\}\s*<\/span>\s*<\/div>/;

const newTags = `<div className="flex flex-wrap gap-1">
                            <span className={\`text-[10px] px-2 py-0.5 rounded-md font-medium \${PLATFORMS[p.platform]?.bgColor} \${PLATFORMS[p.platform]?.textColor}\`}>
                              {PLATFORMS[p.platform]?.name || p.platform}
                            </span>
                            {p.tags?.slice(0, 2).map(t => (
                              <button
                                key={t}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTagFilter(t);
                                  setTimeout(() => {
                                    const grid = document.getElementById('prompts-grid');
                                    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }, 50);
                                }}
                                className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                              >
                                {t}
                              </button>
                            ))}
                            {(p.tags?.length || 0) > 2 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-white/10 text-slate-500">
                                +{(p.tags?.length || 0) - 2}
                              </span>
                            )}
                          </div>`;

code = code.replace(regexTags, newTags);

fs.writeFileSync('src/App.tsx', code);
