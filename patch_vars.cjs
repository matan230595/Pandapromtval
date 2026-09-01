const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newVars = `
  const COMMON_VARS = [
    { name: 'PLATFORM', desc: 'Choose target AI model or platform', format: 'String' },
    { name: 'TOPIC', desc: 'The main subject of the prompt', format: 'String' },
    { name: 'AUDIENCE', desc: 'Who the output is intended for', format: 'String' },
    { name: 'LANGUAGE', desc: 'Target language of the output', format: 'String' },
    { name: 'TONE', desc: 'The emotional tone or style', format: 'String' },
    { name: 'FORMAT', desc: 'Output format (e.g., Markdown, JSON, PDF)', format: 'String' }
  ];
`;

code = code.replace("  const COMMON_VARS = ['PLATFORM', 'TOPIC', 'AUDIENCE', 'LANGUAGE', 'TONE', 'FORMAT'];", newVars);

code = code.replace("COMMON_VARS.filter(v => v.includes(varSuggest.filter)).map(v => (", "COMMON_VARS.filter(v => v.name.includes(varSuggest.filter.toUpperCase())).map(v => (");
code = code.replace("COMMON_VARS.filter(v => v.includes(varSuggest.filter)).length === 0", "COMMON_VARS.filter(v => v.name.includes(varSuggest.filter.toUpperCase())).length === 0");

code = code.replace(/<button\s*key=\{v\}\s*onClick=\{\(\) => handleVarSelect\(v\)\}\s*className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900\/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors font-mono"\s*>\s*\{v\}\s*<\/button>/m, `<button
                                      key={v.name}
                                      onClick={() => handleVarSelect(v.name)}
                                      className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                                    >
                                      <div className="text-sm font-mono font-bold">{v.name}</div>
                                      <div className="text-[10px] text-slate-500">{v.desc} ({v.format})</div>
                                    </button>`);

fs.writeFileSync('src/App.tsx', code);
