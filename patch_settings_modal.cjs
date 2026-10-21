const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<MoveFolderModal[\s\S]*?\/>/;
const replacement = `$&

      <AnimatePresence>
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSettingsModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#111] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-500" />
                  {t('settings.title')}
                </h3>
                <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t('settings.language')}</label>
                  <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                    <button onClick={() => setAppLanguage('he')} className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-colors \${appLanguage === 'he' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}\`}>{t('settings.language.he')}</button>
                    <button onClick={() => setAppLanguage('en')} className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-colors \${appLanguage === 'en' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}\`}>{t('settings.language.en')}</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t('settings.theme')}</label>
                  <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                    <button onClick={() => setThemeMode('light')} className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-colors \${themeMode === 'light' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}\`}>{t('settings.theme.light')}</button>
                    <button onClick={() => setThemeMode('dark')} className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-colors \${themeMode === 'dark' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}\`}>{t('settings.theme.dark')}</button>
                    <button onClick={() => setThemeMode('system')} className={\`flex-1 py-2 text-sm font-bold rounded-lg transition-colors \${themeMode === 'system' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}\`}>{t('settings.theme.system')}</button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={() => setIsSettingsModalOpen(false)} className="px-6 py-2 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 dark:text-black text-white rounded-xl font-bold transition-colors">
                  {t('settings.close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
