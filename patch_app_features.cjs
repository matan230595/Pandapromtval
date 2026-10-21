const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Icons
code = code.replace(
  'Clipboard, Link2}',
  'Clipboard, Link2, Mic, Bell, CalendarClock, Link, Save, RotateCcw, Share, XCircle}'
);

// 2. Add App States & useEffects for Draft, Sharing, Voice, Reminders
const stateInjection = `
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState<Partial<Prompt> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sharedPrompt, setSharedPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    // Check URL for shared prompt
    const params = new URLSearchParams(window.location.search);
    const sharedB64 = params.get('shared_prompt_b64');
    if (sharedB64) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedB64))));
        setSharedPrompt(decoded);
      } catch(e) {
        console.error('Failed to parse shared prompt');
      }
    }

    // Check LocalStorage for Draft
    const savedDraft = localStorage.getItem('prompt_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setDraftData(parsed);
        setShowDraftModal(true);
      } catch(e){}
    }

    // Request Notification Permission
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  // Reminders check loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      prompts.forEach(p => {
        if (p.dueDate) {
          const due = new Date(p.dueDate);
          // If within the last minute
          if (Math.abs(now.getTime() - due.getTime()) < 60000) {
            if (Notification.permission === "granted") {
              new Notification("תזכורת לפרומפט!", { body: p.title });
            }
          }
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [prompts]);

  // Draft Auto-save
  useEffect(() => {
    if (isEditing && editingPrompt && Object.keys(editingPrompt).length > 0) {
      localStorage.setItem('prompt_draft', JSON.stringify(editingPrompt));
    } else {
      localStorage.removeItem('prompt_draft');
    }
  }, [editingPrompt, isEditing]);

  const handleShareLink = (p: Prompt) => {
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(p))));
    const link = window.location.origin + window.location.pathname + '?shared_prompt_b64=' + b64;
    navigator.clipboard.writeText(link);
    showToast("קישור השיתוף הועתק ללוח", "success");
  };

  const startDictation = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("הדפדפן שלך לא תומך בהכתבה קולית", "error");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'he-IL';
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setEditingPrompt(prev => ({ ...prev, content: (prev?.content || '') + ' ' + transcript }));
    };
    recognition.onerror = () => {
      setIsRecording(false);
      showToast("שגיאה בזיהוי קול", "error");
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };
`;

code = code.replace(
  'const [isEditing, setIsEditing] = useState(false);',
  'const [isEditing, setIsEditing] = useState(false);\n' + stateInjection
);

// 3. Inject Draft Modal (Place before NewFolderModal or similar)
const draftModalJSX = `
      {/* Draft Modal */}
      <AnimatePresence>
        {showDraftModal && draftData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#111] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-white/10"
              dir="rtl"
            >
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Save className="w-5 h-5 text-indigo-500" /> שחזור טיוטה</h3>
              <p className="text-sm text-slate-500 mb-6">מצאנו טיוטה שלא נשמרה. האם תרצה לשחזר אותה או למחוק?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    localStorage.removeItem('prompt_draft');
                    setShowDraftModal(false);
                    setDraftData(null);
                  }}
                  className="px-4 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-bold text-sm"
                >
                  מחק טיוטה
                </button>
                <button
                  onClick={() => {
                    setEditingPrompt(draftData);
                    setIsEditing(true);
                    setSelectedPromptId(null);
                    setShowDraftModal(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors font-bold text-sm shadow-md"
                >
                  שחזר
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;
code = code.replace('<NewFolderModal', draftModalJSX + '\n      <NewFolderModal');


// 4. Shared View Modal
const sharedModalJSX = `
      {/* Shared Prompt View */}
      <AnimatePresence>
        {sharedPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#111] rounded-3xl flex flex-col w-full max-w-2xl h-[80vh] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
              dir="rtl"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-indigo-50/50 dark:bg-indigo-900/10">
                <h3 className="text-xl font-bold flex items-center gap-2"><Share2 className="w-5 h-5 text-indigo-500" /> פרומפט ששותף איתך</h3>
                <button onClick={() => { setSharedPrompt(null); window.history.replaceState(null, '', window.location.pathname); }} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"><XCircle className="w-6 h-6" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <h1 className="text-2xl font-black mb-4">{sharedPrompt.title}</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{sharedPrompt.description}</p>
                <div className="bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-4 rounded-2xl whitespace-pre-wrap font-mono text-sm" dir="auto">
                  {sharedPrompt.content}
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 dark:border-white/10 flex justify-end">
                <button onClick={() => { setEditingPrompt(sharedPrompt); setIsEditing(true); setSharedPrompt(null); window.history.replaceState(null, '', window.location.pathname); }} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all">שמור אצלי</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;
code = code.replace('<NewFolderModal', sharedModalJSX + '\n      <NewFolderModal');

// 5. Add Voice Dictation Button to Editor
code = code.replace(
  '<label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">תוכן הפרומפט *</label>',
  `<div className="flex items-center justify-between mb-2">
     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">תוכן הפרומפט *</label>
     <button type="button" onClick={startDictation} className={\`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold \${isRecording ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'}\`}>
       <Mic className="w-3.5 h-3.5" /> {isRecording ? 'מקליט...' : 'הכתבה קולית'}
     </button>
   </div>`
);

// 6. Add Share & Reminder buttons to selected prompt view
const topBarButtons = `
                         <button onClick={() => handleShareLink(selectedPrompt)} className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-500 rounded-xl transition-colors" title="שתף כקישור ציבורי">
                            <Link className="w-5 h-5" />
                         </button>
                         <button onClick={() => {
                            const date = prompt("הזן תאריך לתזכורת (YYYY-MM-DDTHH:mm):");
                            if(date) {
                              handleSave({...selectedPrompt, dueDate: date});
                              showToast("תזכורת נשמרה", "success");
                            }
                         }} className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-500 rounded-xl transition-colors" title="הגדר תזכורת">
                            <CalendarClock className="w-5 h-5" />
                         </button>
`;

code = code.replace(
  '                         <button onClick={() => handleDuplicate(selectedPrompt)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 rounded-xl transition-colors" title="שכפל">',
  topBarButtons + '\n                         <button onClick={() => handleDuplicate(selectedPrompt)} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 rounded-xl transition-colors" title="שכפל">'
);

fs.writeFileSync('src/App.tsx', code);
