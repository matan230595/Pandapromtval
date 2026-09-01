const fs = require('fs');
let code = fs.readFileSync('src/components/CommandPalette.tsx', 'utf8');

const importRegex = /import \{ Search, Folder as FolderIcon, Plus, X, Sparkles, Command \} from 'lucide-react';/;
code = code.replace(importRegex, "import { Search, Folder as FolderIcon, Plus, X, Sparkles, Command, Sun, Moon } from 'lucide-react';");

const newProps = `  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;`;
code = code.replace(/  isOpen: boolean;\n  setIsOpen: \(isOpen: boolean\) => void;/g, newProps);

const newComponentSig = `export const CommandPalette: React.FC<Props> = ({ prompts, folders, onSelectPrompt, onSelectFolder, onCreatePrompt, isOpen, setIsOpen, isDarkMode, toggleTheme }) => {`;
code = code.replace(/export const CommandPalette: React\.FC<Props> = \(\{ prompts, folders, onSelectPrompt, onSelectFolder, onCreatePrompt, isOpen, setIsOpen \}\) => \{/g, newComponentSig);

const actionsHTML = `
                <button
                  onClick={() => { onCreatePrompt(); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  צור פרומפט חדש
                </button>
                {toggleTheme && (
                  <button
                    onClick={() => { toggleTheme(); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-indigo-900/30 flex items-center justify-center text-amber-600 dark:text-indigo-400 shrink-0">
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </div>
                    {isDarkMode ? 'מעבר לתצוגת יום' : 'מעבר לתצוגת לילה'}
                  </button>
                )}
`;

code = code.replace(/<button\n\s*onClick=\{\(\) => \{ onCreatePrompt\(\); setIsOpen\(false\); \}\}\n\s*className="w-full flex items-center gap-3 px-3 py-2\.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-white\/5 text-slate-700 dark:text-slate-300 transition-colors"\n\s*>\n\s*<div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900\/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">\n\s*<Plus className="w-4 h-4" \/>\n\s*<\/div>\n\s*צור פרומפט חדש\n\s*<\/button>/g, actionsHTML);

fs.writeFileSync('src/components/CommandPalette.tsx', code);
