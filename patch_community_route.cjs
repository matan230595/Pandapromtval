const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('currentView === "community" ?')) {
  // Add community view rendering
  code = code.replace(
    '        ) : currentView === "dashboard" ? (',
    '        ) : currentView === "community" ? (\n          <div className="flex-1 overflow-y-auto">\n            <CommunityView onImport={(p) => { handleOpenNewEditor(); }} onShowToast={showToast} />\n          </div>\n        ) : currentView === "dashboard" ? ('
  );
  
  // Fix the community nav button
  code = code.replace(
    'setCurrentView("library"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedFolder === "community" && currentView === "library"',
    'setCurrentView("community"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentView === "community"'
  );
  
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched CommunityView route and button");
}
