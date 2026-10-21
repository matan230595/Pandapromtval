const fs = require('fs');

let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// Import AuthModal
code = code.replace(
  'import { DeleteConfirmModal } from "./components/DeleteConfirmModal";',
  'import { DeleteConfirmModal } from "./components/DeleteConfirmModal";\nimport { AuthModal } from "./components/AuthModal";'
);

// Add AuthModal state
code = code.replace(
  'const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);',
  'const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);\n  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);'
);

// Replace loginWithGoogle() with setIsAuthModalOpen(true)
code = code.replace(
  '() => loginWithGoogle()',
  '() => setIsAuthModalOpen(true)'
);

// Add AuthModal to render tree
code = code.replace(
  '<DeleteConfirmModal ',
  '<AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onShowToast={showToast} />\n      <DeleteConfirmModal '
);

fs.writeFileSync(path, code);
console.log("Patched App.tsx with AuthModal");
