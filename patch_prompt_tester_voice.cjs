const fs = require('fs');
let code = fs.readFileSync('src/components/PromptTester.tsx', 'utf8');

const logic = `
  const [isRecording, setIsRecording] = useState(false);
  const handleVoiceRecord = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("הדפדפן שלך אינו תומך בהכתבה קולית.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'he-IL';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + " " + transcript : transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };
`;

code = code.replace(
  "const [showVarsModal, setShowVarsModal] = useState(false);",
  "const [showVarsModal, setShowVarsModal] = useState(false);\n" + logic
);

if (!code.includes('import { Send, Bot, User, Loader2, Play, SplitSquareHorizontal, Scale, Link2, Mic }')) {
  code = code.replace(
    "import { Send, Bot, User, Loader2, Play, SplitSquareHorizontal, Scale, Link2 } from 'lucide-react';",
    "import { Send, Bot, User, Loader2, Play, SplitSquareHorizontal, Scale, Link2, Mic } from 'lucide-react';"
  );
}

const inputSection = `
          <div className="p-3 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex gap-2 shrink-0 items-center">
            <button
              onClick={handleVoiceRecord}
              title="הכתבה קולית"
              className={\`p-2 rounded-xl transition-colors shrink-0 \${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 dark:bg-white/10 text-slate-500 hover:text-indigo-600'}\`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <input 
              type="text" 
              value={input}
`;

code = code.replace(
  '<div className="p-3 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex gap-2 shrink-0">\n            <input \n              type="text" \n              value={input}',
  inputSection
);

fs.writeFileSync('src/components/PromptTester.tsx', code);
