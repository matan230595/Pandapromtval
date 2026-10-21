const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const oldHero = `<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-blue-50 border border-white/20">
              <SparkleIcon /> המרחב האישי שלך
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              הפרומפטים שלך, <br />
              <span className="text-blue-100">מסודרים וחכמים.</span>
            </h1>
            <p className="text-blue-50 text-lg leading-relaxed opacity-90">
              נהל, סווג, וצור פרומפטים מנצחים בלחיצת כפתור עם כוחה של בינה מלאכותית.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <button onClick={onCreatePrompt} className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              <Plus className="w-5 h-5" /> צור פרומפט חדש
            </button>
            <button onClick={onNavigateToLibrary} className="w-full sm:w-auto bg-blue-700/50 hover:bg-blue-700/70 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all">
              <Search className="w-5 h-5" /> חיפוש בספריה
            </button>
          </div>
        </div>`;

const newHero = `<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-blue-50 border border-white/20">
              <SparkleIcon /> המרחב האישי שלך ב-PandaPrompt
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              הפרומפטים שלך, <br />
              <span className="text-blue-100">מסודרים וחכמים.</span>
            </h1>
            <p className="text-blue-50 text-lg leading-relaxed opacity-90">
              נהל, סווג, וצור פרומפטים מנצחים בלחיצת כפתור. הפנדה תדאג לשאר!
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button onClick={onCreatePrompt} className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                <Plus className="w-5 h-5" /> צור פרומפט חדש
              </button>
              <button onClick={onNavigateToLibrary} className="w-full sm:w-auto bg-blue-700/50 hover:bg-blue-700/70 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all">
                <Search className="w-5 h-5" /> חיפוש בספריה
              </button>
            </div>
          </div>
          <div className="hidden md:flex shrink-0 relative">
             <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
             <img src="/A0494A97-E398-4199-83C8-6FE4369108B2.png" alt="Panda Mascot" className="relative z-10 w-48 h-48 lg:w-64 lg:h-64 object-contain drop-shadow-2xl" />
          </div>
        </div>`;

if (code.includes('המרחב האישי שלך')) {
    code = code.replace(oldHero, newHero);
    fs.writeFileSync('src/components/DashboardView.tsx', code);
    console.log("Patched hero in DashboardView");
} else {
    console.log("Could not find hero in DashboardView");
}
