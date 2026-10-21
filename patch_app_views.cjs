const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'import { InsightsDashboard } from "./components/InsightsDashboard";',
  'import { InsightsDashboard } from "./components/InsightsDashboard";\nimport { TemplatesGallery } from "./components/TemplatesGallery";\nimport { VisualWorkflow } from "./components/VisualWorkflow";'
);

code = code.replace(
  '          </div>\n        ) : (\n          <>\n            {/* List View */}',
  '          </div>\n        ) : currentView === "templates" ? (\n          <div className="flex-1 overflow-y-auto p-4 md:p-8">\n            <TemplatesGallery onImport={(template) => {\n              setEditingPrompt({...template, isAIOptimized: true});\n              setIsEditing(true);\n              setSelectedPromptId(null);\n              setCurrentView("library");\n            }} />\n          </div>\n        ) : currentView === "workflows" ? (\n          <div className="flex-1 p-0 overflow-hidden">\n            <VisualWorkflow prompts={prompts} />\n          </div>\n        ) : (\n          <>\n            {/* List View */}'
);

fs.writeFileSync('src/App.tsx', code);
