const fs = require('fs');

const appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const sidebarStart = appTsx.indexOf('{/* Sidebar */}');
const sidebarEnd = appTsx.indexOf('{/* Mobile Header */}');

if (sidebarStart !== -1 && sidebarEnd !== -1) {
  let sidebarJSX = appTsx.substring(sidebarStart + '{/* Sidebar */}'.length, sidebarEnd);
  
  // Create AppSidebar.tsx
  const component = `
import * as React from 'react';
import { Bot, X, Download, Wand2, Check, HelpCircle, Sun, Moon, Monitor, Activity, Plus, LayoutGrid, Users, History, FileText, FileCode, Search, Sparkles, Filter, ArrowDownAZ, Clock, Folder as FolderIcon, LayoutTemplate, GitMerge, BarChart2, AlignLeft, Heart } from 'lucide-react';
import { SyncStatus } from '../SyncStatus';
import { Folder } from '../../types';

export interface AppSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (b: boolean) => void;
  isFullscreen: boolean;
  t: (key: string) => string;
  setShowImportModal: (b: boolean) => void;
  handleBulkAutoTagUntagged: () => void;
  setIsGeneratorOpen: (b: boolean) => void;
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
  handleDragOver: (e: any, id: string) => void;
  handleDragLeave: () => void;
  handleDropToFolder: (e: any, id: string) => void;
  dragOverFolderId: string | null;
  handleExportCSV: () => void;
  handleExportMarkdown: () => void;
  handleExportAll: () => void;
  lastSyncTime: any;
  setIsSettingsModalOpen: (b: boolean) => void;
  user: any;
  logout: () => void;
  setIsAuthModalOpen: (b: boolean) => void;
}

export function AppSidebar({
  isMobileMenuOpen, setIsMobileMenuOpen, isFullscreen, t, setShowImportModal, handleBulkAutoTagUntagged,
  setIsGeneratorOpen, setIsRtlTestsOpen, setIsShortcutsOpen, cycleTheme, themeMode, setEditingPrompt,
  setIsEditing, setSelectedPromptId, currentView, setCurrentView, selectedFolder, setSelectedFolder,
  setIsFilterRulesModalOpen, folderSortOrder, setFolderSortOrder, setIsNewFolderModalOpen, sortedFolders,
  handleDragOver, handleDragLeave, handleDropToFolder, dragOverFolderId, handleExportCSV, handleExportMarkdown,
  handleExportAll, lastSyncTime, setIsSettingsModalOpen, user, logout, setIsAuthModalOpen
}: AppSidebarProps) {
  return (
    <>
      ${sidebarJSX}
    </>
  );
}
  `;
  
  fs.mkdirSync('src/components/layout', { recursive: true });
  fs.writeFileSync('src/components/layout/AppSidebar.tsx', component);
  
  // Patch App.tsx
  const replacement = `
    <AppSidebar 
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      isFullscreen={isFullscreen}
      t={t}
      setShowImportModal={setShowImportModal}
      handleBulkAutoTagUntagged={handleBulkAutoTagUntagged}
      setIsGeneratorOpen={setIsGeneratorOpen}
      setIsRtlTestsOpen={setIsRtlTestsOpen}
      setIsShortcutsOpen={setIsShortcutsOpen}
      cycleTheme={cycleTheme}
      themeMode={themeMode}
      setEditingPrompt={setEditingPrompt}
      setIsEditing={setIsEditing}
      setSelectedPromptId={setSelectedPromptId}
      currentView={currentView}
      setCurrentView={setCurrentView}
      selectedFolder={selectedFolder}
      setSelectedFolder={setSelectedFolder}
      setIsFilterRulesModalOpen={setIsFilterRulesModalOpen}
      folderSortOrder={folderSortOrder}
      setFolderSortOrder={setFolderSortOrder}
      setIsNewFolderModalOpen={setIsNewFolderModalOpen}
      sortedFolders={sortedFolders}
      handleDragOver={handleDragOver}
      handleDragLeave={handleDragLeave}
      handleDropToFolder={handleDropToFolder}
      dragOverFolderId={dragOverFolderId}
      handleExportCSV={handleExportCSV}
      handleExportMarkdown={handleExportMarkdown}
      handleExportAll={handleExportAll}
      lastSyncTime={lastSyncTime}
      setIsSettingsModalOpen={setIsSettingsModalOpen}
      user={user}
      logout={logout}
      setIsAuthModalOpen={setIsAuthModalOpen}
    />
  `;
  const newAppTsx = appTsx.substring(0, sidebarStart) + '{/* Sidebar */}' + replacement + appTsx.substring(sidebarEnd);
  
  const withImport = newAppTsx.replace(
    'import { PromptEditor } from "./components/PromptEditor";',
    'import { PromptEditor } from "./components/PromptEditor";\nimport { AppSidebar } from "./components/layout/AppSidebar";'
  );
  
  fs.writeFileSync('src/App.tsx', withImport);
  console.log("Sidebar extracted and App.tsx patched!");
} else {
  console.log("Could not find boundaries");
}
