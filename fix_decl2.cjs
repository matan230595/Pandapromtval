const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const stateInj = `
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState<Partial<Prompt> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sharedPrompt, setSharedPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedB64 = params.get('shared_prompt_b64');
    if (sharedB64) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedB64))));
        setSharedPrompt(decoded);
      } catch(e) {}
    }
    const savedDraft = localStorage.getItem('prompt_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setDraftData(parsed);
        setShowDraftModal(true);
      } catch(e){}
    }
    if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      prompts.forEach(p => {
        if (p.dueDate) {
          const due = new Date(p.dueDate);
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
      setEditingPrompt((prev: any) => ({ ...prev, content: (prev?.content || '') + ' ' + transcript }));
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
  'const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt> | null>(null);',
  'const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt> | null>(null);\n' + stateInj
);

fs.writeFileSync('src/App.tsx', code);
