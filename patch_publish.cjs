const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `  const handlePublishToCommunity = async (prompt: Prompt) => {
    if (!user) {
      showToast("יש להתחבר כדי לפרסם בקהילה", "error");
      return;
    }
    try {
      const publicPrompt = {
        ...prompt,
        authorId: user.uid,
        authorName: user.displayName || 'משתמש אנונימי',
        authorPhoto: user.photoURL || undefined,
        likes: [],
        commentsCount: 0
      };
      await setDoc(doc(db, "community_prompts", prompt.id), publicPrompt);
      showToast("הפרומפט פורסם לקהילה בהצלחה!", "success");
    } catch (e) {
      showToast("שגיאה בפרסום לקהילה", "error");
    }
  };
`;

code = code.replace(/  const handleCopyList = \(\) => \{/, replacement + "\n  const handleCopyList = () => {");

fs.writeFileSync('src/App.tsx', code);
