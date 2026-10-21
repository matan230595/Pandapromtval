const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

// We add a 'syncStatus' state: 'idle' | 'syncing' | 'saved'
code = code.replace(
  'const [isReadingMode, setIsReadingMode] = useState(false);',
  'const [isReadingMode, setIsReadingMode] = useState(false);\n  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "saved">("idle");'
);

// Update save to Firestore inside handleSave
const handleSaveStr = 'await setDoc(doc(db, "users", user.uid, "prompts", newPrompt.id), newPrompt);';
const handleSaveNew = 'setSyncStatus("syncing");\n      await setDoc(doc(db, "users", user.uid, "prompts", newPrompt.id), newPrompt);\n      setSyncStatus("saved");\n      setTimeout(() => setSyncStatus("idle"), 2000);';
code = code.replace(handleSaveStr, handleSaveNew);

// In handleDelete
const deleteDocStr = 'await deleteDoc(doc(db, "users", user.uid, "prompts", id));';
const deleteDocNew = 'setSyncStatus("syncing");\n      await deleteDoc(doc(db, "users", user.uid, "prompts", id));\n      setSyncStatus("saved");\n      setTimeout(() => setSyncStatus("idle"), 2000);';
code = code.replace(deleteDocStr, deleteDocNew);

// Add the visual indicator in the top header or somewhere globally visible
const indicatorStr = `
      {user && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-full text-xs shadow-lg font-medium">
          {syncStatus === 'syncing' ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Cloud className="w-3.5 h-3.5" /></motion.div> שומר בענן...</>
          ) : syncStatus === 'saved' ? (
            <><Check className="w-3.5 h-3.5 text-green-400" /> גיבוי מעודכן</>
          ) : (
            <><Cloud className="w-3.5 h-3.5 text-slate-400" /> מגובה בענן</>
          )}
        </div>
      )}
`;

// Insert just before <Toast
code = code.replace('<Toast', indicatorStr + '\n      <Toast');

fs.writeFileSync(path, code);
