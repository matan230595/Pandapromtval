const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const publishFunction = `
  const handlePublishToCommunity = async (prompt) => {
    if (!auth.currentUser) {
      showToast('יש להתחבר כדי לשתף פרומפטים', 'error');
      return;
    }
    
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await import('firebase/firestore').then(m => m.getDoc(userRef));
      const userData = userDoc.exists() ? userDoc.data() : null;
      const authorName = userData?.displayName || auth.currentUser.displayName || 'Anonymous';
      const authorPhoto = userData?.photoURL || auth.currentUser.photoURL || '';

      const publicPrompt = {
        id: prompt.id, // Keep the same ID so we don't duplicate on multiple publishes
        title: prompt.title,
        content: prompt.content,
        platform: prompt.platform,
        topic: prompt.topic || 'General',
        tags: prompt.tags || [],
        authorId: auth.currentUser.uid,
        authorName,
        authorPhoto,
        createdAt: new Date().toISOString(),
        likes: [],
        useCount: 0,
        commentsCount: 0
      };

      await import('firebase/firestore').then(m => m.setDoc(m.doc(db, 'public_prompts', prompt.id), publicPrompt, { merge: true }));
      showToast('הפרומפט פורסם לקהילה בהצלחה!', 'success');
    } catch (e) {
      console.error(e);
      showToast('שגיאה בפרסום הפרומפט', 'error');
    }
  };

  const handleDuplicate = (prompt: Prompt) => {`;

code = code.replace(/const handleDuplicate = \(prompt: Prompt\) => \{/, publishFunction);

const publishButton = `
                        <button title="פרסם לקהילה" onClick={() => handlePublishToCommunity(selectedPrompt)} className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-50 hover:bg-emerald-50 dark:bg-white/5 dark:hover:bg-emerald-900/20 rounded-lg flex items-center gap-1">
                          <Globe className="w-4.5 h-4.5" />
                        </button>
                        {navigator.share && (`;

code = code.replace(/\{navigator\.share && \(/, publishButton);

fs.writeFileSync('src/App.tsx', code);
