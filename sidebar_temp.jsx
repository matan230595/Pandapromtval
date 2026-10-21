{/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? "flex fixed inset-y-0 right-0 z-50 w-72" : "hidden md:flex w-64"} ${isFullscreen ? "!hidden" : ""} flex-col border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] md:bg-white/50 md:dark:bg-[#111111]/50 md:backdrop-blur-xl shrink-0 transition-transform duration-300`}>
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 flex items-center justify-center overflow-hidden shrink-0">
              <Bot className="w-full h-full text-blue-500 opacity-20" />
            </div>
            <span className="font-bold tracking-tight text-lg">{t('app.title')}</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          
                
                <button onClick={() => setShowImportModal(true)} className="tour-smart-import p-2 text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-xl transition-colors hidden md:flex items-center gap-1" title="ייבוא חכם">
                  <Download className="w-4 h-4" />
                </button>

                <button onClick={handleBulkAutoTagUntagged} className="p-2 text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-xl transition-colors hidden md:flex items-center gap-1" title="תיוג חכם לכל החסרים">
                  <Wand2 className="w-4 h-4" />
                </button>

                <button onClick={() => setIsGeneratorOpen(true)} className="p-2 text-indigo-500 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-xl transition-colors" title="אשף יצירת פרומפטים">
            <Wand2 className="w-4 h-4" />
          </button>
          
          <button onClick={() => setIsRtlTestsOpen(true)} className="p-2 text-emerald-500 hover:text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-xl transition-colors" title="דוח בדיקות RTL">
            <Check className="w-4 h-4" />
          </button>
<button onClick={() => setIsShortcutsOpen(true)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="קיצורי מקלדת">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button onClick={cycleTheme} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title={`Theme: ${themeMode}`}>
            {themeMode === 'light' ? <Sun className="w-4 h-4" /> : themeMode === 'dark' ? <Moon className="w-4 h-4" /> : themeMode === 'system' ? <Monitor className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          </button>
        </div>

        <div className="p-4">
          <button 
            onClick={() => {
              setEditingPrompt({});
              setIsEditing(true);
              setSelectedPromptId(null);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> פרומפט חדש
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="space-y-1">
            
<button onClick={() => {
 setCurrentView("profile"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentView === "profile" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <UserIcon className="w-4 h-4" /> {t('nav.profile')}
            </button>
            <button onClick={() => { setCurrentView("dashboard"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentView === "dashboard" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <Activity className="w-4 h-4" /> דאשבורד ראשי
            </button>
            <button onClick={() => { setCurrentView("library"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <FolderOpen className="w-4 h-4" /> {t('nav.library')}
            </button>
            <button onClick={() => { setCurrentView("templates"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentView === "templates" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <LayoutTemplate className="w-4 h-4" /> תבניות מוכנות
            </button>
            <button onClick={() => { setCurrentView("workflows"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentView === "workflows" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <GitMerge className="w-4 h-4" /> תהליכי עבודה (Workflows)
            </button>
            <button onClick={() => { setCurrentView("insights"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentView === "insights" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <BarChart2 className="w-4 h-4" /> {t('nav.insights')}
            </button>
          </div>

          <div className="space-y-1">
            <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t('nav.filters')}</div>
            <button onClick={() => { setSelectedFolder("all"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedFolder === "all" && currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <AlignLeft className="w-4 h-4" /> {t('nav.all')}
            </button>
                        <button onClick={() => { setSelectedFolder("recent"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedFolder === "recent" && currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <Clock className="w-4 h-4" /> בשימוש לאחרונה
            </button>
            <button onClick={() => { setSelectedFolder("favorites"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedFolder === "favorites" && currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <Heart className="w-4 h-4" /> {t('nav.favorites')}
            </button>
            <button onClick={() => { setSelectedFolder("archive"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedFolder === "archive" && currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <Download className="w-4 h-4" /> {t('nav.archive')}
            </button>

          </div>

          
          <div className="space-y-1">
            <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t('nav.communityAndTools')}</div>
            <button onClick={() => { setSelectedFolder("community"); setCurrentView("community"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentView === "community" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <Sparkles className="w-4 h-4" /> {t('nav.community')}
            </button>
            <button onClick={() => { setIsFilterRulesModalOpen(true); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400`}>
              <Filter className="w-4 h-4" /> כללי אוטומציה
            </button>
          </div>

<div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('nav.folders')}</div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setFolderSortOrder(prev => prev === "alphabetical" ? "recent" : "alphabetical")}
                  className="text-slate-400 hover:text-blue-500 transition-colors"
                  title={folderSortOrder === "alphabetical" ? "מיין לפי אחרונים" : "מיין לפי א-ב"}
                >
                  {folderSortOrder === "alphabetical" ? <ArrowDownAZ className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsNewFolderModalOpen(true)} className="text-slate-400 hover:text-blue-500 transition-colors" title="תיקייה חדשה">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            {sortedFolders.map(f => (
              
              <button 
                key={f.id}
                onClick={() => { setSelectedFolder(f.id); setCurrentView("library"); setIsMobileMenuOpen(false); }}
                onDragOver={(e) => handleDragOver(e, f.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropToFolder(e, f.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${dragOverFolderId === f.id ? "bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500 text-blue-700 dark:text-blue-300 shadow-sm" : selectedFolder === f.id && currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}
              >
                <div className="flex items-center gap-3">
                  <FolderIcon className="w-4 h-4 shrink-0" style={{ color: f.color || 'currentColor', opacity: f.color ? 1 : 0.7 }} /> 
                  <span className="truncate">{f.name}</span>
                </div>
                {f.sharedWith && f.sharedWith.length > 0 && <Users className="w-3.5 h-3.5 opacity-50 shrink-0" />}
              </button>

            ))}
          </div>

          <div className="space-y-1">
            <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-6">{t('nav.backup')}</div>
            <button onClick={handleExportCSV} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400">
              <Download className="w-4 h-4" /> {t('nav.exportCSV')}
            </button>
            
            <button onClick={handleExportMarkdown} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400">
              <FileText className="w-4 h-4" /> ייצוא כ-Markdown
            </button>
            <button onClick={handleExportAll} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400">
              <FileCode className="w-4 h-4" /> {t('nav.exportJSON')}
            </button>
          </div>

        </div>
        <div className="p-4 border-t border-slate-200 dark:border-white/10 shrink-0">
          <SyncStatus lastSync={lastSyncTime} />
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-white/10">
          <button onClick={() => setIsShortcutsOpen(true)} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 py-2.5 rounded-xl font-medium transition-colors text-sm mb-2">
            <Command className="w-4 h-4" /> קיצורי מקלדת
          </button>
          <button onClick={() => setIsSettingsModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 py-2.5 rounded-xl font-medium transition-colors text-sm mb-2">
            <Settings className="w-4 h-4" /> {t('nav.settings')}
          </button>
          <button onClick={user ? () => logout() : () => setIsAuthModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 py-2.5 rounded-xl font-medium transition-colors text-sm">
             {user ? "התנתק" : "התחבר לסנכרון"}
          </button>
        </div>
      </div>
      
      