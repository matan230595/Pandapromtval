const fs = require('fs');
let code = fs.readFileSync('src/components/UserProfileView.tsx', 'utf8');

if (!code.includes('if (!auth?.currentUser) {')) {
   // Already patched loading? Let's check.
}

const noAuthMsg = `  if (!auth?.currentUser && !isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-8" dir="rtl">
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-10 text-center shadow-sm">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <img src="/A0494A97-E398-4199-83C8-6FE4369108B2.png" alt="Panda Mascot" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">עליך להתחבר כדי לצפות בפרופיל</h2>
          <p className="text-slate-500 mb-8">התחבר עם Google כדי לשמור את הפרופיל שלך, לשתף פרומפטים עם הקהילה, ולנהל מועדפים.</p>
        </div>
      </div>
    );
  }

  return (`;

code = code.replace('  return (', noAuthMsg);
fs.writeFileSync('src/components/UserProfileView.tsx', code);
console.log("Patched UserProfileView to show login message");
