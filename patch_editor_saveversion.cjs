const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const saveVersionButton = `
                      <button onClick={() => {
                        const versionName = window.prompt("הכנס שם לגרסה זו (לדוגמה: 'גרסה מקוצרת'):");
                        if (versionName && editingPrompt) {
                          handleSave({...editingPrompt, currentVersionName: versionName});
                          showToast('נשמר כגרסה מיוחדת: ' + versionName, 'success');
                        }
                      }} className="px-5 py-2.5 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 shadow-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 text-sm ml-2">
                        <Save className="w-4 h-4" /> שמור כגרסה מיוחדת
                      </button>
                      <button onClick={() => handleSave(editingPrompt || {})} className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center gap-2 transition-all hover:-translate-y-0.5 text-sm">
`;

code = code.replace(
  '<button onClick={() => handleSave(editingPrompt || {})} className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center gap-2 transition-all hover:-translate-y-0.5 text-sm">',
  saveVersionButton
);

fs.writeFileSync('src/App.tsx', code);
