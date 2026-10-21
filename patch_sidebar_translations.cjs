const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<span className="font-bold tracking-tight text-xl">PromptVault<\/span>/g, `<span className="font-bold tracking-tight text-xl">{t('app.title')}</span>`);
code = code.replace(/<span className="font-bold tracking-tight text-lg">PromptVault<\/span>/g, `<span className="font-bold tracking-tight text-lg">{t('app.title')}</span>`);
code = code.replace(/לוח בקרה/g, `{t('nav.dashboard')}`);
code = code.replace(/<FolderOpen className="w-4 h-4" \/> הספריה/g, `<FolderOpen className="w-4 h-4" /> {t('nav.library')}`);
code = code.replace(/<BarChart2 className="w-4 h-4" \/> אנליטיקה/g, `<BarChart2 className="w-4 h-4" /> {t('nav.insights')}`);
code = code.replace(/<UserIcon className="w-4 h-4" \/> הפרופיל שלי/g, `<UserIcon className="w-4 h-4" /> {t('nav.profile')}`);
code = code.replace(/<AlignLeft className="w-4 h-4" \/> כל הפרומפטים/g, `<AlignLeft className="w-4 h-4" /> {t('nav.all')}`);
code = code.replace(/<Heart className="w-4 h-4" \/> מועדפים/g, `<Heart className="w-4 h-4" /> {t('nav.favorites')}`);
code = code.replace(/<Download className="w-4 h-4" \/> ארכיון/g, `<Download className="w-4 h-4" /> {t('nav.archive')}`);
code = code.replace(/<Sparkles className="w-4 h-4" \/> תבניות קהילה/g, `<Sparkles className="w-4 h-4" /> {t('nav.community')}`);
code = code.replace(/אוספים \(תיקיות\)/g, `{t('nav.folders')}`);
code = code.replace(/קהילה וכלים/g, `{t('nav.communityAndTools')}`);
code = code.replace(/גיבוי וייצוא/g, `{t('nav.backup')}`);
code = code.replace(/<Download className="w-4 h-4" \/> ייצוא ל-CSV \(Excel\)/g, `<Download className="w-4 h-4" /> {t('nav.exportCSV')}`);
code = code.replace(/<FileCode className="w-4 h-4" \/> גיבוי מלא \(JSON\)/g, `<FileCode className="w-4 h-4" /> {t('nav.exportJSON')}`);
code = code.replace(/סינון/g, `{t('nav.filters')}`);

fs.writeFileSync('src/App.tsx', code);
