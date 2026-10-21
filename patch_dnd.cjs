const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state for dragging over prompt
code = code.replace(
  'const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);',
  `const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverPromptId, setDragOverPromptId] = useState<string | null>(null);`
);

// 2. Add handlePromptDragOver and handlePromptDrop functions
const dndFunctions = `
  const handlePromptDragOver = (e: React.DragEvent, targetPromptId: string) => {
    e.preventDefault();
    if (dragOverPromptId !== targetPromptId) {
      setDragOverPromptId(targetPromptId);
    }
  };

  const handlePromptDrop = async (e: React.DragEvent, targetPromptId: string) => {
    e.preventDefault();
    e.stopPropagation(); // prevent folder drop
    setDragOverPromptId(null);
    const draggedPromptId = e.dataTransfer.getData('text/plain');
    if (!draggedPromptId || draggedPromptId === targetPromptId) return;

    if (sortOrder !== 'custom') {
      setSortOrder('custom');
    }

    const list = [...filteredPrompts];
    const draggedIdx = list.findIndex(p => p.id === draggedPromptId);
    const targetIdx = list.findIndex(p => p.id === targetPromptId);
    
    if (draggedIdx === -1 || targetIdx === -1) return;

    const draggedPrompt = list[draggedIdx];
    list.splice(draggedIdx, 1);
    list.splice(targetIdx, 0, draggedPrompt);
    
    const updates = list.map((p, index) => ({
      ...p,
      sortIndex: index
    }));
    
    setPrompts(prev => prev.map(p => {
      const updated = updates.find(u => u.id === p.id);
      return updated ? updated : p;
    }));

    if (auth.currentUser) {
      for (const p of updates) {
        setDoc(doc(db, "users", auth.currentUser.uid, "prompts", p.id), { sortIndex: p.sortIndex }, { merge: true }).catch(console.error);
      }
    }
  };
`;

code = code.replace(
  'const handleDragOver = (e: React.DragEvent, folderId: string) => {',
  dndFunctions + '\n  const handleDragOver = (e: React.DragEvent, folderId: string) => {'
);

code = code.replace(
  'const handleDragLeave = () => {',
  `const handlePromptDragLeave = () => {
    setDragOverPromptId(null);
  };

  const handleDragLeave = () => {`
);

// 3. Attach drag events to prompt cards in Grid/List View
const gridCardTarget = `draggable={true}
                    onDragStart={(e: React.DragEvent) => handleDragStart(e, p.id)}
                    onClick={() => { setSelectedPromptId(p.id); setIsEditing(false); }}
                    className={\`cursor-pointer rounded-[20px] border transition-all duration-300 active:cursor-grabbing \${!selectedPromptId && !isEditing ? 'p-6 hover:-translate-y-1.5 hover:shadow-xl' : 'p-4 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]'} \${pulsingPromptId === p.id ? 'animate-pulse ring-2 ring-blue-500 shadow-xl' : ''} \${selectedPromptId === p.id || focusedPromptIndex === filteredPrompts.indexOf(p) ? 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700/50 ring-2 ring-blue-500/40' : 'bg-white dark:bg-[#111] border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}\`}`;

const gridCardReplacement = `draggable={true}
                    onDragStart={(e: React.DragEvent) => handleDragStart(e, p.id)}
                    onDragOver={(e: React.DragEvent) => handlePromptDragOver(e, p.id)}
                    onDragLeave={handlePromptDragLeave}
                    onDrop={(e: React.DragEvent) => handlePromptDrop(e, p.id)}
                    onClick={() => { setSelectedPromptId(p.id); setIsEditing(false); }}
                    className={\`cursor-pointer rounded-[20px] border transition-all duration-300 active:cursor-grabbing \${!selectedPromptId && !isEditing ? 'p-6 hover:-translate-y-1.5 hover:shadow-xl' : 'p-4 hover:bg-slate-50 dark:hover:bg-[#1a1a1a]'} \${pulsingPromptId === p.id ? 'animate-pulse ring-2 ring-blue-500 shadow-xl' : ''} \${selectedPromptId === p.id || focusedPromptIndex === filteredPrompts.indexOf(p) ? 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700/50 ring-2 ring-blue-500/40' : 'bg-white dark:bg-[#111] border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'} \${dragOverPromptId === p.id ? 'ring-4 ring-blue-400 opacity-50 scale-105' : ''}\`}`;

code = code.replace(gridCardTarget, gridCardReplacement);

fs.writeFileSync('src/App.tsx', code);
