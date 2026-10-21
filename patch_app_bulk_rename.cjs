const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'import { BulkTagModal } from "./components/BulkTagModal";',
  'import { BulkTagModal } from "./components/BulkTagModal";\nimport { BulkRenameModal } from "./components/BulkRenameModal";'
);

code = code.replace(
  '  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);',
  '  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);\n  const [isBulkRenameModalOpen, setIsBulkRenameModalOpen] = useState(false);'
);

const handleBulkRenameStr = `
  const handleBulkRename = async (pattern: string, startNumber: number) => {
    let currentNumber = startNumber;
    let updatedPrompts = [...prompts];
    
    for (const id of selectedIds) {
      const newTitle = pattern.replace('{n}', currentNumber.toString());
      if (user) {
        await updateDoc(doc(db, "users", user.uid, "prompts", id), { title: newTitle, updatedAt: new Date().toISOString() });
      } else {
        const index = updatedPrompts.findIndex(p => p.id === id);
        if (index > -1) {
          updatedPrompts[index].title = newTitle;
          updatedPrompts[index].updatedAt = new Date().toISOString();
        }
      }
      currentNumber++;
    }
    
    if (!user) {
      setPrompts(updatedPrompts);
      localStorage.setItem('promptvault_prompts', JSON.stringify(updatedPrompts));
    }
    showToast("השמות שונו בהצלחה", "success");
    setSelectedIds([]);
  };
`;

code = code.replace(
  '  const handleBulkDelete = () => {',
  handleBulkRenameStr + '\n  const handleBulkDelete = () => {'
);

code = code.replace(
  '        onExport={handleBulkExport}',
  '        onExport={handleBulkExport}\n        onRename={() => setIsBulkRenameModalOpen(true)}'
);

code = code.replace(
  '      <BulkTagModal ',
  '      <BulkRenameModal \n        isOpen={isBulkRenameModalOpen}\n        onClose={() => setIsBulkRenameModalOpen(false)}\n        count={selectedIds.length}\n        onConfirm={handleBulkRename}\n      />\n      <BulkTagModal '
);

fs.writeFileSync('src/App.tsx', code);
