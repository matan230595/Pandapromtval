import React, { useState } from 'react';
import { Prompt } from '../types';
import { Terminal, Copy, Check, Code2 } from 'lucide-react';
import Prism from 'prismjs';

interface Props {
  prompt: Prompt;
}

export const IntegrationPanel: React.FC<Props> = ({ prompt }) => {
  const [copiedCode, setCopiedCode] = useState('');
  
  const snippets = {
    curl: `curl -X GET "https://api.pandaprompt.com/v1/prompts/\${prompt.id}" \\\\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    javascript: `const response = await fetch("https://api.pandaprompt.com/v1/prompts/\${prompt.id}", {
  headers: { "Authorization": "Bearer YOUR_API_KEY" }
});
const data = await response.json();
console.log(data.content); // \${prompt.title}`,
    python: `import requests

url = "https://api.pandaprompt.com/v1/prompts/\${prompt.id}"
headers = {"Authorization": "Bearer YOUR_API_KEY"}

response = requests.get(url, headers=headers)
print(response.json()["content"])`
  };

  const [activeLang, setActiveLang] = useState<keyof typeof snippets>('javascript');

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111]">
      <div className="p-4 border-b border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <Code2 className="w-4 h-4 text-rose-500" /> Prompt-as-a-Service (API)
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-rose-50 dark:bg-rose-900/10 text-rose-800 dark:text-rose-300 p-4 rounded-xl text-sm border border-rose-100 dark:border-rose-900/30">
          <strong>משוך לפרודקשן:</strong> השתמש ב-API שלנו כדי למשוך את הגרסה המעודכנת ביותר של הפרומפט ישירות לקוד שלך. אין צורך לשכפל טקסטים קשיחים.
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3 border-b border-slate-200 dark:border-white/10 pb-2">
            {(Object.keys(snippets) as Array<keyof typeof snippets>).map(lang => (
              <button 
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors \${activeLang === lang ? 'bg-slate-800 text-white dark:bg-white dark:text-black' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
              >
                {lang}
              </button>
            ))}
          </div>
          
          <div className="relative group">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto" dir="ltr">
              <code>{snippets[activeLang]}</code>
            </pre>
            <button 
              onClick={() => handleCopy(snippets[activeLang])}
              className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
            >
              {copiedCode === snippets[activeLang] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">משתנים דינמיים בפרומפט:</h4>
          <div className="flex flex-wrap gap-2">
            {prompt.content.match(/\\$\\([^)]+\\)/g)?.map((v, i) => (
              <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-mono rounded-md border border-slate-200 dark:border-white/10" dir="ltr">
                {v}
              </span>
            )) || <span className="text-xs text-slate-400">לא נמצאו משתנים.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
