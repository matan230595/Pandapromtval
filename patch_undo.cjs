const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const undoLogic = `
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    
    // We will simulate soft delete first
    const idsToDelete = [...selectedIds];
    const itemsToDelete = prompts.filter(p => idsToDelete.includes(p.id));
    
    // Remove from UI immediately
    setPrompts(prev => prev.filter(p => !idsToDelete.includes(p.id)));
    setSelectedIds([]);
    if (selectedPromptId && idsToDelete.includes(selectedPromptId)) setSelectedPromptId(null);
    
    // Set a toast with Undo action
    let timeoutId: any;
    
    const executeDelete = async () => {
      if (user) {
        for (const id of idsToDelete) {
          await deleteDoc(doc(db, "users", user.uid, "prompts", id));
        }
      } else {
        const stored = JSON.parse(localStorage.getItem("promptvault_prompts") || "[]");
        const updated = stored.filter((p: any) => !idsToDelete.includes(p.id));
        localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
      }
    };
    
    timeoutId = setTimeout(executeDelete, 5000);
    
    setToast({
      message: \`\${idsToDelete.length} פריטים הועברו לאשפה\`,
      type: 'success',
      action: {
        label: 'בטל פעולה',
        onClick: () => {
          clearTimeout(timeoutId);
          // Restore items
          setPrompts(prev => [...prev, ...itemsToDelete]);
          showToast('פעולת המחיקה בוטלה', 'info');
        }
      }
    });
  };
`;

code = code.replace(/  const handleBulkDelete = async \(\) => \{\n\s*if \(!window\.confirm\(`האם למחוק \$\{selectedIds\.length\} פרומפטים נבחרים\?`\)\) return;\n\s*if \(user\) \{\n\s*for \(const id of selectedIds\) \{\n\s*await deleteDoc\(doc\(db, "users", user\.uid, "prompts", id\)\);\n\s*\}\n\s*\} else \{\n\s*const updated = prompts\.filter\(p => !selectedIds\.includes\(p\.id\)\);\n\s*setPrompts\(updated\);\n\s*localStorage\.setItem\("promptvault_prompts", JSON\.stringify\(updated\)\);\n\s*\}\n\s*setSelectedIds\(\[\]\);\n\s*if \(selectedPromptId && selectedIds\.includes\(selectedPromptId\)\) setSelectedPromptId\(null\);\n\s*\};/g, undoLogic);

fs.writeFileSync('src/App.tsx', code);
