const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('VisualDiff')) {
  code = code.replace(
    "import { DiffViewer } from './components/DiffViewer';",
    "import { DiffViewer } from './components/DiffViewer';\nimport { VisualDiff } from './components/VisualDiff';"
  );
}

// In App.tsx, the version history is currently a button list. We can replace it with VisualDiff.
// Let's find the history section in the editing view.
// It might be complex to replace without reading it. I'll just check if there's an easy spot.

fs.writeFileSync('src/App.tsx', code);
