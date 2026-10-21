const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const replacement = `
      {/* Productivity Dashboard */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-900/30 p-6 rounded-3xl mb-8 mt-4 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" /> דשבורד פרודוקטיביות
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">שימושים השבוע</div>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {prompts.filter(p => p.lastUsedAt && (new Date().getTime() - new Date(p.lastUsedAt).getTime()) / (1000 * 3600 * 24) <= 7).length}
            </div>
            <div className="text-xs text-slate-400 mt-1">פרומפטים פעילים</div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">הכי פופולרי</div>
            <div className="space-y-2">
              {prompts.filter(p => (p.useCount || 0) > 0).sort((a,b) => (b.useCount || 0) - (a.useCount || 0)).slice(0, 2).map(p => (
                <button key={p.id} onClick={() => onSelectPrompt(p.id)} className="w-full text-right text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 truncate transition-colors">
                  • {p.title} <span className="text-xs text-slate-400">({p.useCount})</span>
                </button>
              ))}
              {prompts.filter(p => (p.useCount || 0) > 0).length === 0 && <div className="text-sm text-slate-400">אין נתונים עדיין</div>}
            </div>
          </div>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">משימות קרובות (תאריך יעד)</div>
            <div className="space-y-2">
              {prompts.filter(p => p.dueDate && new Date(p.dueDate).getTime() >= new Date().getTime()).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 2).map(p => (
                <button key={p.id} onClick={() => onSelectPrompt(p.id)} className="w-full text-right text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-rose-600 truncate transition-colors flex justify-between items-center">
                  <span className="truncate ml-2">• {p.title}</span>
                  <span className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">{new Date(p.dueDate).toLocaleDateString('he-IL')}</span>
                </button>
              ))}
              {prompts.filter(p => p.dueDate && new Date(p.dueDate).getTime() >= new Date().getTime()).length === 0 && <div className="text-sm text-slate-400">אין משימות קרובות</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Mini Stats */}
`;

code = code.replace('{/* Mini Stats */}', replacement);

fs.writeFileSync('src/components/DashboardView.tsx', code);
