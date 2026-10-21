import React, { useState } from 'react';
import { Prompt } from '../types';
import { Download, Sparkles, Tag, Bot } from 'lucide-react';

const MOCK_COMMUNITY_TEMPLATES: Prompt[] = [
  {
    id: 'comm-1',
    title: 'SEO Article Writer',
    content: 'Write a comprehensive SEO-optimized article about $(TOPIC). The target audience is $(AUDIENCE). Tone should be $(TONE). Make sure to include H2 and H3 tags, and use LSI keywords related to $(TOPIC).',
    folder: 'community',
    tags: ['SEO', 'Marketing', 'Writing'],
    platform: 'ChatGPT',
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    useCount: 1540,
    language: 'en',
    projectId: null,
    isReadOnly: true
  },
  {
    id: 'comm-2',
    title: 'React Component Generator',
    content: 'Generate a functional React component using TypeScript and Tailwind CSS based on this description: $(DESCRIPTION). Include proper prop typing and inline comments.',
    folder: 'community',
    tags: ['Coding', 'React', 'Frontend'],
    platform: 'Claude',
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    useCount: 2310,
    language: 'en',
    projectId: null,
    isReadOnly: true
  },
  {
    id: 'comm-3',
    title: 'Academic Peer Reviewer',
    content: 'Act as an expert academic reviewer. Review the following text for clarity, argument structure, and academic tone. Text: $(TEXT)',
    folder: 'community',
    tags: ['Academic', 'Review', 'Writing'],
    platform: 'Gemini',
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    useCount: 890,
    language: 'en',
    projectId: null,
    isReadOnly: true
  }
];

interface Props {
  onImport: (prompt: Partial<Prompt>) => void;
}

export const CommunityTemplates: React.FC<Props> = ({ onImport }) => {
  const [importedIds, setImportedIds] = useState<string[]>([]);

  const handleImport = (template: Prompt) => {
    setImportedIds(prev => [...prev, template.id]);
    // Create a new prompt based on the template
    const newPrompt = {
      ...template,
      id: Date.now().toString(),
      folder: 'all', // or some default folder
      useCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isReadOnly: false
    };
    onImport(newPrompt);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {MOCK_COMMUNITY_TEMPLATES.map(t => (
        <div key={t.id} className="bg-white dark:bg-[#111] border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 flex flex-col hover:shadow-lg transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-4 relative">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{t.title}</h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-1 relative" dir="auto">
            {t.content}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6 relative">
            {t.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md font-medium">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10 relative">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
              <Download className="w-3.5 h-3.5" />
              {t.useCount.toLocaleString()} התקנות
            </div>
            
            <button
              onClick={() => handleImport(t)}
              disabled={importedIds.includes(t.id)}
              className="px-4 py-2 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 dark:text-black text-white rounded-xl text-sm font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {importedIds.includes(t.id) ? (
                'הותקן ✓'
              ) : (
                <>התקן תבנית</>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
