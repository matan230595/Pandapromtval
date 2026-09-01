const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '{selectedFolder === "all" ? <FolderOpen className="w-5 h-5" /> : selectedFolder === "favorites" ? <Heart className="w-5 h-5" /> : <FolderIcon className="w-5 h-5" />}',
  '{selectedFolder === "all" ? <FolderOpen className="w-5 h-5" /> : selectedFolder === "favorites" ? <Heart className="w-5 h-5" /> : selectedFolder === "archive" ? <Download className="w-5 h-5" /> : selectedFolder === "community" ? <Sparkles className="w-5 h-5" /> : <FolderIcon className="w-5 h-5" />}'
);

code = code.replace(
  '{selectedFolder === "all" ? "כל הפרומפטים" : selectedFolder === "favorites" ? "מועדפים" : folders.find(f => f.id === selectedFolder)?.name || "ספריה"}',
  '{selectedFolder === "all" ? "כל הפרומפטים" : selectedFolder === "favorites" ? "מועדפים" : selectedFolder === "archive" ? "ארכיון" : selectedFolder === "community" ? "תבניות קהילה" : folders.find(f => f.id === selectedFolder)?.name || "ספריה"}'
);

fs.writeFileSync('src/App.tsx', code);
