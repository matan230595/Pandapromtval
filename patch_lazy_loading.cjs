const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// Replace synchronous imports with React.lazy
const importsToReplace = [
  'import { CommunityView } from "./components/CommunityView";',
  'import { DashboardView } from "./components/DashboardView";',
  'import { InsightsDashboard } from "./components/InsightsDashboard";',
  'import { TemplatesGallery } from "./components/TemplatesGallery";',
  'import { VisualWorkflow } from "./components/VisualWorkflow";'
];

const lazyImports = `
const CommunityView = React.lazy(() => import("./components/CommunityView").then(module => ({ default: module.CommunityView })));
const DashboardView = React.lazy(() => import("./components/DashboardView").then(module => ({ default: module.DashboardView })));
const InsightsDashboard = React.lazy(() => import("./components/InsightsDashboard").then(module => ({ default: module.InsightsDashboard })));
const TemplatesGallery = React.lazy(() => import("./components/TemplatesGallery").then(module => ({ default: module.TemplatesGallery })));
const VisualWorkflow = React.lazy(() => import("./components/VisualWorkflow").then(module => ({ default: module.VisualWorkflow })));
`;

for (const imp of importsToReplace) {
  appTsx = appTsx.replace(imp, '');
}

// Add lazy imports right after the last import
appTsx = appTsx.replace('import { IntegrationPanel } from \'./components/IntegrationPanel\';', 'import { IntegrationPanel } from \'./components/IntegrationPanel\';\n' + lazyImports);

// Wrap the <AnimatePresence mode="wait"> content with Suspense?
// Wait, we can just wrap the specific components when they are rendered.
// In App.tsx:
// <CommunityView ... />
// We can just wrap the switch block in a Suspense.
const suspenseWrapper = `
      <React.Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
`;

appTsx = appTsx.replace('<AnimatePresence mode="wait">', '<AnimatePresence mode="wait">\n' + suspenseWrapper);
// Need to close Suspense.
appTsx = appTsx.replace('</AnimatePresence>', '</React.Suspense>\n</AnimatePresence>');

fs.writeFileSync('src/App.tsx', appTsx);
console.log("Lazy loading applied");
