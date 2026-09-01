const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `import { CommunityTemplates } from "./components/CommunityTemplates";`,
  `import { CommunityView } from "./components/CommunityView";
import { UserProfileView } from "./components/UserProfileView";`
);

code = code.replace(
  `const [currentView, setCurrentView] = useState<"dashboard" | "library" | "insights" | "settings">("dashboard");`,
  `const [currentView, setCurrentView] = useState<"dashboard" | "library" | "insights" | "settings" | "profile" | "community">("dashboard");`
);

fs.writeFileSync('src/App.tsx', code);
