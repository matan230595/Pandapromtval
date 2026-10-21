const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldState = `<div className="text-center text-slate-500 py-12">
                    לא נמצאו פרומפטים.
                  </div>`;
const newState = `<div className="bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center mt-8 max-w-xl mx-auto">
                    <div className="w-16 h-16 bg-white dark:bg-[#111] rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-sm mb-4">
                      <Terminal className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">לא נמצאו פרומפטים</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">
                      נראה שאין עדיין פרומפטים בתיקייה זו, או ששום פרומפט לא תואם לחיפוש שלך.
                    </p>
                    <button onClick={() => { setEditingPrompt({}); setIsEditing(true); setSelectedPromptId(null); }} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md flex items-center gap-2 transition-colors">
                      <Plus className="w-4 h-4" /> צור פרומפט חדש
                    </button>
                  </div>`;

if (code.includes(oldState)) {
    code = code.replace(oldState, newState);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Empty state patched!");
} else {
    console.log("Could not find old state.");
}
