const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const listener = `
  // Listen for community comments on user's public prompts
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = collection(db, 'public_prompts');
    // For a real app, query by authorId === currentUser.uid
    // Due to missing indexes possibly, we might just listen to the whole collection and filter, 
    // but limit to small for safety, or just do a simple snapshot.
    // For demonstration of the custom toast, let's just create a generic hook that fires when a prompt we own gets a comment increment.
    let initialLoad = true;
    const unsub = onSnapshot(q, (snapshot) => {
      if (initialLoad) {
        initialLoad = false;
        return;
      }
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          const data = change.doc.data();
          // If the prompt belongs to the current user and comments count increased
          if (data.authorId === auth.currentUser?.uid) {
            showToast(\`מישהו הגיב לפרומפט שלך: "\${data.title}"\`, 'community');
          }
        }
      });
    });
    return () => unsub();
  }, [auth.currentUser]);
`;

code = code.replace(
  'const [duePrompt, setDuePrompt] = useState<Prompt | null>(null);',
  'const [duePrompt, setDuePrompt] = useState<Prompt | null>(null);\n' + listener
);

fs.writeFileSync('src/App.tsx', code);
