const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The AdvancedAnalytics should be loaded instead of InsightsDashboard or accessible via InsightsDashboard
if (!code.includes('AdvancedAnalytics')) {
  code = code.replace(
    "import { InsightsDashboard } from './components/InsightsDashboard';",
    "import { InsightsDashboard } from './components/InsightsDashboard';\nimport { AdvancedAnalytics } from './components/AdvancedAnalytics';"
  );
}

// Replace currentView === 'insights' rendering
code = code.replace(
  'currentView === \'insights\' ? (\n            <InsightsDashboard prompts={prompts} />',
  'currentView === \'insights\' ? (\n            <AdvancedAnalytics prompts={prompts} />'
);

fs.writeFileSync('src/App.tsx', code);
