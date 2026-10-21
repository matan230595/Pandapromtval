const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('SharedPromptView')) {
  code = code.replace(
    "import { TeamComments } from './components/TeamComments';",
    "import { TeamComments } from './components/TeamComments';\nimport { SharedPromptView } from './components/SharedPromptView';"
  );
}

// Add early return in function App()
const hookTarget = "function App() {\n  const [user, setUser] = useState<User | null>(null);";
const checkLogic = `
  const urlParams = new URLSearchParams(window.location.search);
  const sharedPromptId = urlParams.get('shared');
  if (sharedPromptId) {
    return <SharedPromptView promptId={sharedPromptId} />;
  }
`;

if (!code.includes("const sharedPromptId")) {
  code = code.replace(
    hookTarget,
    "function App() {" + checkLogic + "\n  const [user, setUser] = useState<User | null>(null);"
  );
}

fs.writeFileSync('src/App.tsx', code);
