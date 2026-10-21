const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// Revert the `{!isReadingMode && (` if it was added
code = code.replace(
  '{!isReadingMode && (<div className="w-80 bg-white dark:bg-[#111] border-l border-slate-200 dark:border-white/5 flex flex-col z-20 overflow-hidden shrink-0">',
  '<div className="w-80 bg-white dark:bg-[#111] border-l border-slate-200 dark:border-white/5 flex flex-col z-20 overflow-hidden shrink-0">'
);

// Apply via class
code = code.replace(
  '<div className="w-80 bg-white dark:bg-[#111] border-l border-slate-200 dark:border-white/5 flex flex-col z-20 overflow-hidden shrink-0">',
  '<div className={`w-80 bg-white dark:bg-[#111] border-l border-slate-200 dark:border-white/5 flex flex-col z-20 overflow-hidden shrink-0 ${isReadingMode ? \'hidden\' : \'\'}`}>'
);

// We need a reading mode toggle button. I'll add it to the top bar of the viewer.
// Find the button group:
// <button title="העתק תוכן"
let copyBtn = '<button title="העתק תוכן" onClick={handleCopyPrompt} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-900/20 rounded-lg ml-2">';
let readBtn = `<button title={isReadingMode ? "צא ממצב קריאה" : "מצב קריאה"} onClick={() => setIsReadingMode(!isReadingMode)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 hover:bg-blue-50 dark:bg-white/5 dark:hover:bg-blue-900/20 rounded-lg ml-2"><BookOpen className="w-4 h-4" /></button>\n`;

code = code.replace(copyBtn, readBtn + copyBtn);

// Also we should hide the top header if in reading mode? The user said "המסתיר את סרגלי הכלים והתפריטים ומציג רק את תוכן הפרומפט".
// Maybe hide the top bar too? If we hide it, how do they exit? We keep the readBtn visible floating, or keep a minimal header.
// I'll make the top header minimal by conditionally rendering parts.

fs.writeFileSync(path, code);
