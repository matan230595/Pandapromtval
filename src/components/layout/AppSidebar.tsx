import * as React from 'react';
import { 
  Bot, X, Download, Wand2, Check, HelpCircle, Sun, Moon, Monitor, 
  Activity, Plus, Users, FileText, FileCode, Sparkles, Filter, 
  ArrowDownAZ, Clock, Folder as FolderIcon, LayoutTemplate, 
  User as UserIcon, FolderOpen, Command, Settings, GitMerge, 
  BarChart2, AlignLeft, Heart, Hash, MoreHorizontal, LogOut, LogIn,
  Trophy, ArrowUpRight, Bell, Layers, Compass
} from 'lucide-react';
import { SyncStatus } from '../SyncStatus';
import { BatteryIndicator } from './BatteryIndicator';
import { BatteryStatus } from '../../hooks/useBatteryStatus';
import { Folder, Prompt, Category } from '../../types';
import { PWAInstallPrompt } from '../PWAInstallPrompt';
import { SidebarCommunitySection } from '../SidebarCommunitySection';
import { Language } from '../../i18n';

export interface AppSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (b: boolean) => void;
  isFullscreen: boolean;
  t: (key: string) => string;
  appLanguage?: Language;
  setAppLanguage?: (lang: Language) => void;
  setShowImportModal: (b: boolean) => void;
  handleBulkAutoTagUntagged: () => void;
  setIsGeneratorOpen: (b: boolean) => void;
  setIsBulkOrganizerOpen?: (b: boolean) => void;
  setIsMetaPromptOpen?: (b: boolean) => void;
  setIsRtlTestsOpen: (b: boolean) => void;
  setIsShortcutsOpen: (b: boolean) => void;
  cycleTheme: () => void;
  themeMode: string;
  setEditingPrompt: (p: any) => void;
  setIsEditing: (b: boolean) => void;
  setSelectedPromptId: (id: string | null) => void;
  currentView: string;
  setCurrentView: (view: any) => void;
  selectedFolder: string;
  setSelectedFolder: (f: string) => void;
  setIsFilterRulesModalOpen: (b: boolean) => void;
  folderSortOrder: string;
  setFolderSortOrder: (o: any) => void;
  setIsNewFolderModalOpen: (b: boolean) => void;
  sortedFolders: Folder[];
  prompts?: Prompt[];
  isSmartGrouping?: boolean;
  setIsSmartGrouping?: (b: boolean) => void;
  handleDragOver: (e: any, id: string) => void;
  handleDragLeave: (e: any) => void;
  handleDropToFolder: (e: any, id: string) => void;
  dragOverFolderId: string | null;
  handleExportCSV: () => void;
  handleExportMarkdown: () => void;
  handleExportAll: () => void;
  lastSyncTime: any;
  syncStatus?: 'idle' | 'syncing' | 'saved' | 'error' | 'offline';
  onManualSync?: () => void | Promise<void>;
  setIsSettingsModalOpen: (b: boolean) => void;
  user: any;
  logout: () => void;
  setIsAuthModalOpen: (b: boolean) => void;
  showToast?: (message: string, type: string) => void;
  onOpenScoreModal?: () => void;
  scorePoints?: number;
  levelTitle?: string;
  battery?: BatteryStatus;
  categories?: Category[];
  selectedCategory?: string | null;
  onSelectCategory?: (catId: string | null) => void;
  onOpenManageCategories?: () => void;
  onOpenRemindersModal?: () => void;
  remindersCount?: number;
  overdueRemindersCount?: number;
  onOpenEnterpriseSuite?: () => void;
  onOpenOnboarding?: () => void;
}

export function AppSidebar({
  isMobileMenuOpen, setIsMobileMenuOpen, isFullscreen, t, appLanguage, setAppLanguage, setShowImportModal, handleBulkAutoTagUntagged,
  setIsGeneratorOpen, setIsBulkOrganizerOpen, setIsMetaPromptOpen, setIsRtlTestsOpen, setIsShortcutsOpen, cycleTheme, themeMode, setEditingPrompt,
  setIsEditing, setSelectedPromptId, currentView, setCurrentView, selectedFolder, setSelectedFolder,
  setIsFilterRulesModalOpen, folderSortOrder, setFolderSortOrder, setIsNewFolderModalOpen, sortedFolders,
  prompts, isSmartGrouping = false, setIsSmartGrouping,
  handleDragOver, handleDragLeave, handleDropToFolder, dragOverFolderId, handleExportCSV, handleExportMarkdown,
  handleExportAll, lastSyncTime, syncStatus, onManualSync, setIsSettingsModalOpen, user, logout, setIsAuthModalOpen,
  showToast, onOpenScoreModal, scorePoints = 0, levelTitle, battery,
  categories = [], selectedCategory = null, onSelectCategory, onOpenManageCategories,
  onOpenRemindersModal, remindersCount = 0, overdueRemindersCount = 0, onOpenEnterpriseSuite,
  onOpenOnboarding
}: AppSidebarProps) {
  const [showToolsMenu, setShowToolsMenu] = React.useState(false);

  const smartTagGroups = React.useMemo(() => {
    if (!prompts) return [];
    const map: Record<string, { count: number; tag: string }> = {};
    prompts.forEach(p => {
      const primaryTag = (p.tags && p.tags.length > 0 && p.tags[0].trim()) ? p.tags[0].trim() : 'ללא תגית';
      if (!map[primaryTag]) {
        map[primaryTag] = { count: 0, tag: primaryTag };
      }
      map[primaryTag].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [prompts]);

  return (
    <>
      <div className={`${isMobileMenuOpen ? "flex fixed inset-y-0 right-0 z-50 w-72" : "hidden md:flex w-64"} ${isFullscreen ? "!hidden" : ""} flex-col border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] md:bg-white/80 md:dark:bg-[#111111]/80 md:backdrop-blur-xl shrink-0 transition-transform duration-300 select-none`}>
        
        {/* Simplified, Clean Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-extrabold tracking-tight text-base text-slate-900 dark:text-white">
              {t('app.title')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Mobile close button */}
            {isMobileMenuOpen && (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                title="סגור תפריט"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}

            {/* Language Switcher */}
            {setAppLanguage && (
              <button 
                type="button"
                onClick={() => setAppLanguage(appLanguage === 'he' ? 'en' : 'he')}
                className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                title={appLanguage === 'he' ? 'Switch to English (LTR)' : 'החלף לעברית (RTL)'}
              >
                {appLanguage === 'he' ? 'EN' : 'עב'}
              </button>
            )}

            {/* Theme Toggle */}
            <button 
              onClick={cycleTheme} 
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" 
              title={`Theme: ${themeMode}`}
            >
              {themeMode === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : themeMode === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Monitor className="w-4 h-4" />}
            </button>

            {/* Quick Tools Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className={`p-1.5 rounded-lg transition-colors ${showToolsMenu ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600' : 'text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                title={t('nav.tools')}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showToolsMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowToolsMenu(false)} />
                  <div className="absolute left-0 top-full mt-1.5 w-48 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 py-1.5 z-50 text-right text-xs">
                    <button
                      type="button"
                      onClick={() => { setShowToolsMenu(false); setShowImportModal(true); }}
                      className="w-full px-3 py-2 text-right hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{t('nav.smartImport')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowToolsMenu(false); setIsGeneratorOpen(true); }}
                      className="w-full px-3 py-2 text-right hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{t('nav.promptGenerator')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowToolsMenu(false); handleBulkAutoTagUntagged(); }}
                      className="w-full px-3 py-2 text-right hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>{t('nav.bulkAutoTag')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowToolsMenu(false); setIsRtlTestsOpen(true); }}
                      className="w-full px-3 py-2 text-right hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{t('nav.rtlReport')}</span>
                    </button>
                    {onOpenOnboarding && (
                      <button
                        type="button"
                        onClick={() => { setShowToolsMenu(false); onOpenOnboarding(); }}
                        className="w-full px-3 py-2 text-right hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold border-t border-slate-100 dark:border-white/5"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>סיור ומדריך למשתמש (Tour)</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="p-3 space-y-2 border-b border-slate-100 dark:border-white/5">
          <button 
            onClick={() => {
              setEditingPrompt({});
              setIsEditing(true);
              setSelectedPromptId(null);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" /> 
            <span>פרומפט חדש</span>
          </button>

          {/* Quick AI Shortcuts row */}
          {(setIsMetaPromptOpen || setIsBulkOrganizerOpen) && (
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              {setIsMetaPromptOpen && (
                <button
                  onClick={() => {
                    setIsMetaPromptOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/30 transition-all"
                  title="ארכיטקט פרומפטים"
                >
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>ארכיטקט</span>
                </button>
              )}

              {setIsBulkOrganizerOpen && (
                <button
                  onClick={() => {
                    setIsBulkOrganizerOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5 transition-all"
                  title="ארגון ספרייה ב-AI"
                >
                  <Wand2 className="w-3 h-3 text-indigo-500" />
                  <span>ארגון AI</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* PWA Install Banner */}
        <PWAInstallPrompt />

        {/* Score & Achievements Banner */}
        {onOpenScoreModal && (
          <div className="px-3 pt-2">
            <button
              type="button"
              onClick={onOpenScoreModal}
              className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 border border-amber-500/30 dark:border-amber-400/20 transition-all flex items-center justify-between group shadow-xs text-right"
              title="מערכת ניקוד והישגים (Score & Achievements)"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shrink-0">
                  <Trophy className="w-4.5 h-4.5 text-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <span>{scorePoints.toLocaleString()} נק'</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-100/70 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-full">
                      הישגים
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                    {levelTitle || 'יוצר מתחיל'}
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />
            </button>
          </div>
        )}

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          
          {/* Main App Navigation */}
          <div className="space-y-0.5">
            <button 
              onClick={() => { setCurrentView("dashboard"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                currentView === "dashboard" 
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold" 
                  : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Activity className="w-4 h-4 text-indigo-500" /> 
              <span>דאשבורד ראשי</span>
            </button>

            <button 
              onClick={() => { setCurrentView("library"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                currentView === "library" 
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold" 
                  : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
              }`}
            >
              <FolderOpen className="w-4 h-4 text-blue-500" /> 
              <span>{t('nav.library')}</span>
            </button>

            <button 
              onClick={() => { setCurrentView("community"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                currentView === "community" 
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold" 
                  : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-purple-500" /> 
                <span>קהילת הפרומפטים</span>
              </div>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
                שיתוף
              </span>
            </button>

            <button 
              onClick={() => { setCurrentView("insights"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                currentView === "insights" 
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold" 
                  : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
              }`}
            >
              <BarChart2 className="w-4 h-4 text-emerald-500" /> 
              <span>תובנות וסטטיסטיקות</span>
            </button>

            <button 
              onClick={() => { setCurrentView("workflows"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                currentView === "workflows" 
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold" 
                  : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
              }`}
            >
              <GitMerge className="w-4 h-4 text-purple-500" /> 
              <span>תהליכי עבודה (Workflows)</span>
            </button>

            {onOpenEnterpriseSuite && (
              <button 
                onClick={() => { onOpenEnterpriseSuite(); setIsMobileMenuOpen(false); }} 
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 transition-all mt-1"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>מרכז שדרוגים 12 (Enterprise)</span>
                </div>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600">
                  חדש
                </span>
              </button>
            )}

            <button 
              onClick={() => { setCurrentView("templates"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                currentView === "templates" 
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold" 
                  : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
              }`}
            >
              <LayoutTemplate className="w-4 h-4 text-amber-500" /> 
              <span>תבניות מוכנות</span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="space-y-0.5">
            <div className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              {t('nav.filters')}
            </div>
            
            <button 
              onClick={() => { setSelectedFolder("all"); setCurrentView("library"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedFolder === "all" && currentView === "library" 
                  ? "bg-slate-100 dark:bg-white/10 text-indigo-600 dark:text-indigo-400" 
                  : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" /> 
              <span>{t('nav.all')}</span>
            </button>

            <button 
              onClick={() => { setSelectedFolder("favorites"); setCurrentView("library"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedFolder === "favorites" && currentView === "library" 
                  ? "bg-slate-100 dark:bg-white/10 text-red-500" 
                  : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-red-400" /> 
              <span>{t('nav.favorites')}</span>
            </button>

            <button 
              onClick={() => { setSelectedFolder("recent"); setCurrentView("library"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedFolder === "recent" && currentView === "library" 
                  ? "bg-slate-100 dark:bg-white/10 text-indigo-600 dark:text-indigo-400" 
                  : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> 
              <span>בשימוש לאחרונה</span>
            </button>

            <button 
              onClick={() => { setSelectedFolder("archive"); setCurrentView("library"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedFolder === "archive" && currentView === "library" 
                  ? "bg-slate-100 dark:bg-white/10 text-indigo-600 dark:text-indigo-400" 
                  : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
              }`}
            >
              <Download className="w-3.5 h-3.5" /> 
              <span>{t('nav.archive')}</span>
            </button>
          </div>

          {/* Filter by Prompt Type */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-0.5">
            <div className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>סוגי פרומפטים</span>
              <span className="text-[9px] text-slate-400 font-mono">טקסט / תמונה / קוד</span>
            </div>
            
            <button 
              onClick={() => { setSelectedFolder("type:text"); setCurrentView("library"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedFolder === "type:text" && currentView === "library" 
                  ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" 
                  : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-500" /> 
                <span>פרומפטי טקסט (LLM)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {prompts?.filter(p => !p.type || p.type === 'text').length || 0}
              </span>
            </button>

            <button 
              onClick={() => { setSelectedFolder("type:image"); setCurrentView("library"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedFolder === "type:image" && currentView === "library" 
                  ? "bg-slate-100 dark:bg-white/10 text-purple-600 dark:text-purple-400" 
                  : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" /> 
                <span>תמונות AI</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {prompts?.filter(p => p.type === 'image').length || 0}
              </span>
            </button>

            <button 
              onClick={() => { setSelectedFolder("type:code"); setCurrentView("library"); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedFolder === "type:code" && currentView === "library" 
                  ? "bg-slate-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400" 
                  : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-emerald-500" /> 
                <span>קוד ותכנות</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {prompts?.filter(p => p.type === 'code').length || 0}
              </span>
            </button>

            {onOpenRemindersModal && (
              <button 
                onClick={() => { onOpenRemindersModal(); setIsMobileMenuOpen(false); }} 
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-500" /> 
                  <span>תזכורות משימה</span>
                </div>
                <div className="flex items-center gap-1">
                  {overdueRemindersCount > 0 && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                      {overdueRemindersCount} באיחור
                    </span>
                  )}
                  {remindersCount > 0 && overdueRemindersCount === 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {remindersCount}
                    </span>
                  )}
                </div>
              </button>
            )}
          </div>

          {/* Curated Popular Community Templates in Sidebar */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5">
            <SidebarCommunitySection 
              onOpenCommunityHub={() => {
                setSelectedFolder("community");
                setCurrentView("community");
                setIsMobileMenuOpen(false);
              }}
              showToast={showToast}
            />
          </div>

          {/* Folders & Smart Grouping */}
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-white/5">
            {/* Smart Folder: Favorites */}
            <button
              onClick={() => {
                setSelectedFolder("smart_favorites");
                setCurrentView("library");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all mb-2 ${
                selectedFolder === "smart_favorites" && currentView === "library"
                  ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-extrabold"
                  : "bg-amber-500/5 hover:bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/20"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  ★
                </span>
                <span className="truncate">תיקייה חכמה: מועדפים</span>
              </div>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 shrink-0">
                {prompts?.filter(p => p.favorite).length || 0}
              </span>
            </button>
            <div className="flex items-center justify-between px-3 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {isSmartGrouping ? 'תגיות וירטואליות' : t('nav.folders')}
                </span>
                {setIsSmartGrouping && (
                  <button
                    onClick={() => setIsSmartGrouping(!isSmartGrouping)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                      isSmartGrouping
                        ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 ring-1 ring-purple-400/40'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title="החלף בין תיקיות פיזיות לקיבוץ וירטואלי לפי תגית ראשית"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-purple-500" />
                    <span>קיבוץ חכם</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {!isSmartGrouping && (
                  <>
                    <button 
                      onClick={() => setFolderSortOrder(prev => prev === "alphabetical" ? "recent" : "alphabetical")}
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      title={folderSortOrder === "alphabetical" ? "מיין לפי אחרונים" : "מיין לפי א-ב"}
                    >
                      {folderSortOrder === "alphabetical" ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => setIsNewFolderModalOpen(true)} 
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" 
                      title="תיקייה חדשה"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {isSmartGrouping ? (
              <div className="space-y-0.5">
                {smartTagGroups.length === 0 ? (
                  <div className="text-xs text-slate-400 dark:text-slate-500 px-3 py-1.5 italic">אין תגיות עדיין</div>
                ) : (
                  smartTagGroups.map(group => {
                    const isSelected = selectedFolder === `smart-tag:${group.tag}` && currentView === "library";
                    return (
                      <button
                        key={group.tag}
                        onClick={() => {
                          setSelectedFolder(`smart-tag:${group.tag}`);
                          setCurrentView("library");
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold"
                            : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Hash className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="truncate">{group.tag}</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 shrink-0">
                          {group.count}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="space-y-0.5">
                {sortedFolders.map(f => (
                  <button 
                    key={f.id}
                    onClick={() => { setSelectedFolder(f.id); setCurrentView("library"); setIsMobileMenuOpen(false); }}
                    onDragOver={(e) => handleDragOver(e, f.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDropToFolder(e, f.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      dragOverFolderId === f.id 
                        ? "bg-indigo-100 dark:bg-indigo-900/40 ring-1 ring-indigo-500 text-indigo-700" 
                        : selectedFolder === f.id && currentView === "library" 
                        ? "bg-slate-100 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 font-bold" 
                        : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderIcon className="w-3.5 h-3.5 shrink-0" style={{ color: f.color || 'currentColor', opacity: f.color ? 1 : 0.7 }} /> 
                      <span className="truncate">{f.name}</span>
                    </div>
                    {f.sharedWith && f.sharedWith.length > 0 && <Users className="w-3 h-3 opacity-50 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Categories Section */}
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between px-3 mb-1.5">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-indigo-500" />
                <span>קטגוריות</span>
              </span>
              {onOpenManageCategories && (
                <button 
                  onClick={onOpenManageCategories} 
                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" 
                  title="ניהול קטגוריות"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-0.5">
              {categories && categories.length > 0 ? (
                categories.map(cat => {
                  const count = prompts?.filter(p => p.categories?.includes(cat.id) || p.categories?.includes(cat.name)).length || 0;
                  const isSelected = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (onSelectCategory) {
                          onSelectCategory(isSelected ? null : cat.id);
                        }
                        setCurrentView("library");
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold"
                          : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {count}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 px-3 py-1 italic">אין קטגוריות</div>
              )}
            </div>
          </div>
        </div>

        {/* Tidy Bottom Status & Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 shrink-0 space-y-2 bg-slate-50/50 dark:bg-[#0d0d0d]/50">
          {/* User Account Card */}
          {user ? (
            <div className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {user.displayName ? user.displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">
                    {user.displayName || user.email?.split('@')[0] || 'משתמש'}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>מחובר בענן</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="התנתק"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-between text-xs font-bold transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>התחברות / הרשמה</span>
              </div>
              <span className="text-[10px] bg-indigo-200/70 dark:bg-indigo-800/60 px-1.5 py-0.5 rounded-md">חינם</span>
            </button>
          )}

          {battery && <BatteryIndicator battery={battery} />}
          <SyncStatus lastSync={lastSyncTime} status={syncStatus} onManualSync={onManualSync} />
          
          <div className="grid grid-cols-3 gap-1 pt-1">
            <button 
              onClick={() => setIsSettingsModalOpen(true)} 
              className="flex items-center justify-center p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
              title={t('nav.settings')}
            >
              <Settings className="w-4 h-4" />
            </button>

            <button 
              onClick={() => setIsShortcutsOpen(true)} 
              className="flex items-center justify-center p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
              title="קיצורי מקלדת"
            >
              <Command className="w-4 h-4" />
            </button>

            <button 
              onClick={user ? () => logout() : () => setIsAuthModalOpen(true)} 
              className="flex items-center justify-center p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
              title={user ? "התנתק" : "התחבר"}
            >
              {user ? <LogOut className="w-4 h-4 text-red-500" /> : <LogIn className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
