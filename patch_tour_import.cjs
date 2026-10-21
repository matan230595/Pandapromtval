const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('SmartImportModal')) {
  code = code.replace(
    "import { CollectionAssistant } from './components/CollectionAssistant';",
    "import { CollectionAssistant } from './components/CollectionAssistant';\nimport { SmartImportModal } from './components/SmartImportModal';\nimport Joyride, { CallBackProps, STATUS } from 'react-joyride';"
  );
}

// Add state for Import Modal and Tour
const extraStates = `
  const [showImportModal, setShowImportModal] = useState(false);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('promptvault_tour_seen')) {
      setRunTour(true);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRunTour(false);
      localStorage.setItem('promptvault_tour_seen', 'true');
    }
  };

  const tourSteps = [
    {
      target: '.tour-new-prompt',
      content: 'ברוך הבא! כאן תוכל ליצור פרומפטים חדשים או להשתמש באשף ה-AI שלנו.',
      disableBeacon: true,
    },
    {
      target: '.tour-folders',
      content: 'נהל את כל הפרומפטים שלך בתיקיות מסודרות לגישה מהירה.',
    },
    {
      target: '.tour-search',
      content: 'השתמש בשורת החיפוש כדי לאתר פרומפטים לפי שם, תוכן או חיפוש סמנטי (AI).',
    },
    {
      target: '.tour-smart-import',
      content: 'חדש! ייבא פרומפטים אוטומטית מקישורים או מקובצי PDF באמצעות ייבוא חכם.',
    }
  ];
`;

code = code.replace(
  '  const [suggestedFolder, setSuggestedFolder] = useState<{id: string, name: string} | null>(null);',
  '  const [suggestedFolder, setSuggestedFolder] = useState<{id: string, name: string} | null>(null);\n' + extraStates
);

// Add Joyride component
const joyrideRender = `
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#4f46e5',
            zIndex: 10000,
          },
          tooltipContainer: { textAlign: 'right' }
        }}
        locale={{ last: 'סיום', next: 'הבא', skip: 'דלג', back: 'חזור' }}
      />
`;
code = code.replace(
  'return (\n    <motion.div',
  'return (\n    <motion.div' + joyrideRender
);

// Add smart import button and modals to UI
const smartImportBtn = `
                <button onClick={() => setShowImportModal(true)} className="tour-smart-import p-2 text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-xl transition-colors hidden md:flex items-center gap-1" title="ייבוא חכם">
                  <Download className="w-4 h-4" />
                </button>
`;

code = code.replace(
  '<button onClick={handleBulkAutoTagUntagged} className="p-2 text-indigo-500',
  smartImportBtn + '\n                <button onClick={handleBulkAutoTagUntagged} className="p-2 text-indigo-500'
);

const renderImportModal = `
      {showImportModal && (
        <SmartImportModal 
          onClose={() => setShowImportModal(false)}
          onImport={(imported) => {
            const newPrompts = imported.map(p => ({
              id: crypto.randomUUID(),
              title: p.title || 'ללא שם',
              content: p.content || '',
              tags: p.tags || [],
              useCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              version: 1,
              history: [],
              isPublic: false
            })) as Prompt[];
            setPrompts([...prompts, ...newPrompts]);
            setShowImportModal(false);
          }}
        />
      )}
`;

code = code.replace(
  '<CollectionAssistant prompts={prompts} folders={folders} onSelectPrompt={setSelectedPromptId} />',
  '<CollectionAssistant prompts={prompts} folders={folders} onSelectPrompt={setSelectedPromptId} />\n      ' + renderImportModal
);

// Add classes to targets
code = code.replace(
  'className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all group"',
  'className="tour-new-prompt flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all group"'
);
code = code.replace(
  '<div className="w-64 bg-slate-50 dark:bg-[#0a0a0a] border-l border-slate-200 dark:border-white/10 hidden lg:flex flex-col h-full">',
  '<div className="tour-folders w-64 bg-slate-50 dark:bg-[#0a0a0a] border-l border-slate-200 dark:border-white/10 hidden lg:flex flex-col h-full">'
);
code = code.replace(
  '<div className="flex-1 max-w-xl relative">',
  '<div className="tour-search flex-1 max-w-xl relative">'
);

if (!code.includes('Download,')) {
  code = code.replace('Calendar, Bot, BarChart2', 'Calendar, Bot, BarChart2, Download');
}

fs.writeFileSync('src/App.tsx', code);
