import { apiFetch } from './utils/api';
import React, { useState, useEffect, useMemo, useRef } from "react";
import { BookOpen, Cloud, CloudOff, 
  FileCode, Calendar, FileDown, Lock, Unlock, Tag,
  Plus, Search, Folder as FolderIcon, FolderOpen, Heart, Activity, 
  Settings, Sun, Moon, ChevronRight, Copy, Check, Share2, CopyPlus, 
  Trash2, FolderDown, Edit3, Download, Play, MessageSquare, History, AlignLeft, ArrowDownAZ, Clock, FileText,
  Smartphone, Monitor, ChevronLeft, Sparkles, X, Menu, Command, Wand2, Loader2, HelpCircle, Maximize2, Minimize2, BarChart2, Printer, Star, Terminal
, Shield, AlertTriangle, Filter, Bot, User as UserIcon, Code2, Beaker, Globe, LayoutGrid, List, Kanban, Clipboard, Link2, Mic, Bell, CalendarClock, Link, Save, RotateCcw, Share, XCircle, LayoutTemplate, GitMerge, Users, ChevronDown, Mail, Camera, Tags, QrCode, SlidersHorizontal, Trophy, Volume2, VolumeX, Database, FolderUp, MoreHorizontal, Layers, Zap, Bookmark } from "lucide-react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { differenceInDays } from "date-fns";
import { db, auth, loginWithGoogle, logout } from "./firebase";
import { collection, doc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { Language, getTranslation } from "./i18n";
import { useBatteryStatus } from "./hooks/useBatteryStatus";

import { Prompt, Folder, PlatformConfig, ChatMessage, Project, PromptVersion, AutomationRule } from "./types";

import { UserProfileView } from "./components/UserProfileView";
import { FilterRulesModal } from "./components/FilterRulesModal";
import { TagCombobox } from "./components/TagCombobox";
import { PromptTester } from "./components/PromptTester";
import { PromptEditor } from "./components/PromptEditor";
import { AppSidebar } from "./components/layout/AppSidebar";
import { MobileBottomNav } from "./components/layout/MobileBottomNav";
import { MobileFilterSheet } from "./components/layout/MobileFilterSheet";
import { MobileDetailActionSheet } from "./components/layout/MobileDetailActionSheet";
import { Toast, ToastType } from "./components/Toast";
import { CommandPalette } from "./components/CommandPalette";
import { SmartVariablesModal } from "./components/SmartVariablesModal";
import { Joyride, STATUS } from "react-joyride";
import { ReadabilityScore } from "./components/ReadabilityScore";
import { CollectionAssistant } from "./components/CollectionAssistant";
import { SmartImportModal } from "./components/SmartImportModal";
import { MoveFolderModal } from "./components/MoveFolderModal";
import { NewFolderModal } from "./components/NewFolderModal";
import { PromptCardExportModal } from "./components/PromptCardExportModal";
import { FormattedPromptView } from "./components/FormattedPromptView";
import { ScoreAchievementsModal } from "./components/ScoreAchievementsModal";
import { getScoreState, recordScoreAction, ScoreState } from "./utils/scoreSystem";

import { updateDoc } from "firebase/firestore";
import { getTagColor } from "./utils/colors";
import { FloatingActionBar } from "./components/FloatingActionBar";
import { DiffViewer } from "./components/DiffViewer";
import { usePromptStore } from "./store/promptStore";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { BulkOrganizerModal } from "./components/BulkOrganizerModal";
import { MetaPromptModal } from "./components/MetaPromptModal";



import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { AuthModal } from "./components/AuthModal";
import { Category, PromptReminder } from "./types";
import { loadCategories, saveCategories } from "./utils/categories";
import { ManageCategoriesModal } from "./components/ManageCategoriesModal";
import { AdvancedSearchModal } from "./components/AdvancedSearchModal";
import { QuickReminderModal } from "./components/QuickReminderModal";
import { RemindersModal } from "./components/RemindersModal";
import { SpeedReadingModal } from "./components/SpeedReadingModal";
import { PromptBookmarks } from "./components/PromptBookmarks";
import { playReminderChime } from "./utils/notificationSound";

import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';
import html2pdf from 'html2pdf.js';

import { ShortcutsModal } from "./components/ShortcutsModal";
import { SettingsModal } from "./components/SettingsModal";
import { EnterpriseSuiteModal } from "./components/EnterpriseSuiteModal";
import { DeepAiDiagnosticSuite } from "./components/DeepAiDiagnosticSuite";
import { PromptChainBuilderModal } from "./components/PromptChainBuilderModal";
import { AutoTagModal } from "./components/AutoTagModal";
import { loadCustomShortcuts, matchesShortcut, ShortcutBinding } from "./utils/customShortcuts";
import { PromptGeneratorModal } from "./components/PromptGeneratorModal";
import { SyncStatus } from "./components/SyncStatus";
import { BulkTagModal } from "./components/BulkTagModal";
import { BulkRenameModal } from "./components/BulkRenameModal";
import { EmptyState } from "./components/EmptyStates";
import { RTLTestResults } from './components/RTLTestResults';
import { ComparePromptsView } from './components/ComparePromptsView';
import { DueReminderModal } from './components/DueReminderModal';
import { TeamComments } from './components/TeamComments';
import { SharedPromptView } from './components/SharedPromptView';
import { IntegrationPanel } from './components/IntegrationPanel';
import { PromptQrCodeModal } from './components/PromptQrCodeModal';
import { ComplexityScoreBadge } from './components/ComplexityScoreBadge';
import { SharePromptModal } from './components/SharePromptModal';
import { RecommendationsSection } from './components/RecommendationsSection';
import { PromptTemplateModal } from './components/PromptTemplateModal';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import { extractPlaceholders } from './utils/templatingEngine';

const CommunityView = React.lazy(() => import("./components/CommunityView.tsx").then(module => ({ default: module.CommunityView })));
const DashboardView = React.lazy(() => import("./components/DashboardView.tsx").then(module => ({ default: module.DashboardView })));
const InsightsDashboard = React.lazy(() => import("./components/InsightsDashboard.tsx").then(module => ({ default: module.InsightsDashboard })));
const TemplatesGallery = React.lazy(() => import("./components/TemplatesGallery.tsx").then(module => ({ default: module.TemplatesGallery })));
const VisualWorkflow = React.lazy(() => import("./components/VisualWorkflow.tsx").then(module => ({ default: module.VisualWorkflow })));

import { EvaluationPanel } from './components/EvaluationPanel';

import { detectLanguage, getLanguageFlag } from "./utils/language";


const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-inherit rounded-sm px-0.5">{part}</mark> : <span key={i}>{part}</span>
      )}
    </>
  );
};

const PLATFORMS: Record<string, PlatformConfig> = {
  ChatGPT: { id: "ChatGPT", name: "ChatGPT", color: "#10a37f", bgColor: "bg-[#10a37f]/10", textColor: "text-[#10a37f]" },
  Claude: { id: "Claude", name: "Claude", color: "#d9775f", bgColor: "bg-[#d9775f]/10", textColor: "text-[#d9775f]" },
  Gemini: { id: "Gemini", name: "Gemini", color: "#1a73e8", bgColor: "bg-[#1a73e8]/10", textColor: "text-[#1a73e8]" },
  Midjourney: { id: "Midjourney", name: "Midjourney", color: "#ff007f", bgColor: "bg-[#ff007f]/10", textColor: "text-[#ff007f]" },
  "DALL-E": { id: "DALL-E", name: "DALL-E", color: "#9c27b0", bgColor: "bg-[#9c27b0]/10", textColor: "text-[#9c27b0]" },
  General: { id: "General", name: "כללי", color: "#64748b", bgColor: "bg-[#64748b]/10", textColor: "text-[#64748b]" }
};

const INITIAL_PROMPTS: Prompt[] = [
  {
    id: "p1",
    title: "ניתוח ושיפור קוד (Code Review)",
    content: "אתה מהנדס תוכנה בכיר. נתח את הקוד הבא לפרטי פרטים, חפש באגים, בעיות אבטחה וביצועים, והצע שיפורים עם דוגמאות קוד:\n\n```\n$(CODE)\n```",
    platform: "Gemini",
    tags: ["פיתוח", "קוד", "Review"],
    folder: "work",
    favorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    useCount: 12, usageHistory: Array.from({length: 12}, (_, i) => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()), projectId: "default", language: "he"
  },
  {
    id: "p2",
    title: "פוסט שיווקי לרשתות חברתיות",
    content: "כתוב פוסט שיווקי ומרתק עבור רשת $(PLATFORM) בנושא: $(TOPIC).\nקהל היעד: $(AUDIENCE).\nהקפד להשתמש באימוג'ים מתאימים, כותרת שתתפוס את העין, והנעה ברורה לפעולה בסוף.",
    platform: "Claude",
    tags: ["שיווק", "פוסט", "כתיבה"],
    folder: "writing",
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    useCount: 5, usageHistory: Array.from({length: 5}, (_, i) => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()), projectId: "default", language: "he"
  },
  {
    id: "p3",
    title: "אופטימיזציה של קורות חיים ל-ATS",
    content: "אני מגיש מועמדות למשרת $(ROLE) בחברת $(COMPANY). הנה קורות החיים שלי:\n$(RESUME)\n\nוהנה תיאור המשרה:\n$(JOB_DESCRIPTION)\n\nהתאם את קורות החיים למשרה, הדגש מילות מפתח למערכות ATS, והצע שינויים לשיפור.",
    platform: "ChatGPT",
    tags: ["קריירה", "קורות חיים", "ATS"],
    folder: "work",
    favorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    useCount: 8, usageHistory: Array.from({length: 8}, (_, i) => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()), projectId: "default", language: "he"
  }
];

const INITIAL_FOLDERS: Folder[] = [
  { id: "work", name: "עבודה מקצועית", icon: "briefcase" },
  { id: "writing", name: "כתיבה ותוכן", icon: "pen-tool" },
  { id: "personal", name: "אישי ופנאי", icon: "coffee" }
];


const checkPromptValidation = (content: string) => {
  if (!content) return null;
  if (/\[.*?\]|\{.*?\}|<.*?>|\(.*?\)/.test(content)) {
    return "שים לב: הפרומפט מכיל משתנים או מקומות ריקים שיש למלא טרם השימוש (לדוגמה [כאן]).";
  }
  if (content.length < 20) {
    return "הפרומפט נראה קצר מדי. כדאי להוסיף הקשר, תפקיד למודל (Role) או פירוט לתוצאות טובות יותר.";
  }
  return null;
};

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const sharedPromptId = urlParams.get('shared');
  if (sharedPromptId) {
    return <SharedPromptView promptId={sharedPromptId} />;
  }

  const [user, setUser] = useState<User | null>(null);
  type ThemeMode = 'light' | 'dark' | 'system' | 'scheduled';
  
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => {
    try {
      const saved = localStorage.getItem("promptvault_rules");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse promptvault_rules:", e);
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("promptvault_rules", JSON.stringify(automationRules));
  }, [automationRules]);


  
  const [isFilterRulesModalOpen, setIsFilterRulesModalOpen] = useState(false);
  const [isPromptChainOpen, setIsPromptChainOpen] = useState(false);
  const [isAutoTagOpen, setIsAutoTagOpen] = useState(false);
  const [autoTagTargetPrompt, setAutoTagTargetPrompt] = useState<Prompt | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => localStorage.getItem('promptvault_onboarded_v1') !== 'true');
const [folderSortOrder, setFolderSortOrder] = useState<"alphabetical" | "recent" | "alpha" | "custom" | "uses" | "date">("alphabetical");
const [appLanguage, setAppLanguage] = useState<Language>(() => {
    return (localStorage.getItem("promptvault_lang") as Language) || 'he';
  });

  useEffect(() => {
    document.documentElement.dir = appLanguage === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = appLanguage;
    localStorage.setItem("promptvault_lang", appLanguage);
  }, [appLanguage]);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(appLanguage, key);

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem("promptvault_theme") as ThemeMode) || 'system';
  });
  
  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (themeMode === 'dark') isDark = true;
      else if (themeMode === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else if (themeMode === 'scheduled') {
        const hour = new Date().getHours();
        isDark = hour >= 20 || hour < 7;
      }
      document.documentElement.classList.toggle("dark", isDark);
      localStorage.setItem("promptvault_theme", themeMode);
    };
    
    applyTheme();
    
    if (themeMode === 'system') {
      const matcher = window.matchMedia('(prefers-color-scheme: dark)');
      matcher.addEventListener('change', applyTheme);
      return () => matcher.removeEventListener('change', applyTheme);
    }
    
    if (themeMode === 'scheduled') {
      const interval = setInterval(applyTheme, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [themeMode]);

  const cycleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : prev === 'system' ? 'scheduled' : 'light');
  };

  const isCurrentlyDark = useMemo(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    if (themeMode === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    if (themeMode === 'scheduled') {
      const h = new Date().getHours();
      return h >= 20 || h < 7;
    }
    return false;
  }, [themeMode]);

  const handleForceToggleTheme = () => {
    const nextMode: ThemeMode = isCurrentlyDark ? 'light' : 'dark';
    setThemeMode(nextMode);
    document.documentElement.classList.toggle("dark", nextMode === 'dark');
    localStorage.setItem("promptvault_theme", nextMode);
    showToast(nextMode === 'dark' ? "הופעל מצב כהה בכפייה ידנית" : "הופעל מצב בהיר בכפייה ידנית", "info");
  };
  
  

  const handleOpenNewEditor = () => {
    const draft = localStorage.getItem("promptvault_draft");
    if (draft) {
      if (true) { // Auto-restore draft without window.confirm due to iframe restrictions
        try {
          setEditingPrompt(JSON.parse(draft));
          setIsEditing(true);
          setSelectedPromptId(null);
          setIsMobileMenuOpen(false);
          setCurrentView("library");
          return;
        } catch (e) {}
      }
    }
    setEditingPrompt({});
    setIsEditing(true);
    setSelectedPromptId(null);
    setIsMobileMenuOpen(false);
    setCurrentView("library");
  };

  
  
  // Backwards compatibility for the dark background class in App.tsx wrapper:
  const isDarkCurrent = document.documentElement.classList.contains('dark');
  
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [toast, setToast] = useState<{message: string, type: ToastType, action?: {label: string, onClick: () => void}} | null>(null);

  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState<string>('');
  const [isSavingInline, setIsSavingInline] = useState(false);

  const handleInlineSave = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inlineEditValue.trim() || isSavingInline) {
      setInlineEditingId(null);
      return;
    }
    
    setIsSavingInline(true);
    if (user) {
      await updateDoc(doc(db, "users", user.uid, "prompts", id), {
        title: inlineEditValue.trim()
      });
      showToast('שם הפרומפט שונה בהצלחה', 'success');
    } else {
      const updated = prompts.map(p => p.id === id ? {...p, title: inlineEditValue.trim()} : p);
      setPrompts(updated);
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
    }
    setIsSavingInline(false);
    setInlineEditingId(null);
  };

  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  
  const [currentView, setCurrentView] = useState<"dashboard" | "library" | "insights" | "settings" | "profile" | "community" | "templates" | "workflows">("dashboard");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [isEditing, setIsEditing] = useState(false);

  


  

  const [isReadingMode, setIsReadingMode] = useState(false);
  const [readingFontSize, setReadingFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [readingScrollProgress, setReadingScrollProgress] = useState(0);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [isDetailMoreMenuOpen, setIsDetailMoreMenuOpen] = useState(false);
  const [isSpeedReadingOpen, setIsSpeedReadingOpen] = useState(false);
  const [isBookmarksDrawerOpen, setIsBookmarksDrawerOpen] = useState(false);

  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreState>(() => getScoreState());

  useEffect(() => {
    const handleScoreUpdated = (e: any) => {
      if (e.detail) setScoreData(e.detail);
      else setScoreData(getScoreState());
    };
    window.addEventListener('promptvault_score_updated', handleScoreUpdated);
    return () => window.removeEventListener('promptvault_score_updated', handleScoreUpdated);
  }, []);

  useEffect(() => {
    if (!isReadingMode && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
    }
  }, [isReadingMode]);

  const handleReadingScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll > 0) {
      setReadingScrollProgress(Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100)));
    } else {
      setReadingScrollProgress(100);
    }
  };

  const handleToggleReadAloud = () => {
    if (!('speechSynthesis' in window)) {
      showToast('הדפדפן שלך אינו תומך בהקראה קולית (Web Speech API)', 'error');
      return;
    }

    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
      showToast('ההקראה הקולית נעצרה', 'info');
      return;
    }

    const currentPrompt = selectedPromptRef.current;
    if (!currentPrompt?.content) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentPrompt.content);
    const hasHebrew = /[\u0590-\u05FF]/.test(currentPrompt.content);
    utterance.lang = hasHebrew ? 'he-IL' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsReadingAloud(true);
      recordScoreAction('read_aloud');
      showToast('הקראה קולית מופעלת 🔊', 'info');
    };

    utterance.onend = () => {
      setIsReadingAloud(false);
    };

    utterance.onerror = () => {
      setIsReadingAloud(false);
    };

    window.speechSynthesis.speak(utterance);
  };
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "saved" | "error" | "offline">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState<string[] | null>(null);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [isMagicSuggesting, setIsMagicSuggesting] = useState(false);
  const [magicSuggestions, setMagicSuggestions] = useState<any>(null);


  const [viewMode, setViewMode] = useState<"grid" | "list" | "kanban">("grid");
  const [tagFilter, setTagFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [favoriteOnlyFilter, setFavoriteOnlyFilter] = useState<boolean>(false);
  const [draggingPromptId, setDraggingPromptId] = useState<string | null>(null);

  const [sortOrder, setSortOrder] = useState<"recent" | "alpha" | "created" | "popular" | "custom" | "relevance">("recent");
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches') || '[]'); } catch(e) { return []; }
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileDetailActionsOpen, setIsMobileDetailActionsOpen] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  
  const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt> | null>(null);

  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState<Partial<Prompt> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isEnterpriseSuiteOpen, setIsEnterpriseSuiteOpen] = useState(false);
  const [isDeepDiagnosticOpen, setIsDeepDiagnosticOpen] = useState(false);
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
              const n = new Notification("תזכורת לפרומפט!", { body: p.title });
              n.onclick = () => { window.focus(); setDuePrompt(p); };
            }
            setDuePrompt(p);
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

  useEffect(() => {
    if (isEditing && editingPrompt && !editingPrompt.id) { // Only auto-suggest for new prompts
       const text = (editingPrompt.content || '') + ' ' + (editingPrompt.tags?.join(' ') || '') + ' ' + (editingPrompt.title || '');
       if (text.length > 5) {
         const lower = text.toLowerCase();
         let bestFolder = editingPrompt.folder;
         for (const f of folders) {
           if (f.name && lower.includes(f.name.toLowerCase())) {
             bestFolder = f.id;
             break;
           }
         }
         if (bestFolder !== editingPrompt.folder) {
           setEditingPrompt(prev => prev ? {...prev, folder: bestFolder} : prev);
         }
       }
    }
  }, [editingPrompt?.content, editingPrompt?.title, editingPrompt?.tags, isEditing, folders]);

  
  // Auto-save draft
  useEffect(() => {
    if (isEditing && editingPrompt) {
      const timeout = setTimeout(() => {
        localStorage.setItem("promptvault_draft", JSON.stringify(editingPrompt));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isEditing, editingPrompt]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'general' | 'shortcuts' | 'backup'>('general');
  const [customShortcuts, setCustomShortcuts] = useState<Record<string, ShortcutBinding>>(() => loadCustomShortcuts());
  const customShortcutsRef = useRef(customShortcuts);
  customShortcutsRef.current = customShortcuts;
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [smartVarsText, setSmartVarsText] = useState<string | null>(null);
  const [chainingText, setChainingText] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isBulkRenameModalOpen, setIsBulkRenameModalOpen] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [duePrompt, setDuePrompt] = useState<Prompt | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobileActionMenuOpen, setIsMobileActionMenuOpen] = useState(false);

  // Categories State
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  // Tag Colors State & Helpers
  const [tagColors, setTagColors] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('prompt_vault_tag_colors');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('prompt_vault_tag_colors', JSON.stringify(tagColors));
    } catch {}
  }, [tagColors]);

  const TAG_PALETTE = [
    '#6366f1', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', 
    '#f59e0b', '#ef4444', '#14b8a6', '#f97316', '#64748b'
  ];

  const getTagColor = (tagName: string) => {
    if (tagColors[tagName]) return tagColors[tagName];
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % TAG_PALETTE.length;
    return TAG_PALETTE[index];
  };

  const updatePromptField = async (promptId: string, fields: Partial<Prompt>) => {
    setPrompts(prev => {
      const updated = prev.map(p => {
        if (p.id === promptId) {
          return { ...p, ...fields, updatedAt: new Date().toISOString() };
        }
        return p;
      });
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
      return updated;
    });

    if (user) {
      const targetPrompt = prompts.find(p => p.id === promptId);
      if (targetPrompt) {
        setDoc(doc(db, "users", user.uid, "prompts", promptId), { 
          ...targetPrompt, 
          ...fields, 
          updatedAt: new Date().toISOString() 
        }, { merge: true }).catch(err => console.error("Error updating prompt field in Firestore:", err));
      }
    }
  };

  const handleSummarizePrompt = async (promptId: string, content: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      showToast('מייצר סיכום AI...', 'info');
      const res = await apiFetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title })
      });
      if (!res.ok) throw new Error('Failed to generate summary');
      const data = await res.json();
      if (data.summary) {
        updatePromptField(promptId, { summary: data.summary });
        showToast('סיכום AI נוצר והועדכן בהצלחה!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'שגיאה ביצירת סיכום AI', 'error');
    }
  };

  // Advanced Search State
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  // Reminders State
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [quickReminderPrompt, setQuickReminderPrompt] = useState<Prompt | null>(null);

  const handleSaveCategories = (newCats: Category[]) => {
    setCategories(newCats);
    saveCategories(newCats);
  };

  const handleSaveReminder = (promptId: string, reminder: PromptReminder | null) => {
    setPrompts(prev => {
      const updated = prev.map(p => {
        if (p.id === promptId) {
          return { ...p, reminder: reminder || undefined };
        }
        return p;
      });
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
      return updated;
    });

    if (user) {
      const targetPrompt = prompts.find(p => p.id === promptId);
      if (targetPrompt) {
        setDoc(doc(db, "users", user.uid, "prompts", promptId), { 
          ...targetPrompt, 
          reminder: reminder || undefined 
        }, { merge: true }).catch(err => console.error("Error saving reminder to Firestore:", err));
      }
    }

    if (editingPrompt && editingPrompt.id === promptId) {
      setEditingPrompt((prev: any) => ({ ...prev, reminder: reminder || undefined }));
    }
  };

  // Listen for community comments on user's public prompts
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = collection(db, 'public_prompts');
    // For a real app, query by authorId === currentUser.uid
    // Due to missing indexes possibly, we might just listen to the whole collection and filter, 
    // but limit to small for safety, or just do a simple snapshot.
    // For demonstration of the custom toast, let's just create a generic hook that fires when a prompt we own gets a comment increment.
    let initialLoad = true;
    const unsub = onSnapshot(q, (snapshot) => {
      if (initialLoad) {
        initialLoad = false;
        return;
      }
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          const data = change.doc.data();
          // If the prompt belongs to the current user and comments count increased
          if (data.authorId === auth.currentUser?.uid) {
            showToast(`מישהו הגיב לפרומפט שלך: "${data.title}"`, 'community');
          }
        }
      });
    });
    return () => unsub();
  }, [auth.currentUser]);

  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const [focusedPromptIndex, setFocusedPromptIndex] = useState<number>(-1);




  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrTargetPrompt, setQrTargetPrompt] = useState<Prompt | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetPrompt, setShareTargetPrompt] = useState<Prompt | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateTargetPrompt, setTemplateTargetPrompt] = useState<Prompt | Partial<Prompt> | null>(null);
  const [isRtlTestsOpen, setIsRtlTestsOpen] = useState(false);
  const [pulsingPromptId, setPulsingPromptId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverPromptId, setDragOverPromptId] = useState<string | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [showInlineDiff, setShowInlineDiff] = useState(false);

  // Search input ref & Prompt Card Export Modal & Smart Grouping
  const searchRef = useRef<HTMLInputElement>(null);
  const [exportingPrompt, setExportingPrompt] = useState<Prompt | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const isSmartGrouping = usePromptStore(state => state.isSmartGrouping);
  const setIsSmartGrouping = usePromptStore(state => state.setIsSmartGrouping);


  const [showImportModal, setShowImportModal] = useState(false);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('promptvault_tour_seen')) {
      setRunTour(true);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
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

  
  useEffect(() => {
    if (isEditing && editingPrompt && !editingPrompt.folder && editingPrompt.content?.length > 30) {
      const timer = setTimeout(async () => {
         try {
           const key = localStorage.getItem("promptvault_gemini_key") || "";
           const res = await apiFetch("/api/gemini/suggest-folder", {
             method: "POST",
             headers: { "Content-Type": "application/json", ...(key ? { "x-gemini-api-key": key } : {}) },
             body: JSON.stringify({ 
               content: editingPrompt.content, 
               folders: folders.map(f => ({id: f.id, name: f.name})),
               promptsContext: prompts.slice(0, 10).map(p => ({title: p.title, folder: p.folder})) 
             })
           });
           const data = await res.json();
           if (data.folderId) {
             const f = folders.find(x => x.id === data.folderId);
             if (f) setMlSuggestedFolder({id: f.id, name: f.name});
           }
         } catch(e) {}
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setMlSuggestedFolder(null);
    }
  }, [editingPrompt?.content, isEditing]);

  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isBulkOrganizerOpen, setIsBulkOrganizerOpen] = useState(false);
  const [isMetaPromptOpen, setIsMetaPromptOpen] = useState(false);
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [varSuggest, setVarSuggest] = useState({show: false, filter: '', cursorIndex: 0});
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);
  const [mlSuggestedFolder, setMlSuggestedFolder] = useState<{id: string, name: string} | null>(null);
  const suggestedFolder = useMemo(() => {
    if (!editingPrompt?.content || folders.length === 0) return null;
    const lower = editingPrompt.content.toLowerCase();
    for (const f of folders) {
      if (f.id === 'all' || f.id === 'favorites') continue;
      if (lower.includes(f.name.toLowerCase())) return f;
    }
    return null;
  }, [editingPrompt?.content, folders]);


  const COMMON_VARS = [
    { name: 'PLATFORM', desc: 'Choose target AI model or platform', format: 'String' },
    { name: 'TOPIC', desc: 'The main subject of the prompt', format: 'String' },
    { name: 'AUDIENCE', desc: 'Who the output is intended for', format: 'String' },
    { name: 'LANGUAGE', desc: 'Target language of the output', format: 'String' },
    { name: 'TONE', desc: 'The emotional tone or style', format: 'String' },
    { name: 'FORMAT', desc: 'Output format (e.g., Markdown, JSON, PDF)', format: 'String' }
  ];


  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // History viewing state
  const [showHistory, setShowHistory] = useState(false);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [historyCompareIndex, setHistoryCompareIndex] = useState<number>(-1);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      usePromptStore.getState().setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubStore = usePromptStore.subscribe((state) => {
      setPrompts(state.prompts);
      setFolders(state.folders);
      if (state.lastSyncTime) setLastSyncTime(state.lastSyncTime);
      setSyncStatus(state.syncStatus);
    });
    return () => unsubStore();
  }, []);


  // Reminders and Notification Service
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = new Date();
      let updatedAny = false;

      prompts.forEach(p => {
        // 1. Specific Date & Time Task Reminder
        if (p.reminder && p.reminder.dateTime && !p.reminder.isCompleted && !p.reminder.notified) {
          const remDate = new Date(p.reminder.dateTime);
          if (remDate <= now) {
            playReminderChime();

            if ("Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(`🔔 תזכורת: ${p.title}`, {
                  body: p.reminder.note || `הגיע הזמן לעבוד על הפרומפט "${p.title}"!`,
                  icon: "/favicon.ico"
                });
              } catch (e) {
                console.warn('Browser notification error:', e);
              }
            }

            showToast(`⏰ תזכורת: ${p.title}${p.reminder.note ? ` - ${p.reminder.note}` : ''}`, 'info');

            // Mark as notified so we don't repeat every 10s
            p.reminder.notified = true;
            updatedAny = true;
          }
        }

        // 2. Legacy Due Date check
        if (p.dueDate && !p.reminder) {
          let notifiedDue: Record<string, boolean> = {};
          try {
            notifiedDue = JSON.parse(localStorage.getItem('notified_prompts') || '{}');
          } catch {
            notifiedDue = {};
          }
          const dueDate = new Date(p.dueDate);
          if (dueDate <= now && !notifiedDue[p.id]) {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("תזכורת: פרומפט דורש טיפול", {
                body: p.title,
                icon: "/logo.png"
              });
            }
            notifiedDue[p.id] = true;
            localStorage.setItem('notified_prompts', JSON.stringify(notifiedDue));
          }
        }
      });

      if (updatedAny) {
        setPrompts([...prompts]);
        localStorage.setItem("promptvault_prompts", JSON.stringify(prompts));
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [prompts]);

  const { totalRemindersCount, overdueRemindersCount } = useMemo(() => {
    const now = new Date();
    let total = 0;
    let overdue = 0;
    prompts.forEach(p => {
      if (p.reminder && p.reminder.dateTime && !p.reminder.isCompleted) {
        total++;
        if (new Date(p.reminder.dateTime) < now) {
          overdue++;
        }
      }
    });
    return { totalRemindersCount: total, overdueRemindersCount: overdue };
  }, [prompts]);

  useEffect(() => {
    if (user) {
      const unsubP = onSnapshot(collection(db, "users", user.uid, "prompts"), (snap) => {
        setPrompts(snap.docs.map(d => d.data() as Prompt));
          setLastSyncTime(new Date());
      });
      const unsubF = onSnapshot(collection(db, "users", user.uid, "folders"), (snap) => {
        if (!snap.empty) {
          setFolders(snap.docs.map(d => d.data() as Folder));
        }
      });
      return () => { unsubP(); unsubF(); };
    } else {
      const saved = localStorage.getItem("promptvault_prompts");
      try { 
        if (saved) { 
          const parsed = JSON.parse(saved); 
          setPrompts(parsed.length > 0 ? parsed : INITIAL_PROMPTS); 
        } else { 
          setPrompts(INITIAL_PROMPTS); 
        } 
      } catch(e) { 
        setPrompts(INITIAL_PROMPTS); 
      }

      const savedF = localStorage.getItem("promptvault_folders");
      try { 
        if (savedF) setFolders(JSON.parse(savedF) || INITIAL_FOLDERS); 
      } catch(e) { 
        setFolders(INITIAL_FOLDERS); 
      }
    }
  }, [user]);

  const allTags = useMemo(() => Array.from(new Set(prompts.flatMap(p => p.tags || []))).filter(Boolean).sort(), [prompts]);

  
  


  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    const newSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
    setSearchQuery(query);
    setIsSearchFocused(false);
  };

  const sortedFolders = useMemo(() => {
    const sorted = [...folders];
    if (folderSortOrder === "alphabetical") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "he"));
    } else {
      // By recent: we can check the newest prompt in that folder
      sorted.sort((a, b) => {
        const aPrompts = prompts.filter(p => p.folder === a.id);
        const bPrompts = prompts.filter(p => p.folder === b.id);
        const aMax = Math.max(...aPrompts.map(p => new Date(p.updatedAt).getTime()), 0);
        const bMax = Math.max(...bPrompts.map(p => new Date(p.updatedAt).getTime()), 0);
        return bMax - aMax;
      });
    }
    return sorted;
  }, [folders, prompts, folderSortOrder]);

  // Unique categories and platforms for filtering
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    prompts.forEach(p => {
      if (p.platform) cats.add(p.platform);
      if (p.topic) cats.add(p.topic);
      (p.categories || []).forEach(cId => {
        const found = categories.find(c => c.id === cId || c.name === cId);
        if (found) cats.add(found.name);
        else cats.add(cId);
      });
    });
    categories.forEach(c => cats.add(c.name));
    ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DALL-E', 'General'].forEach(c => cats.add(c));
    return Array.from(cats).sort();
  }, [prompts, categories]);

  // Top tags with usage counts for quick filter chips
  const topTagsWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach(p => {
      (p.tags || []).forEach(t => {
        if (t && t.trim()) {
          const tag = t.trim();
          counts[tag] = (counts[tag] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [prompts]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedFolder.startsWith("type:")) count++;
    if (selectedCategory) count++;
    if (categoryFilter !== "all") count++;
    if (tagFilter !== "all") count++;
    if (favoriteOnlyFilter) count++;
    if (sortOrder !== "recent") count++;
    return count;
  }, [selectedFolder, selectedCategory, categoryFilter, tagFilter, favoriteOnlyFilter, sortOrder]);

  const filteredPrompts = useMemo(() => {
    let list = prompts;

    // 1. Folder / Virtual view filtering
    if (selectedFolder === "favorites" || selectedFolder === "smart_favorites") {
      list = list.filter(p => p.favorite && p.folder !== "archive" && p.folder !== "community");
    } else if (selectedFolder === "recent") {
      list = [...list].filter(p => p.lastUsedAt);
    } else if (selectedFolder === "archive") {
      list = list.filter(p => p.folder === "archive");
    } else if (selectedFolder === "community") {
      list = list.filter(p => p.folder === "community");
    } else if (selectedFolder.startsWith("type:")) {
      const targetType = selectedFolder.replace("type:", "").trim();
      list = list.filter(p => {
        if (p.folder === "archive") return false;
        const currentType = p.type || 'text';
        return currentType === targetType;
      });
    } else if (selectedFolder.startsWith("smart-tag:")) {
      const targetTag = selectedFolder.replace("smart-tag:", "").trim();
      list = list.filter(p => {
        if (p.folder === "archive") return false;
        const primaryTag = (p.tags && p.tags.length > 0 && p.tags[0].trim()) ? p.tags[0].trim() : 'ללא תגית';
        return primaryTag === targetTag;
      });
    } else if (selectedFolder !== "all") {
      list = list.filter(p => p.folder === selectedFolder);
    } else {
      list = list.filter(p => p.folder !== "archive" && p.folder !== "community");
    }

    // 2. Favorite only toggle filter
    if (favoriteOnlyFilter) {
      list = list.filter(p => p.favorite);
    }

    // 3. Category / Platform filter
    if (selectedCategory) {
      list = list.filter(p => p.categories && (
        p.categories.includes(selectedCategory) || 
        categories.find(c => c.id === selectedCategory)?.name && p.categories.includes(categories.find(c => c.id === selectedCategory)!.name)
      ));
    } else if (categoryFilter !== 'all') {
      const catLower = categoryFilter.toLowerCase();
      list = list.filter(p => 
        (p.platform && p.platform.toLowerCase() === catLower) ||
        (p.topic && p.topic.toLowerCase() === catLower) ||
        (p.categories && p.categories.some(c => 
          c.toLowerCase() === catLower || 
          categories.find(cat => cat.id === c)?.name.toLowerCase() === catLower
        ))
      );
    }

    // 4. Tag filter
    if (tagFilter !== 'all') {
      list = list.filter(p => p.tags && p.tags.includes(tagFilter));
    }

    // 5. Semantic search or Keywords search
    if (semanticResults !== null) {
      const idMap = new Map();
      semanticResults.forEach((id, idx) => idMap.set(id, idx));
      list = list.filter(p => idMap.has(p.id))
                 .sort((a, b) => idMap.get(a.id) - idMap.get(b.id));
    } else if (searchQuery.trim()) {
      const tokens = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      list = list.filter(p => {
        const title = (p.title || "").toLowerCase();
        const content = (p.content || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const notes = (p.notes || "").toLowerCase();
        const example = (p.exampleOutput || "").toLowerCase();
        const platform = (p.platform || "").toLowerCase();
        const topic = (p.topic || "").toLowerCase();
        const tags = (p.tags || []).map(t => (t || "").toLowerCase());
        const promptCategories = (p.categories || []).map(cId => {
          const cat = categories.find(c => c.id === cId || c.name === cId);
          return (cat ? `${cat.name} ${cId}` : cId).toLowerCase();
        });

        return tokens.every(token => {
          const clean = token.startsWith('#') ? token.slice(1) : token;
          return (
            title.includes(clean) ||
            content.includes(clean) ||
            desc.includes(clean) ||
            notes.includes(clean) ||
            example.includes(clean) ||
            platform.includes(clean) ||
            topic.includes(clean) ||
            tags.some(t => t.includes(clean)) ||
            promptCategories.some(c => c.includes(clean))
          );
        });
      });
    }

    // 6. Advanced Sorting
    if (semanticResults === null) {
      let sorted = [...list];
      if (sortOrder === 'relevance') {
        const queryLower = searchQuery.toLowerCase().trim();
        const scorePrompt = (p: Prompt) => {
          let score = 0;
          const title = (p.title || "").toLowerCase();
          const desc = (p.description || "").toLowerCase();
          const content = (p.content || "").toLowerCase();
          const tags = (p.tags || []).map(t => (t || "").toLowerCase());
          const promptCats = (p.categories || []).map(cId => {
            const cat = categories.find(c => c.id === cId || c.name === cId);
            return (cat ? `${cat.name} ${cId}` : cId).toLowerCase();
          });
          
          if (queryLower) {
            if (title === queryLower) score += 100;
            else if (title.startsWith(queryLower)) score += 60;
            else if (title.includes(queryLower)) score += 35;
            
            if (tags.some(t => t === queryLower)) score += 40;
            else if (tags.some(t => t.includes(queryLower))) score += 20;

            if (promptCats.some(c => c.includes(queryLower))) score += 30;

            if (desc.includes(queryLower)) score += 15;
            if (content.includes(queryLower)) score += 10;
          }

          score += Math.min(20, (p.useCount || 0) * 2);
          if (p.favorite) score += 10;

          return score;
        };
        sorted.sort((a, b) => scorePrompt(b) - scorePrompt(a));
      } else if (sortOrder === 'recent') {
        sorted.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
      } else if (sortOrder === 'created') {
        sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      } else if (sortOrder === 'alpha') {
        sorted.sort((a, b) => (a.title || "").localeCompare(b.title || "", appLanguage === 'he' ? 'he' : 'en'));
      } else if (sortOrder === 'popular') {
        sorted.sort((a, b) => (b.useCount || 0) - (a.useCount || 0));
      } else if (sortOrder === 'custom') {
        sorted.sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0));
      }
      return sorted;
    }

    return list;
  }, [
    prompts,
    selectedFolder,
    favoriteOnlyFilter,
    categoryFilter,
    tagFilter,
    searchQuery,
    semanticResults,
    sortOrder,
    appLanguage
  ]);
    


  const selectedPrompt = useMemo(() => prompts.find(p => p.id === selectedPromptId), [prompts, selectedPromptId]);

  // Reset history index when prompt changes
  useEffect(() => {
    setHistoryIndex(0);
    setShowHistory(false);
  }, [selectedPromptId]);

    const showToast = (message: string, type: ToastType = 'success', action?: {label: string, onClick: () => void}) => {
    setToast({message, type, action});
  };

  const battery = useBatteryStatus((triggeredLevel) => {
    showToast(
      appLanguage === 'en'
        ? `Low battery (${triggeredLevel}%) - Energy Saving Mode enabled to reduce animations and save power 🌿`
        : `סוללה נמוכה (${triggeredLevel}%) - מצב חיסכון באנרגיה הופעל אוטומטית להפחתת אנימציות וצריכת משאבים 🌿`,
      'info'
    );
  });

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSemanticSearching(true);
    try {
      const simplifiedPrompts = prompts.map(p => ({id: p.id, title: p.title, tags: p.tags}));
      const res = await apiFetch("/api/gemini/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, prompts: simplifiedPrompts })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          setSemanticResults(data.results);
        }
      }
    } catch(err) {
      console.error(err);
    } finally {
      setIsSemanticSearching(false);
    }
  };

  const handleMagicSuggest = async () => {
    if (!editingPrompt.content?.trim()) return;
    setIsMagicSuggesting(true);
    try {
      const res = await apiFetch("/api/gemini/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // assuming isRtl is not defined, we'll just check if it contains hebrew chars
        body: JSON.stringify({ content: editingPrompt.content, language: /[\u0590-\u05FF]/.test(editingPrompt.content || '') ? 'he' : 'en' })
      });
      if (res.ok) {
        const data = await res.json();
        setMagicSuggestions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMagicSuggesting(false);
    }
  };

  const handleSave = async (promptData: Partial<Prompt>) => {
    const isNew = !promptData.id;
    const now = new Date().toISOString();
    let newPrompt: Prompt;

    if (isNew) {
      newPrompt = {
        id: (crypto.randomUUID ? (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)) : Math.random().toString(36).substring(2)),
        title: promptData.title || "פרומפט חדש",
        content: promptData.content || "",
        platform: promptData.platform || "General",
        tags: promptData.tags || [],
        categories: promptData.categories || [],
        reminder: promptData.reminder || undefined,
        dueDate: promptData.dueDate || undefined,
        folder: promptData.folder || folders[0]?.id,
        favorite: false,
        createdAt: now,
        updatedAt: now,
        useCount: 0,
        projectId: "default",
        language: "he",
        ...promptData
      };
    } else {

      const existing = prompts.find(p => p.id === promptData.id);
      if (!existing) return;
      
      const newHistory = existing.history ? [...existing.history] : [];
      if (existing.content !== promptData.content || (promptData.currentVersionName && existing.currentVersionName !== promptData.currentVersionName)) {
        newHistory.unshift({
          content: existing.content,
          updatedAt: existing.updatedAt,
          versionName: existing.currentVersionName,
          versionId: (crypto.randomUUID ? (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)) : Math.random().toString(36).substring(2))
        });
      }


      newPrompt = {
        ...existing,
        ...promptData,
        updatedAt: now,
        history: newHistory
      } as Prompt;
    }

    
    // Apply automation rules
    if (isNew) {
      for (const rule of automationRules) {
      if (!rule.isActive) continue;
      const lowerKeyword = rule.keyword.toLowerCase();
      let match = false;
      const tagsString = (newPrompt.tags || []).join(' ').toLowerCase();
      const contentString = (newPrompt.content || "").toLowerCase();
      const titleString = (newPrompt.title || '').toLowerCase();
      
      if (rule.matchIn === 'tags') {
        match = tagsString.includes(lowerKeyword);
      } else if (rule.matchIn === 'content') {
        match = contentString.includes(lowerKeyword) || titleString.includes(lowerKeyword);
      } else if (rule.matchIn === 'both') {
        match = tagsString.includes(lowerKeyword) || contentString.includes(lowerKeyword) || titleString.includes(lowerKeyword);
      }
      
      if (match) {
        newPrompt.folder = rule.targetFolderId;
        break; // First matching rule wins
      }
    }
    } // End if(isNew)

    if (user) {
      setSyncStatus("syncing");
      await setDoc(doc(db, "users", user.uid, "prompts", newPrompt.id), newPrompt);
      setSyncStatus("saved");
      setTimeout(() => setSyncStatus("idle"), 2000);
    } else {
      const updated = isNew ? [newPrompt, ...prompts] : prompts.map(p => p.id === newPrompt.id ? newPrompt : p);
      setPrompts(updated);
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
    }
    
    setIsEditing(false);
    setSelectedPromptId(newPrompt.id);
    const scoreResult = recordScoreAction('save_prompt', prompts.length + (isNew ? 1 : 0));
    if (scoreResult.unlockedAchievements.length > 0) {
      showToast(scoreResult.message, 'success');
    }
  };

  const handleManualSync = async () => {
    try {
      await usePromptStore.getState().triggerManualSync();
      showToast(appLanguage === 'en' ? "Synced with Firebase successfully!" : "הסנכרון מול Firebase הושלם בהצלחה!", "success");
    } catch (e) {
      showToast(appLanguage === 'en' ? "Sync error. Check network connection." : "שגיאה בסנכרון לענן. בדוק את החיבור לרשת.", "error");
    }
  };

  // Keyboard Shortcuts (Ctrl+S, Ctrl+Enter, Ctrl+F, Shift+Space, Ctrl+K, Ctrl+N, Esc)
  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;
  const editingPromptRef = useRef(editingPrompt);
  editingPromptRef.current = editingPrompt;
  const selectedPromptRef = useRef(selectedPrompt);
  selectedPromptRef.current = selectedPrompt;
  const isReadingModeRef = useRef(isReadingMode);
  isReadingModeRef.current = isReadingMode;
  const currentViewRef = useRef(currentView);
  currentViewRef.current = currentView;
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      
      // Escape: Exit Focus / Reading Mode or clear bulk selection or close modals
      if (e.key === 'Escape') {
        if (isReadingModeRef.current) {
          setIsReadingMode(false);
          return;
        }
        if (selectedIdsRef.current.length > 0) {
          setSelectedIds([]);
          showToast(appLanguage === 'en' ? "Selection cleared" : "בוטלה בחירת הפריטים", "info");
          return;
        }
        setIsShortcutsOpen(false);
        setIsGeneratorOpen(false);
        setIsBulkTagModalOpen(false);
        setIsPaletteOpen(false);
        setIsMobileMenuOpen(false);
      }

      // Bulk Actions Shortcut: Ctrl+Delete or Cmd+Delete when multiple items selected
      if (!isInput && selectedIdsRef.current.length > 0) {
        if ((e.metaKey || e.ctrlKey) && (e.key === 'Delete' || e.key === 'Backspace')) {
          e.preventDefault();
          handleBulkDelete();
          return;
        }
      }

      // Custom Copy Shortcut
      if (customShortcutsRef.current.copy && matchesShortcut(e, customShortcutsRef.current.copy)) {
        const hasTextSelection = typeof window !== 'undefined' && window.getSelection && window.getSelection()?.toString().length > 0;
        if (isInput && hasTextSelection) {
          // Allow standard copy when text is actively selected inside an input/textarea
        } else if (selectedPromptRef.current) {
          e.preventDefault();
          handleCopy(selectedPromptRef.current.content, selectedPromptRef.current.id);
          showToast(appLanguage === 'en' ? "Prompt copied! (Shortcut)" : "הפרומפט הועתק ללוח! (קיצור מקשים)", "success");
          return;
        }
      }
      
      // Share: Custom shortcut or Ctrl+Shift+S fallback
      if ((customShortcutsRef.current.share && matchesShortcut(e, customShortcutsRef.current.share)) || ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 's' || e.key === 'S'))) {
        e.preventDefault();
        if (selectedPromptRef.current) {
          setShareTargetPrompt(selectedPromptRef.current);
          setIsShareModalOpen(true);
        } else {
          showToast(appLanguage === 'en' ? "Select a prompt to share" : "בחר פרומפט לשיתוף", "info");
        }
        return;
      }

      // Save: Custom shortcut or Ctrl+S / Cmd+S fallback
      if ((customShortcutsRef.current.save && matchesShortcut(e, customShortcutsRef.current.save)) || ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 's' || e.key === 'S'))) {
        e.preventDefault();
        if (isEditingRef.current && editingPromptRef.current) {
          handleSave(editingPromptRef.current);
          showToast(appLanguage === 'en' ? "Prompt saved! (Ctrl+S)" : "הפרומפט נשמר בענן בהצלחה! (Ctrl+S)", "success");
        } else if (selectedPromptRef.current) {
          handleSave(selectedPromptRef.current);
          showToast(appLanguage === 'en' ? "Prompt saved & synced! (Ctrl+S)" : "הפרומפט סונכרן ונשמר! (Ctrl+S)", "success");
        } else {
          handleManualSync();
        }
        return;
      }

      // QR: Custom shortcut or Ctrl+Q fallback
      if ((customShortcutsRef.current.qr && matchesShortcut(e, customShortcutsRef.current.qr)) || ((e.metaKey || e.ctrlKey) && (e.key === 'q' || e.key === 'Q'))) {
        e.preventDefault();
        if (selectedPromptRef.current) {
          setQrTargetPrompt(selectedPromptRef.current);
          setIsQrModalOpen(true);
        } else {
          showToast(appLanguage === 'en' ? "Select a prompt to generate QR code" : "בחר פרומפט ליצירת קוד QR", "info");
        }
        return;
      }

      // Template: Custom shortcut or Alt+T fallback
      if (!isInput && ((customShortcutsRef.current.template && matchesShortcut(e, customShortcutsRef.current.template)) || (e.altKey && (e.key === 't' || e.key === 'T')))) {
        e.preventDefault();
        if (selectedPromptRef.current) {
          setTemplateTargetPrompt(selectedPromptRef.current);
          setIsTemplateModalOpen(true);
        } else {
          showToast(appLanguage === 'en' ? "Select a prompt to fill template" : "בחר פרומפט למילוי שדות תבנית", "info");
        }
        return;
      }

      // Run / Sandbox: Custom shortcut or Ctrl+Enter fallback
      if ((customShortcutsRef.current.run && matchesShortcut(e, customShortcutsRef.current.run)) || ((e.metaKey || e.ctrlKey) && e.key === 'Enter')) {
        e.preventDefault();
        if (isEditingRef.current && editingPromptRef.current) {
          const currentP = editingPromptRef.current;
          handleSave(currentP);
          showToast(appLanguage === 'en' ? "Sent to Sandbox! (Ctrl+Enter)" : "הפרומפט נשמר ונשלח ל-Sandbox! (Ctrl+Enter)", "info");
          setTimeout(() => {
            const startBtn = document.getElementById('start-test-btn');
            if (startBtn) {
              startBtn.click();
            } else {
              const chatInput = document.getElementById('sandbox-chat-input');
              chatInput?.focus();
            }
          }, 350);
        } else if (selectedPromptRef.current) {
          const startBtn = document.getElementById('start-test-btn');
          const sendBtn = document.getElementById('sandbox-send-btn');
          if (startBtn) {
            startBtn.click();
            showToast(appLanguage === 'en' ? "Running test in Sandbox... (Ctrl+Enter)" : "מריץ בדיקה ב-Sandbox... (Ctrl+Enter)", "info");
          } else if (sendBtn) {
            sendBtn.click();
          } else {
            const chatInput = document.getElementById('sandbox-chat-input');
            chatInput?.focus();
            showToast(appLanguage === 'en' ? "Sandbox active (Ctrl+Enter)" : "הפרומפט טעון ב-Sandbox (Ctrl+Enter)", "info");
          }
        } else {
          // If no prompt is currently selected, switch to library and select the first prompt if available
          if (currentViewRef.current !== 'library') {
            setCurrentView('library');
          }
          const allPrompts = usePromptStore.getState().prompts;
          if (allPrompts.length > 0) {
            setSelectedPromptId(allPrompts[0].id);
            showToast(appLanguage === 'en' ? "Selected first prompt for Sandbox (Ctrl+Enter)" : "נבחר הפרומפט הראשון לבדיקה ב-Sandbox (Ctrl+Enter)", "info");
            setTimeout(() => {
              const startBtn = document.getElementById('start-test-btn');
              startBtn?.click();
            }, 300);
          } else {
            showToast(appLanguage === 'en' ? "Create a prompt first to test in Sandbox" : "צור פרומפט תחילה כדי לבדוק אותו ב-Sandbox", "info");
          }
        }
        return;
      }

      // Search: Custom shortcut or Ctrl+F / Shift+Space fallback
      if ((customShortcutsRef.current.search && matchesShortcut(e, customShortcutsRef.current.search)) || ((e.metaKey || e.ctrlKey) && (e.key === 'f' || e.key === 'F')) || (e.shiftKey && (e.code === 'Space' || e.key === ' '))) {
        e.preventDefault();
        if (isReadingModeRef.current) {
          setIsReadingMode(false);
        }
        if (currentViewRef.current !== 'library') {
          setCurrentView('library');
        }
        setTimeout(() => {
          searchRef.current?.focus();
          searchRef.current?.select();
          setIsSearchFocused(true);
        }, 50);
        return;
      }
      
      // Command Palette: Custom shortcut or Ctrl+K fallback
      if ((customShortcutsRef.current.palette && matchesShortcut(e, customShortcutsRef.current.palette)) || ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K'))) {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
        return;
      }
      
      // New Prompt: Custom shortcut or Ctrl+N fallback
      if (!isInput && ((customShortcutsRef.current.new && matchesShortcut(e, customShortcutsRef.current.new)) || ((e.metaKey || e.ctrlKey) && (e.key === 'n' || e.key === 'N')))) {
        e.preventDefault();
        setEditingPrompt({});
        setIsEditing(true);
        setSelectedPromptId(null);
        return;
      }
      
      // Shift+?: Help / Interactive Shortcuts Overlay HUD
      if ((e.key === '?' || (e.shiftKey && (e.key === '/' || e.code === 'Slash'))) && !isInput) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [handleSave]);

  const handleShortcutAction = (actionKey: string) => {
    switch (actionKey) {
      case 'copy':
        if (selectedPromptRef.current) {
          handleCopy(selectedPromptRef.current.content, selectedPromptRef.current.id);
          showToast(appLanguage === 'en' ? "Prompt copied to clipboard!" : "תוכן הפרומפט הועתק בהצלחה ללוח!", "success");
        } else {
          showToast(appLanguage === 'en' ? "Select a prompt to copy" : "בחר פרומפט תחילה להעתקה", "info");
        }
        break;
      case 'save':
        if (isEditingRef.current && editingPromptRef.current) {
          handleSave(editingPromptRef.current);
          showToast(appLanguage === 'en' ? "Prompt saved! (Ctrl+S)" : "הפרומפט נשמר בענן בהצלחה! (Ctrl+S)", "success");
        } else if (selectedPromptRef.current) {
          handleSave(selectedPromptRef.current);
          showToast(appLanguage === 'en' ? "Prompt saved & synced! (Ctrl+S)" : "הפרומפט סונכרן ונשמר! (Ctrl+S)", "success");
        } else {
          handleManualSync();
        }
        break;
      case 'sandbox':
        if (selectedPromptRef.current || (isEditingRef.current && editingPromptRef.current)) {
          const startBtn = document.getElementById('start-test-btn');
          const sendBtn = document.getElementById('sandbox-send-btn');
          if (startBtn) startBtn.click();
          else if (sendBtn) sendBtn.click();
          else {
            const chatInput = document.getElementById('sandbox-chat-input');
            chatInput?.focus();
          }
        } else {
          if (currentView !== 'library') setCurrentView('library');
          const all = usePromptStore.getState().prompts;
          if (all.length > 0) setSelectedPromptId(all[0].id);
        }
        break;
      case 'new':
        handleOpenNewEditor();
        break;
      case 'palette':
        setIsPaletteOpen(true);
        break;
      case 'search':
        if (isReadingModeRef.current) setIsReadingMode(false);
        if (currentView !== 'library') setCurrentView('library');
        setTimeout(() => {
          searchRef.current?.focus();
          searchRef.current?.select();
          setIsSearchFocused(true);
        }, 50);
        break;
      case 'esc':
        setIsReadingMode(false);
        break;
      case 'help':
        setIsShortcutsOpen(true);
        break;
      case 'qr':
        if (selectedPromptRef.current) {
          setQrTargetPrompt(selectedPromptRef.current);
          setIsQrModalOpen(true);
        } else {
          showToast(appLanguage === 'en' ? "Select a prompt first to generate QR" : "בחר פרומפט תחילה ליצירת קוד QR", "info");
        }
        break;
      case 'share':
        if (selectedPromptRef.current) {
          setShareTargetPrompt(selectedPromptRef.current);
          setIsShareModalOpen(true);
        } else {
          showToast(appLanguage === 'en' ? "Select a prompt first to share" : "בחר פרומפט תחילה לשיתוף", "info");
        }
        break;
      case 'template':
        if (selectedPromptRef.current) {
          setTemplateTargetPrompt(selectedPromptRef.current);
          setIsTemplateModalOpen(true);
        } else {
          showToast(appLanguage === 'en' ? "Select a prompt first to fill template" : "בחר פרומפט תחילה למילוי שדות תבנית", "info");
        }
        break;
    }
  };

    
  const handleDragStart = (e: React.DragEvent, promptId: string) => {
    e.dataTransfer.setData('text/plain', promptId);
    e.dataTransfer.effectAllowed = 'move';
  };

  
  const handlePromptDragOver = (e: React.DragEvent, targetPromptId: string) => {
    e.preventDefault();
    if (dragOverPromptId !== targetPromptId) {
      setDragOverPromptId(targetPromptId);
    }
  };

  const handlePromptDrop = async (e: React.DragEvent, targetPromptId: string) => {
    e.preventDefault();
    e.stopPropagation(); // prevent folder drop
    setDragOverPromptId(null);
    const draggedPromptId = e.dataTransfer.getData('text/plain');
    if (!draggedPromptId || draggedPromptId === targetPromptId) return;

    if (sortOrder !== 'custom') {
      setSortOrder('custom');
    }

    const list = [...filteredPrompts];
    const draggedIdx = list.findIndex(p => p.id === draggedPromptId);
    const targetIdx = list.findIndex(p => p.id === targetPromptId);
    
    if (draggedIdx === -1 || targetIdx === -1) return;

    const draggedPrompt = list[draggedIdx];
    list.splice(draggedIdx, 1);
    list.splice(targetIdx, 0, draggedPrompt);
    
    const updates = list.map((p, index) => ({
      ...p,
      sortIndex: index
    }));
    
    setPrompts(prev => prev.map(p => {
      const updated = updates.find(u => u.id === p.id);
      return updated ? updated : p;
    }));

    if (auth.currentUser) {
      for (const p of updates) {
        setDoc(doc(db, "users", auth.currentUser.uid, "prompts", p.id), { sortIndex: p.sortIndex }, { merge: true }).catch(console.error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFolderId !== folderId) {
      setDragOverFolderId(folderId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolderId(null);
  };

  const handleDropToFolder = async (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDragOverFolderId(null);
    const promptId = e.dataTransfer.getData('text/plain');
    if (!promptId || folderId === 'all' || folderId === 'favorites') return;
    
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt && prompt.folder !== folderId) {
      const updated = {...prompt, folder: folderId, updatedAt: new Date().toISOString()};
      const newPrompts = prompts.map(p => p.id === promptId ? updated : p);
      setPrompts(newPrompts);
      if (user) {
        await setDoc(doc(db, "users", user.uid, "prompts", promptId), updated);
        showToast('הועתק וסונכרן בהצלחה', 'success');
      } else {
        localStorage.setItem("promptvault_prompts", JSON.stringify(newPrompts));
      }
    }
  };

  const handleDuplicate = async (prompt: Prompt) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)),
      title: `${prompt.title} (העתק)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [{ content: prompt.content, updatedAt: new Date().toISOString() }],
      useCount: 0,
      favorite: false
    };
    
    const updated = [newPrompt, ...prompts];
    setPrompts(updated);
    if (user) {
      await setDoc(doc(db, "users", user.uid, "prompts", newPrompt.id), newPrompt);
    } else {
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
    }
    
    setPulsingPromptId(newPrompt.id);
    setTimeout(() => setPulsingPromptId(null), 1500);
  };
  
  const handleDelete = async (id: string) => {
    // if (!window.confirm("האם למחוק את הפרומפט?")) return; // Bypassing due to iframe restrictions
    if (user) {
      setSyncStatus("syncing");
      await deleteDoc(doc(db, "users", user.uid, "prompts", id));
      setSyncStatus("saved");
      setTimeout(() => setSyncStatus("idle"), 2000);
    } else {
      const updated = prompts.filter(p => p.id !== id);
      setPrompts(updated);
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
    }
    if (selectedPromptId === id) setSelectedPromptId(null);
  };

  
  
  const handleCreateFolder = async (name: string) => {
    const newFolder = {
      id: "folder_" + (crypto.randomUUID ? (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)) : Math.random().toString(36).substring(2)),
      name,
      createdAt: new Date().toISOString()
    };
    if (user) {
      await setDoc(doc(db, "users", user.uid, "folders", newFolder.id), newFolder);
    } else {
      const updated = [...folders, newFolder];
      setFolders(updated);
      localStorage.setItem("promptvault_folders", JSON.stringify(updated));
    }
    setSelectedFolder(newFolder.id);
    setCurrentView("library");
  };

  
  const handleSnooze = (minutes: number) => {
    if (duePrompt) {
      const newDue = new Date();
      newDue.setMinutes(newDue.getMinutes() + minutes);
      handleSave({...duePrompt, dueDate: newDue.toISOString()});
      setDuePrompt(null);
    }
  };


  const handleBulkAutoTagUntagged = async () => {
    const untagged = prompts.filter(p => !p.tags || p.tags.length === 0);
    if (untagged.length === 0) {
      showToast(appLanguage === 'en' ? "All prompts are already tagged!" : "כל הפרומפטים כבר מתויגים!", "success");
      return;
    }
    
    showToast(appLanguage === 'en' ? "Starting AI auto-tagging..." : "מתחיל תיוג אוטומטי בעזרת AI...", "info");
    
    let taggedCount = 0;
    const updatedPrompts = [...prompts];
    for (const p of untagged) {
      try {
        const key = localStorage.getItem("promptvault_gemini_key") || "";
        const res = await apiFetch('/api/gemini/classify', {
          method: 'POST',
          headers: { 
             "Content-Type": "application/json",
             ...(key ? { "x-gemini-api-key": key } : {})
          },
          body: JSON.stringify({ content: p.content })
        });
        const data = await res.json();
        if (data.tags && data.tags.length > 0) {
          if (user) {
            await updateDoc(doc(db, "users", user.uid, "prompts", p.id), { tags: data.tags, updatedAt: new Date().toISOString() });
          }
          const idx = updatedPrompts.findIndex(item => item.id === p.id);
          if (idx !== -1) {
            updatedPrompts[idx] = { ...updatedPrompts[idx], tags: data.tags, updatedAt: new Date().toISOString() };
          }
          taggedCount++;
        }
      } catch (err) {
        console.error("Failed to auto-tag", p.id, err);
      }
    }

    setPrompts(updatedPrompts);
    localStorage.setItem("promptvault_prompts", JSON.stringify(updatedPrompts));
    showToast(appLanguage === 'en' ? `Auto-tagging completed! (${taggedCount} tagged)` : `תיוג אוטומטי הושלם! (${taggedCount} תוייגו)`, "success");
  };

  const handleBulkTag = async (tagsToAdd: string[], tagsToRemove: string[]) => {
    if (user) {
      const idsToMove = moveTargetId ? [moveTargetId] : selectedIds;
      for (const id of idsToMove) {
        const p = prompts.find(pr => pr.id === id);
        if (p) {
          let newTags = [...(p.tags || [])];
          for (const t of tagsToAdd) if (!newTags.includes(t)) newTags.push(t);
          newTags = newTags.filter(t => !tagsToRemove.includes(t));
          await updateDoc(doc(db, "users", user.uid, "prompts", id), { tags: newTags, updatedAt: new Date().toISOString() });
        }
      }
    } else {
      let updated = [...prompts];
      const idsToMove = moveTargetId ? [moveTargetId] : selectedIds;
      for (const id of idsToMove) {
        const index = updated.findIndex(p => p.id === id);
        if (index > -1) {
          let newTags = [...(updated[index].tags || [])];
          for (const t of tagsToAdd) if (!newTags.includes(t)) newTags.push(t);
          newTags = newTags.filter(t => !tagsToRemove.includes(t));
          updated[index] = { ...updated[index], tags: newTags, updatedAt: new Date().toISOString() };
        }
      }
      setPrompts(updated);
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
    }
    setSelectedIds([]);
  };


  const [isRefining, setIsRefining] = useState(false);
  const [isAutoTagging, setIsAutoTagging] = useState(false);


  const handlePasteAndParse = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      // Extract variables in format {{var}} or [var]
      const varRegex = /\{\{([^}]+)\}\}/g;
      const bracketRegex = /\[([^\]]+)\]/g;
      
      let match;
      const detectedTags = new Set<string>();
      
      while ((match = varRegex.exec(text)) !== null) {
        if (match[1] && match[1].length > 1 && match[1].length < 20) {
          detectedTags.add(match[1].toLowerCase().replace(/[^a-zא-ת0-9\-]/g, ''));
        }
      }
      while ((match = bracketRegex.exec(text)) !== null) {
        if (match[1] && match[1].length > 1 && match[1].length < 20) {
          detectedTags.add(match[1].toLowerCase().replace(/[^a-zא-ת0-9\-]/g, ''));
        }
      }

      setEditingPrompt(prev => {
        if (!prev) return prev;
        const currentTags = prev.tags || [];
        const newTags = [...new Set([...currentTags, ...detectedTags])].filter(Boolean);
        return {
          ...prev,
          content: (prev.content ? prev.content + '\n\n' : '') + text,
          tags: newTags
        };
      });
      showToast("הטקסט הודבק ופוענח", "success");
    } catch (e) {
      showToast("שגיאה בגישה ללוח הגזירים", "error");
    }
  };

  const handleRefinePrompt = async () => {
    if (!editingPrompt || !editingPrompt.content) return;
    setIsRefining(true);
    try {
      const response = await apiFetch('/api/gemini/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: editingPrompt.content,
          mode: 'enhance',
          language: editingPrompt.language || 'he'
        })
      });
      const data = await response.json();
      if (data.text) {
        setEditingPrompt(prev => prev ? {...prev, content: data.text} : prev);
        showToast('הפרומפט שודרג בהצלחה ע"י AI', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('שגיאה בשדרוג הפרומפט', 'error');
    }
    setIsRefining(false);
  };

  const handleAutoTag = async () => {
    if (!editingPrompt || !editingPrompt.content) return;
    setIsAutoTagging(true);
    try {
      const response = await apiFetch('/api/gemini/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editingPrompt.content
        })
      });
      const data = await response.json();
      if (data.tags || data.platform || data.title) {
        setEditingPrompt(prev => prev ? {
          ...prev, 
          tags: Array.from(new Set([...(prev.tags || []), ...(data.tags || [])])),
          platform: prev.platform === 'General' && data.platform ? data.platform : prev.platform,
          title: prev.title === 'פרומפט חדש' && data.title ? data.title : prev.title
        } : prev);
        showToast('תגיות הוספו בהצלחה ע"י AI', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('שגיאה בסיווג הפרומפט', 'error');
    }
    setIsAutoTagging(false);
  };

  const handleSmartAssign = () => {
    if (!editingPrompt) return;
    const text = (editingPrompt.content || '') + ' ' + (editingPrompt.tags?.join(' ') || '') + ' ' + (editingPrompt.title || '');
    const lower = text.toLowerCase();
    let bestFolder = editingPrompt.folder;
    for (const f of folders) {
      if (f.name && lower.includes(f.name.toLowerCase())) {
        bestFolder = f.id;
        break;
      }
    }
    setEditingPrompt({...editingPrompt, folder: bestFolder});
  };

  
  const handlePublishToCommunity = async (prompt: Prompt) => {
    if (!user) {
      showToast(appLanguage === 'en' ? "Please sign in to publish to community" : "יש להתחבר כדי לפרסם בקהילה", "error");
      return;
    }
    try {
      const publicPrompt = {
        ...prompt,
        type: prompt.type || 'text',
        authorId: user.uid,
        authorName: user.displayName || 'משתמש אנונימי',
        authorPhoto: user.photoURL || undefined,
        likes: [user.uid],
        commentsCount: 0,
        trendingScore: 100
      };
      await setDoc(doc(db, "public_prompts", prompt.id), publicPrompt);
      const scoreRes = recordScoreAction('publish_prompt');
      if (scoreRes.unlockedAchievements.length > 0) {
        showToast(`פורסם לקהילה! נפתח הישג: ${scoreRes.unlockedAchievements.map(a => a.title).join(', ')} 🏆`, "success");
      } else {
        showToast(appLanguage === 'en' ? "Prompt published to community successfully! (+50 pts)" : "הפרומפט פורסם לקהילה בהצלחה! (+50 נק')", "success");
      }
    } catch (e) {
      showToast(appLanguage === 'en' ? "Failed to publish to community" : "שגיאה בפרסום לקהילה", "error");
    }
  };

  const handleCopyList = () => {
    const selected = prompts.filter(p => selectedIds.includes(p.id));
    const markdown = selected.map(p => `# ${p.title}\n${p.content}`).join('\n\n');
    navigator.clipboard.writeText(markdown);
    showToast("הועתק כרשימה!", "success");
    setSelectedIds([]);
  };

  const handleBulkMove = async (folderId: string) => {
    if (user) {
      for (const id of selectedIds) {
        await updateDoc(doc(db, "users", user.uid, "prompts", id), {
          folder: folderId,
          updatedAt: new Date().toISOString()
        });
      }
    } else {
      let updated = [...prompts];
      for (const id of selectedIds) {
        const index = updated.findIndex(p => p.id === id);
        if (index > -1) {
          updated[index] = { ...updated[index], folder: folderId, updatedAt: new Date().toISOString() };
        }
      }
      setPrompts(updated);
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
    }
    setSelectedIds([]);
  };



  const handleBulkRename = async (pattern: string, startNumber: number) => {
    let currentNumber = startNumber;
    let updatedPrompts = [...prompts];
    
    for (const id of selectedIds) {
      const newTitle = pattern.replace('{n}', currentNumber.toString());
      if (user) {
        await updateDoc(doc(db, "users", user.uid, "prompts", id), { title: newTitle, updatedAt: new Date().toISOString() });
      } else {
        const index = updatedPrompts.findIndex(p => p.id === id);
        if (index > -1) {
          updatedPrompts[index] = { ...updatedPrompts[index], title: newTitle, updatedAt: new Date().toISOString() };
        }
      }
      currentNumber++;
    }
    
    if (!user) {
      setPrompts(updatedPrompts);
      localStorage.setItem('promptvault_prompts', JSON.stringify(updatedPrompts));
    }
    showToast("השמות שונו בהצלחה", "success");
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    
    // We will simulate soft delete first
    const idsToDelete = [...selectedIds];
    const itemsToDelete = prompts.filter(p => idsToDelete.includes(p.id));
    
    // Remove from UI immediately
    setPrompts(prev => prev.filter(p => !idsToDelete.includes(p.id)));
    setSelectedIds([]);
    if (selectedPromptId && idsToDelete.includes(selectedPromptId)) setSelectedPromptId(null);
    
    // Set a toast with Undo action
    let timeoutId: any;
    
    const executeDelete = async () => {
      if (user) {
        for (const id of idsToDelete) {
          await deleteDoc(doc(db, "users", user.uid, "prompts", id));
        }
      } else {
        let stored: any[] = [];
        try {
          stored = JSON.parse(localStorage.getItem("promptvault_prompts") || "[]");
        } catch {
          stored = [];
        }
        const updated = stored.filter((p: any) => !idsToDelete.includes(p.id));
        localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
      }
    };
    
    timeoutId = setTimeout(executeDelete, 5000);
    
    setToast({
      message: `${idsToDelete.length} פריטים הועברו לאשפה`,
      type: 'success',
      action: {
        label: 'בטל פעולה',
        onClick: () => {
          clearTimeout(timeoutId);
          // Restore items
          setPrompts(prev => [...prev, ...itemsToDelete]);
          showToast('פעולת המחיקה בוטלה', 'info');
        }
      }
    });
  };




  const handleExportPDF = (prompt: Prompt) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: system-ui, sans-serif; direction: rtl; padding: 40px; color: #111;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">${prompt.title}</h1>
        <div style="font-size: 14px; color: #666; margin-bottom: 24px;">תאריך: ${new Date().toLocaleDateString('he-IL')}</div>
        ${prompt.tags ? `<div style="margin-bottom: 24px;">${prompt.tags.map(t => `<span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 8px;">${t}</span>`).join('')}</div>` : ''}
        <pre style="background: #f8fafc; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 14px; white-space: pre-wrap; line-height: 1.6; border: 1px solid #e2e8f0;">${prompt.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        ${prompt.exampleOutput ? `
          <h3 style="font-size: 16px; margin-top: 32px; font-weight: bold;">פלט לדוגמה:</h3>
          <pre style="background: #f8fafc; padding: 20px; border-radius: 8px; font-family: monospace; font-size: 14px; white-space: pre-wrap; line-height: 1.6; border: 1px solid #e2e8f0;">${prompt.exampleOutput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        ` : ''}
      </div>
    `;
    
    html2pdf().from(element).set({
      margin: 10,
      filename: `${prompt.title || 'prompt'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
    showToast('ה-PDF בתהליך יצירה', 'info');
  };

  
  const handleExportCSV = () => {
    // Standard CSV export
    const headers = ["ID", "Title", "Content", "Platform", "Topic", "Folder", "Tags", "Favorite", "Language", "Created At", "Use Count"];
    
    // Function to escape CSV values
    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      let str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        str = str.replace(/"/g, '""');
        return `"${str}"`;
      }
      return str;
    };
    
    const rows = prompts.map(p => {
      return [
        escapeCSV(p.id),
        escapeCSV(p.title),
        escapeCSV(p.content),
        escapeCSV(p.platform),
        escapeCSV(p.topic || ''),
        escapeCSV(folders.find(f => f.id === p.folder)?.name || p.folder),
        escapeCSV((p.tags || []).join(', ')),
        escapeCSV(p.favorite ? 'Yes' : 'No'),
        escapeCSV(p.language),
        escapeCSV(p.createdAt),
        escapeCSV(p.useCount || 0)
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = `promptvault_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('יוצא בהצלחה כ-CSV', 'success');
  };

  
  const handleExportMarkdown = () => {
    let md = "# Prompt Vault Backup\n\n";
    // Group prompts by folder
    const grouped = prompts.reduce((acc, p) => {
      const folderName = folders.find(f => f.id === p.folder)?.name || "ללא תיקייה";
      if (!acc[folderName]) acc[folderName] = [];
      acc[folderName].push(p);
      return acc;
    }, {} as Record<string, typeof prompts>);

    for (const [folder, pList] of Object.entries(grouped as Record<string, typeof prompts>)) {
      md += `## 📁 ${folder}\n\n`;
      for (const p of pList) {
        md += `### ${p.title}\n\n`;
        if (p.tags && p.tags.length > 0) md += `**תגיות:** ${p.tags.join(', ')}\n\n`;
        md += `**פלטפורמה:** ${p.platform}\n\n`;
        md += "```text\n" + (p.content || "") + "\n```\n\n";
      }
    }

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `promptvault_backup_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    showToast('יוצא בהצלחה כ-Markdown', 'success');
  };

  const handleExportAll = () => {
    const backupData = {
      version: 2,
      app: 'PandaPrompt',
      exportedAt: new Date().toISOString(),
      stats: {
        totalPrompts: prompts.length,
        totalFolders: folders.length,
        totalTags: allTags.length,
      },
      prompts,
      folders,
      tags: allTags
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `pandaprompt_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast(`גיבוי מלא הורד בהצלחה! (${prompts.length} פרומפטים, ${folders.length} תיקיות)`, 'success');
  };

  const handleImportAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        let importedPrompts: Prompt[] = [];
        let importedFolders: Folder[] = [];

        if (Array.isArray(raw)) {
          // Legacy array of prompts
          importedPrompts = raw;
        } else if (raw && Array.isArray(raw.prompts)) {
          // Complete full backup object
          importedPrompts = raw.prompts;
          if (Array.isArray(raw.folders)) {
            importedFolders = raw.folders;
          }
        } else {
          showToast('פורמט קובץ גיבוי לא תקין', 'error');
          return;
        }

        if (user) {
          // Restore folders
          for (const f of importedFolders) {
            await setDoc(doc(db, "users", user.uid, "folders", f.id), f);
          }
          // Restore prompts
          for (const p of importedPrompts) {
            await setDoc(doc(db, "users", user.uid, "prompts", p.id), p);
          }
          showToast(`שוחזרו ${importedPrompts.length} פרומפטים ו-${importedFolders.length} תיקיות וסונכרנו לענן!`, 'success');
        } else {
          // Restore local state
          if (importedFolders.length > 0) {
            const mergedFolders = [...importedFolders, ...folders.filter(f => !importedFolders.some(i => i.id === f.id))];
            setFolders(mergedFolders);
            localStorage.setItem("promptvault_folders", JSON.stringify(mergedFolders));
          }
          const mergedPrompts = [...importedPrompts, ...prompts.filter(p => !importedPrompts.some(i => i.id === p.id))];
          setPrompts(mergedPrompts);
          localStorage.setItem("promptvault_prompts", JSON.stringify(mergedPrompts));
          showToast(`שוחזרו בהצלחה ${importedPrompts.length} פרומפטים ו-${importedFolders.length} תיקיות!`, 'success');
        }
      } catch (err) {
        showToast('שגיאה בקריאת קובץ הגיבוי', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleBulkExport = () => {
    const toExport = prompts.filter(p => selectedIds.includes(p.id));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(toExport, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "prompts_export.json";
    a.click();
    setSelectedIds([]);
  };

  
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const cursor = e.target.selectionStart;
    setEditingPrompt({...editingPrompt, content: val, language: detectLanguage(val)});
    
    // Check if we just typed '$(...'
    const textBeforeCursor = val.substring(0, cursor);
    const match = textBeforeCursor.match(/\$\(([a-zA-Z]*)$/);
    if (match) {
      setVarSuggest({show: true, filter: match[1].toUpperCase(), cursorIndex: cursor});
    } else {
      setVarSuggest({show: false, filter: '', cursorIndex: 0});
    }
  };

  const handleVarSelect = (varName: string) => {
    if (!editingPrompt?.content) return;
    const content = editingPrompt.content;
    const before = content.substring(0, varSuggest.cursorIndex - varSuggest.filter.length);
    const after = content.substring(varSuggest.cursorIndex);
    const newContent = before + varName + ')' + after;
    setEditingPrompt({...editingPrompt, content: newContent, language: detectLanguage(newContent)});
    setVarSuggest({show: false, filter: '', cursorIndex: 0});
  };

  const handleEnhancePrompt = async () => {
    if (!editingPrompt?.content) return;
    setIsEnhancing(true);
    try {
      const res = await apiFetch("/api/gemini/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptText: editingPrompt.content })
      });
      const data = await res.json();
      if (data.text) {
        setEditingPrompt(prev => ({ ...prev, content: data.text, aiOptimized: true }));
      }
    } catch (e) {
      showToast("שגיאה בשיפור הפרומפט", "error");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopy = (content: string, id?: string) => {
    const targetPrompt = id ? prompts.find(pr => pr.id === id) : selectedPrompt;
    if (id && targetPrompt) {
      handleSave({...targetPrompt, useCount: (targetPrompt.useCount || 0) + 1, lastUsedAt: new Date().toISOString(), usageHistory: [...(targetPrompt.usageHistory || []), new Date().toISOString()]});
    }

    const placeholders = extractPlaceholders(content, targetPrompt?.customPlaceholders || []);
    if (placeholders.length > 0) {
      setTemplateTargetPrompt(targetPrompt || selectedPrompt);
      setIsTemplateModalOpen(true);
    } else {
      navigator.clipboard.writeText(content);
      showToast("הועתק ללוח!", "success");
    }
  };

  const toggleFavorite = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;

    const nextFav = !prompt.favorite;
    const now = new Date().toISOString();
    const updatedPrompt: Prompt = { ...prompt, favorite: nextFav, updatedAt: now };

    const updatedPrompts = prompts.map(p => p.id === id ? updatedPrompt : p);
    setPrompts(updatedPrompts);
    localStorage.setItem("promptvault_prompts", JSON.stringify(updatedPrompts));

    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "prompts", id), {
          favorite: nextFav,
          updatedAt: now
        });
      } catch (err) {
        console.error("Error updating favorite status in Firestore", err);
      }
    }

    showToast(
      nextFav
        ? (appLanguage === 'en' ? 'Added to favorites ⭐' : 'נוסף למועדפים ⭐')
        : (appLanguage === 'en' ? 'Removed from favorites' : 'הוסר מהמועדפים'),
      'info'
    );
  };
  
  const handleQuickArchive = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const prompt = prompts.find(p => p.id === id);
    if (prompt) handleSave({ ...prompt, folder: "archive" });
  };


  const handleQuickTest = (prompt: Prompt) => {
    setSelectedPromptId(prompt.id);
    setIsEditing(false);
  };

  return (
    <MotionConfig reducedMotion={battery.powerSaveMode ? "always" : "user"}>
      <div className={`flex flex-col md:flex-row h-screen overflow-hidden font-sans bg-[#fcfcfc] dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200 relative`}>
        <OfflineIndicator />
        
        {/* Sidebar Mobile Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}
        
        {/* Sidebar */}
      <AppSidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isFullscreen={isFullscreen || isReadingMode}
        t={t}
        setShowImportModal={setShowImportModal}
        handleBulkAutoTagUntagged={handleBulkAutoTagUntagged}
        setIsGeneratorOpen={setIsGeneratorOpen}
        setIsBulkOrganizerOpen={setIsBulkOrganizerOpen}
        setIsMetaPromptOpen={setIsMetaPromptOpen}
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
        prompts={prompts}
        isSmartGrouping={isSmartGrouping}
        setIsSmartGrouping={setIsSmartGrouping}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDropToFolder={handleDropToFolder}
        dragOverFolderId={dragOverFolderId}
        handleExportCSV={handleExportCSV}
        handleExportMarkdown={handleExportMarkdown}
        handleExportAll={handleExportAll}
        lastSyncTime={lastSyncTime}
        syncStatus={syncStatus as any}
        onManualSync={handleManualSync}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        appLanguage={appLanguage}
        setAppLanguage={setAppLanguage}
        user={user}
        logout={logout}
        setIsAuthModalOpen={setIsAuthModalOpen}
        showToast={showToast}
        onOpenScoreModal={() => setIsScoreModalOpen(true)}
        scorePoints={scoreData.points}
        levelTitle={scoreData.levelTitle}
        battery={battery}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
        onOpenRemindersModal={() => setIsRemindersModalOpen(true)}
        remindersCount={totalRemindersCount}
        overdueRemindersCount={overdueRemindersCount}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />
  {/* Streamlined Mobile Header */}
    {!isReadingMode && (
      <header className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-white/95 dark:bg-[#111]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 shrink-0 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(true)} 
            className="p-1.5 -ms-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="פתח תפריט תיקיות וארכיון"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold tracking-tight text-base text-slate-900 dark:text-white">PandaPrompt</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mobile Reminders Bell */}
          <button
            type="button"
            onClick={() => setIsRemindersModalOpen(true)}
            className="relative p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400"
            title="תזכורות משימה"
          >
            <Bell className="w-4 h-4 text-amber-500" />
            {totalRemindersCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center">
                {totalRemindersCount}
              </span>
            )}
          </button>

          {/* Mobile Score Badge */}
          <button
            type="button"
            onClick={() => setIsScoreModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            title="הישגים וניקוד"
          >
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>{scoreData.points}</span>
          </button>

          {/* Theme Switcher Button */}
          <button 
            type="button"
            onClick={cycleTheme}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title="החלף מצב תצוגה (כהה/בהיר)"
          >
            {isCurrentlyDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Language Toggle */}
          <button 
            type="button"
            onClick={() => setAppLanguage(appLanguage === 'he' ? 'en' : 'he')}
            className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            title={appLanguage === 'he' ? 'Switch to English' : 'החלף לעברית'}
          >
            {appLanguage === 'he' ? 'EN' : 'עב'}
          </button>
        </div>
      </header>
    )}

            {/* Main Area */}
      <div className="flex-1 flex overflow-hidden bg-slate-50/50 dark:bg-[#0a0a0a]">
        {currentView === "profile" ? (
          <div className="flex-1 overflow-y-auto">
            <UserProfileView onShowToast={showToast} />
          </div>
        ) : currentView === "community" ? (
          <div className="flex-1 overflow-y-auto">
            <CommunityView 
              userPrompts={prompts}
              onImport={(p) => { setEditingPrompt(p); setIsEditing(true); setSelectedPromptId(null); setCurrentView("library"); }} 
              onShowToast={showToast} 
            />
          </div>
        ) : currentView === "dashboard" ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <DashboardView 
              prompts={prompts} 
              folders={folders} 
              platforms={PLATFORMS} 
              onSelectPrompt={(id) => { setSelectedPromptId(id); setIsEditing(false); setCurrentView("library"); }}
              onCreatePrompt={handleOpenNewEditor}
              onNavigateToLibrary={(folderId) => { if (folderId) setSelectedFolder(folderId); setCurrentView("library"); }}
              onSelectTag={(tag) => {
                setTagFilter(tag);
                setSelectedFolder("all");
                setCurrentView("library");
                showToast(`סינון לפי תגית #${tag}`, "info");
              }}
              powerSaveMode={battery.powerSaveMode}
              togglePowerSaveMode={battery.togglePowerSaveMode}
            />
          </div>
        ) : currentView === "insights" ? (
          <div className="flex-1 overflow-y-auto p-8">
            <InsightsDashboard 
              prompts={prompts} 
              platforms={PLATFORMS} 
              folders={folders} 
              language={appLanguage} 
              powerSaveMode={battery.powerSaveMode}
              togglePowerSaveMode={battery.togglePowerSaveMode}
            />
          </div>
        ) : currentView === "templates" ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <TemplatesGallery onImport={(template) => {
              setEditingPrompt({...template, isAIOptimized: true});
              setIsEditing(true);
              setSelectedPromptId(null);
              setCurrentView("library");
            }} />
          </div>
        ) : currentView === "workflows" ? (
          <div className="flex-1 p-0 overflow-hidden">
            <VisualWorkflow prompts={prompts} />
          </div>
        ) : (
          <>
            {/* List View */}
            <div className={`flex flex-col border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] transition-all duration-300 ${selectedPromptId || isEditing ? "hidden md:flex w-80 shrink-0" : "flex-1"} ${(isFullscreen || isReadingMode) ? "!hidden" : ""}`}>
              <div className={`p-4 border-b border-slate-200 dark:border-white/10 ${!selectedPromptId && !isEditing ? "md:p-8" : ""}`}>
                {!selectedPromptId && !isEditing && (
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        {selectedFolder === "all" ? <FolderOpen className="w-5 h-5" /> : 
                         selectedFolder === "favorites" ? <Heart className="w-5 h-5 text-red-500" /> : 
                         selectedFolder === "archive" ? <Download className="w-5 h-5" /> : 
                         selectedFolder === "community" ? <Sparkles className="w-5 h-5 text-purple-500" /> : 
                         selectedFolder === "type:image" ? <Sparkles className="w-5 h-5 text-purple-500" /> : 
                         selectedFolder === "type:code" ? <Code2 className="w-5 h-5 text-emerald-500" /> : 
                         selectedFolder === "type:text" ? <FileText className="w-5 h-5 text-blue-500" /> : 
                         selectedFolder.startsWith("smart-tag:") ? <Tags className="w-5 h-5 text-purple-600 dark:text-purple-400" /> : 
                         <FolderIcon className="w-5 h-5" />}
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {selectedFolder === "all" ? "כל הפרומפטים" : 
                         selectedFolder === "favorites" ? "מועדפים" : 
                         selectedFolder === "archive" ? "ארכיון" : 
                         selectedFolder === "community" ? "תבניות קהילה" : 
                         selectedFolder === "type:image" ? "פרומפטי תמונות AI" : 
                         selectedFolder === "type:code" ? "פרומפטי קוד ותכנות" : 
                         selectedFolder === "type:text" ? "פרומפטי טקסט (LLM)" : 
                         selectedFolder.startsWith("smart-tag:") ? `תגית: ${selectedFolder.replace("smart-tag:", "")}` : 
                         folders.find(f => f.id === selectedFolder)?.name || "ספריה"}
                      </h2>
                    </div>
                    {selectedFolder !== "community" && (
                      <div className="flex items-center gap-2">
                        {/* Reminders Bell Button */}
                        <button
                          type="button"
                          onClick={() => setIsRemindersModalOpen(true)}
                          className="relative p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-600 dark:text-slate-400"
                          title="מרכז תזכורות ומשימות"
                        >
                          <Bell className="w-4 h-4 text-amber-500" />
                          {totalRemindersCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">
                              {totalRemindersCount}
                            </span>
                          )}
                        </button>

                        {/* Categories Manager Button */}
                        <button
                          type="button"
                          onClick={() => setIsManageCategoriesOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-600 dark:text-slate-400 text-xs font-bold"
                          title="ניהול קטגוריות"
                        >
                          <Layers className="w-4 h-4 text-indigo-500" />
                          <span className="hidden sm:inline">קטגוריות</span>
                        </button>

                        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                          <button title="תצוגת גריד" onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}><LayoutGrid className="w-4 h-4" /></button>
                          <button title="תצוגת רשימה" onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-[#222] shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}><List className="w-4 h-4" /></button>
                          
                        </div>
                        <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-600 dark:text-slate-400">
                          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Search & Filters */}
                <div className="flex flex-col gap-3">
                  {/* Search Input Bar + Advanced Search + Mobile Filter Button */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        ref={searchRef}
                        type="text"
                        placeholder="חפש לפי מילות מפתח, תגיות (#tag), קטגוריות או תוכן..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchSubmit(searchQuery);
                          }
                        }}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl ps-10 pe-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title={t('search.clearFilters')}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Live Quick Access Results & Recent Searches Dropdown */}
                      {isSearchFocused && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden max-h-96 flex flex-col">
                          {searchQuery.trim().length > 0 ? (
                            <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                              <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-[#111] flex items-center justify-between">
                                <span>תוצאות מהירות ({filteredPrompts.slice(0, 5).length})</span>
                                <span className="text-[10px] text-indigo-500 font-bold">לחץ לגישה מיידית</span>
                              </div>
                              {filteredPrompts.slice(0, 5).map(p => {
                                const pCat = p.categories && p.categories.length > 0 
                                  ? categories.find(c => c.id === p.categories![0] || c.name === p.categories![0])
                                  : null;
                                return (
                                  <div
                                    key={p.id}
                                    onMouseDown={() => {
                                      setSelectedPromptId(p.id);
                                      setIsEditing(false);
                                      setCurrentView("library");
                                      setIsSearchFocused(false);
                                    }}
                                    className="p-3 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors"
                                  >
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-900 dark:text-white truncate text-xs flex items-center gap-1.5">
                                        <span>{p.title}</span>
                                        {pCat && (
                                          <span 
                                            className="px-1.5 py-0.2 rounded text-[9px] font-bold text-white shrink-0"
                                            style={{ backgroundColor: pCat.color }}
                                          >
                                            {pCat.name}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        {p.content}
                                      </p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 shrink-0">
                                      פתח
                                    </span>
                                  </div>
                                );
                              })}
                              {filteredPrompts.length === 0 && (
                                <div className="p-4 text-center text-xs text-slate-400">
                                  לא נמצאו תוצאות עבור &quot;{searchQuery}&quot;
                                </div>
                              )}
                              <div 
                                onMouseDown={() => {
                                  setIsAdvancedSearchOpen(true);
                                  setIsSearchFocused(false);
                                }}
                                className="p-2.5 bg-slate-50 dark:bg-[#111] hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                <span>פתח בחלונית חיפוש מתקדם...</span>
                              </div>
                            </div>
                          ) : recentSearches.length > 0 ? (
                            <div>
                              <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-[#111]">{t('search.recentSearches')}</div>
                              {recentSearches.map((search, idx) => (
                                <div 
                                  key={idx} 
                                  className="px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 border-t border-slate-100 dark:border-white/5 text-sm"
                                  onMouseDown={() => {
                                    setSearchQuery(search);
                                    setIsSearchFocused(false);
                                  }}
                                >
                                  <Search className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-700 dark:text-slate-300">{search}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Advanced Search Button */}
                    <button
                      type="button"
                      onClick={() => setIsAdvancedSearchOpen(true)}
                      className="px-3.5 py-2.5 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-2xs"
                      title="חיפוש מתקדם לפי מילות מפתח, תגיות, קטגוריות ותיקיות"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="hidden sm:inline">חיפוש מתקדם</span>
                    </button>

                    {/* Mobile Filters & Sort Bottom Sheet Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsMobileFilterOpen(true)}
                      className={`md:hidden px-3.5 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold shrink-0 transition-all ${
                        activeFilterCount > 0 
                          ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400 shadow-xs' 
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                      title="סננים ומיון"
                    >
                      <Filter className="w-4 h-4" />
                      <span>סננים</span>
                      {activeFilterCount > 0 && (
                        <span className="w-4.5 h-4.5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Mobile Quick Category / Type Pills */}
                  <div className="md:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedFolder.startsWith("type:") || favoriteOnlyFilter) {
                          if (selectedFolder.startsWith("type:")) setSelectedFolder("all");
                          setFavoriteOnlyFilter(false);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        !selectedFolder.startsWith("type:") && !favoriteOnlyFilter
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      הכל
                    </button>

                    <button
                      type="button"
                      onClick={() => setFavoriteOnlyFilter(!favoriteOnlyFilter)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        favoriteOnlyFilter
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${favoriteOnlyFilter ? 'fill-white' : 'text-amber-500'}`} />
                      <span>מועדפים</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFolder(selectedFolder === 'type:text' ? 'all' : 'type:text')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        selectedFolder === 'type:text'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>טקסט</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFolder(selectedFolder === 'type:image' ? 'all' : 'type:image')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        selectedFolder === 'type:image'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>תמונות</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFolder(selectedFolder === 'type:code' ? 'all' : 'type:code')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        selectedFolder === 'type:code'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>קוד</span>
                    </button>
                  </div>

                  {/* Desktop Quick Tag Chips Row */}
                  {topTagsWithCounts.length > 0 && (
                    <div className="hidden md:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 me-1">
                        {t('search.tagFilter')}:
                      </span>
                      <button
                        type="button"
                        onClick={() => setTagFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                          tagFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {t('library.allTags')}
                      </button>
                      {topTagsWithCounts.map(([tag, count]) => {
                        const isSelected = tagFilter === tag;
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => setTagFilter(isSelected ? 'all' : tag)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span>#{tag}</span>
                            <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Desktop Advanced Filters & Sorting Controls */}
                  <div className="hidden md:flex items-center justify-between gap-2 flex-wrap pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Prompt Type Filter Dropdown */}
                      <div className="relative shrink-0">
                        <select
                          value={selectedFolder.startsWith("type:") ? selectedFolder : "all_types"}
                          onChange={(e) => {
                            if (e.target.value === "all_types") {
                              if (selectedFolder.startsWith("type:")) setSelectedFolder("all");
                            } else {
                              setSelectedFolder(e.target.value);
                            }
                          }}
                          className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                          title="סנן לפי סוג פרומפט"
                        >
                          <option value="all_types">סוג פרומפט: הכל</option>
                          <option value="type:text">📝 טקסט / LLM</option>
                          <option value="type:image">🎨 תמונות AI</option>
                          <option value="type:code">💻 קוד ותכנות</option>
                        </select>
                      </div>

                      {/* Category / Platform Dropdown */}
                      <div className="relative shrink-0">
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                          title={t('search.categoryFilter')}
                        >
                          <option value="all">{t('search.allCategories')}</option>
                          {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Tag Dropdown Combobox */}
                      <TagCombobox 
                        tags={Array.from(new Set(prompts.flatMap(p => p.tags || []))).filter(Boolean)} 
                        selectedTag={tagFilter} 
                        onSelectTag={setTagFilter} 
                      />

                      {/* Favorites-Only Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setFavoriteOnlyFilter(!favoriteOnlyFilter)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                          favoriteOnlyFilter
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 ring-2 ring-amber-400/20'
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                        }`}
                        title={t('search.favoritesOnly')}
                      >
                        <Star className={`w-3.5 h-3.5 ${favoriteOnlyFilter ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                        <span className="hidden sm:inline">{t('search.favoritesOnly')}</span>
                      </button>
                    </div>

                    {/* Sort Order Button & Dropdown */}
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-3 py-2 rounded-xl border flex items-center justify-center transition-colors text-xs font-bold gap-1.5 ${
                          showFilters || sortOrder !== 'recent' 
                            ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400' 
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                        }`}
                        title={t('search.sortOrder')}
                      >
                        <Filter className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('search.sortOrder')}</span>
                        {sortOrder !== 'recent' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                      </button>
                      {showFilters && (
                        <div className="absolute left-0 top-full mt-2 w-52 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[60]">
                          <div className="text-[10px] font-bold text-slate-400 mb-1.5 px-3 py-1 uppercase tracking-wider">{t('search.sortOrder')}</div>
                          <button onClick={() => { setSortOrder('relevance'); setShowFilters(false); }} className={`w-full text-start px-3 py-2 rounded-xl text-xs font-semibold transition-all ${sortOrder === 'relevance' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>הכי רלוונטי (Relevance)</button>
                          <button onClick={() => { setSortOrder('recent'); setShowFilters(false); }} className={`w-full text-start px-3 py-2 rounded-xl text-xs font-semibold transition-all ${sortOrder === 'recent' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>{t('search.sortRecent')}</button>
                          <button onClick={() => { setSortOrder('created'); setShowFilters(false); }} className={`w-full text-start px-3 py-2 rounded-xl text-xs font-semibold transition-all ${sortOrder === 'created' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>{t('search.sortCreated')}</button>
                          <button onClick={() => { setSortOrder('alpha'); setShowFilters(false); }} className={`w-full text-start px-3 py-2 rounded-xl text-xs font-semibold transition-all ${sortOrder === 'alpha' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>{t('search.sortAlpha')}</button>
                          <button onClick={() => { setSortOrder('popular'); setShowFilters(false); }} className={`w-full text-start px-3 py-2 rounded-xl text-xs font-semibold transition-all ${sortOrder === 'popular' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>{t('search.sortPopular')}</button>
                          <button onClick={() => { setSortOrder('custom'); setShowFilters(false); }} className={`w-full text-start px-3 py-2 rounded-xl text-xs font-semibold transition-all ${sortOrder === 'custom' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'}`}>{t('search.sortCustom')}</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Filters & Counter Banner */}
                  {(searchQuery || tagFilter !== 'all' || categoryFilter !== 'all' || favoriteOnlyFilter) && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/5 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-400 text-[11px]">{t('search.activeFilters')}:</span>
                        {searchQuery && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
                            "{searchQuery}"
                            <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                          </span>
                        )}
                        {categoryFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
                            {categoryFilter}
                            <button onClick={() => setCategoryFilter('all')}><X className="w-3 h-3" /></button>
                          </span>
                        )}
                        {tagFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium">
                            #{tagFilter}
                            <button onClick={() => setTagFilter('all')}><X className="w-3 h-3" /></button>
                          </span>
                        )}
                        {favoriteOnlyFilter && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
                            ⭐ {t('search.favoritesOnly')}
                            <button onClick={() => setFavoriteOnlyFilter(false)}><X className="w-3 h-3" /></button>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setTagFilter('all');
                            setCategoryFilter('all');
                            setFavoriteOnlyFilter(false);
                          }}
                          className="text-xs text-red-500 hover:text-red-600 font-semibold underline ms-1"
                        >
                          {t('search.clearFilters')}
                        </button>
                      </div>

                      <span className="text-[11px] font-bold text-slate-400 shrink-0">
                        {filteredPrompts.length} {t('search.matchingPrompts')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt Library Cards List */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-[#0a0a0a] pb-24 md:pb-6">
                {filteredPrompts.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center mt-8 max-w-xl mx-auto">
                    <div className="w-24 h-24 mb-4 relative drop-shadow-md">
                      <Bot className="w-full h-full text-blue-500 opacity-20" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('library.empty')}</h3>
                    <p className="text-sm text-slate-500 font-medium mb-6">
                      {t('library.emptySubtitle')}
                    </p>
                    <button onClick={() => { setEditingPrompt({}); setIsEditing(true); setSelectedPromptId(null); }} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md flex items-center gap-2 transition-colors">
                      <Plus className="w-4 h-4" /> {t('library.createNew')}
                    </button>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${viewMode === 'grid' && !selectedPromptId && !isEditing ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                    {filteredPrompts.map((p, idx) => {
                      const textToMeasure = p.content || '';
                      const wordCount = textToMeasure.trim() ? (textToMeasure.trim().match(/\S+/g) || []).length : 0;
                      const charCount = textToMeasure.length;
                      const isDragging = draggingPromptId === p.id;

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          whileHover={{ y: -2, transition: { duration: 0.15 } }}
                          whileTap={{ scale: 0.985 }}
                          animate={
                            isDragging
                              ? {
                                  rotate: [-1.4, 1.4, -1.4, 1.4, 0],
                                  scale: 1.03,
                                  transition: { repeat: Infinity, duration: 0.22, ease: "easeInOut" }
                                }
                              : { rotate: 0, scale: 1, opacity: 1, y: 0 }
                          }
                          transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                          key={p.id}
                          draggable={true}
                          // @ts-ignore
                          onDragStart={(e: any) => {
                            e.dataTransfer.setData('text/plain', p.id);
                            setDraggingPromptId(p.id);
                          }}
                          onDragEnd={() => {
                            setDraggingPromptId(null);
                          }}
                          onDragOver={(e) => handlePromptDragOver(e, p.id)}
                          onDrop={(e) => handlePromptDrop(e, p.id)}
                          onTouchStart={(e) => {
                            // @ts-ignore
                            e.currentTarget.dataset.startX = e.touches[0].clientX;
                          }}
                          onTouchEnd={(e: any) => {
                            const startX = parseFloat(e.currentTarget.dataset.startX || '0');
                            const endX = e.changedTouches[0].clientX;
                            const diff = endX - startX;
                            if (diff < -70) {
                              if (window.confirm('האם למחוק פרומפט זה?')) {
                                handleDelete(p.id);
                              }
                            } else if (diff > 70) {
                              handleCopy(p.content, p.id);
                              showToast('הטקסט הועתק בהחלקה!', 'success');
                            }
                          }}
                          onClick={() => { setSelectedPromptId(p.id); setIsEditing(false); }}
                          className={`group relative p-4 bg-white dark:bg-[#1a1a1a] border rounded-2xl cursor-pointer transition-all duration-200 select-none overflow-hidden ${
                            selectedPromptId === p.id 
                              ? 'border-indigo-500 ring-2 ring-indigo-500/25 bg-indigo-50/30 dark:bg-indigo-950/20 shadow-md' 
                              : dragOverPromptId === p.id 
                                ? 'border-blue-400 border-dashed scale-[1.02]' 
                                : isDragging
                                  ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-2xl ring-2 ring-indigo-500/40 cursor-grabbing'
                                  : 'border-slate-200/80 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-900/50 hover:shadow-md'
                          }`}
                        >
                          {/* Active Card Indicator Strip */}
                          {selectedPromptId === p.id && (
                            <div className="absolute inset-y-0 start-0 w-1 bg-indigo-600 rounded-s-2xl" />
                          )}
                          {/* Card Top: Platform, Folder & Quick Actions */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider shrink-0 ${
                                p.platform === 'ChatGPT' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                                p.platform === 'Claude' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                                p.platform === 'Gemini' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
                                p.platform === 'Midjourney' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' :
                                'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                              }`}>
                                {p.platform || 'כללי'}
                              </span>

                              {p.folder && (
                                <span className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                                  <span>/</span>
                                  <span>{folders.find(f => f.id === p.folder)?.name || ''}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* AI Summarize Button */}
                              <button
                                type="button"
                                onClick={(e) => handleSummarizePrompt(p.id, p.content, p.title, e)}
                                className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                                title="סכם עם AI (Gemini)"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>

                              {/* One-Click Quick Run */}
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleQuickTest(p); }} 
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors" 
                                title="הרצה מהירה ב-Playground"
                              >
                                <Play className="w-3.5 h-3.5" />
                              </button>

                              {/* Task Reminder Bell */}
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setQuickReminderPrompt(p); }} 
                                className={`p-1.5 rounded-lg transition-all duration-200 ${
                                  p.reminder 
                                    ? p.reminder.isCompleted
                                      ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                                      : new Date(p.reminder.dateTime) < new Date()
                                        ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 animate-pulse'
                                        : 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                                    : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/10'
                                }`} 
                                title={
                                  p.reminder 
                                    ? `תזכורת: ${new Date(p.reminder.dateTime).toLocaleString('he-IL')}${p.reminder.note ? ` - ${p.reminder.note}` : ''}`
                                    : 'הגדר תזכורת לפרומפט זה'
                                }
                              >
                                <Bell className={`w-3.5 h-3.5 ${p.reminder ? 'fill-current' : ''}`} />
                              </button>

                              {/* One-Click Quick Copy */}
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleCopy(p.content, p.id); }} 
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors" 
                                title="העתק פרומפט"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Favorite Star */}
                              <button 
                                type="button"
                                onClick={(e) => toggleFavorite(p.id, e)} 
                                className={`p-1.5 rounded-lg transition-all duration-200 ${
                                  p.favorite 
                                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' 
                                    : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-white/10'
                                }`} 
                                title={p.favorite ? t('card.removeFromFavorites') : t('card.addToFavorites')}
                              >
                                <Star className={`w-3.5 h-3.5 ${p.favorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* Card Title */}
                          <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1.5">
                            {p.title}
                          </h3>

                          {/* Card Description / AI Summary */}
                          {p.summary ? (
                            <div className="mb-2 p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">סיכום AI</span>
                                <p className="line-clamp-2">{p.summary}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                              {p.description || p.content}
                            </p>
                          )}

                          {/* Categories Badges */}
                          {p.categories && p.categories.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap mb-2">
                              {p.categories.map(cId => {
                                const cat = categories.find(c => c.id === cId || c.name === cId);
                                const name = cat?.name || cId;
                                const color = cat?.color || '#6366f1';
                                return (
                                  <span
                                    key={cId}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border"
                                    style={{
                                      backgroundColor: `${color}15`,
                                      color: color,
                                      borderColor: `${color}35`
                                    }}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                    <span>{name}</span>
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {/* Active Reminder Pill on Card */}
                          {p.reminder && (
                            <div 
                              onClick={(e) => { e.stopPropagation(); setQuickReminderPrompt(p); }}
                              className={`mb-2.5 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center justify-between gap-1.5 border transition-all ${
                                p.reminder.isCompleted
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                                  : new Date(p.reminder.dateTime) < new Date()
                                    ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                                    : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                              }`}
                              title="לחץ לעריכה או סיום התזכורת"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  {p.reminder.isCompleted
                                    ? 'תזכורת הושלמה ✓'
                                    : new Date(p.reminder.dateTime) < new Date()
                                      ? `באיחור: ${new Date(p.reminder.dateTime).toLocaleDateString('he-IL')} ${new Date(p.reminder.dateTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
                                      : `תזכורת: ${new Date(p.reminder.dateTime).toLocaleDateString('he-IL')} ${new Date(p.reminder.dateTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`}
                                </span>
                              </div>
                              {p.reminder.priority === 'urgent' && (
                                <span className="shrink-0 text-[9px] bg-rose-200/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 px-1 py-0.2 rounded font-black">
                                  דחוף
                                </span>
                              )}
                            </div>
                          )}

                          {/* Card Footer: Metadata & Unique Tag Colors */}
                          <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-400">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {p.tags?.slice(0, 2).map(t => {
                                const tColor = getTagColor(t);
                                return (
                                  <div key={t} className="inline-flex items-center gap-1 group/tag">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); setTagFilter(t); }}
                                      className="px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors flex items-center gap-1 border"
                                      style={{
                                        backgroundColor: `${tColor}15`,
                                        color: tColor,
                                        borderColor: `${tColor}35`
                                      }}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tColor }} />
                                      <span>#{t}</span>
                                    </button>
                                    <input 
                                      type="color" 
                                      value={tColor} 
                                      title="בחר צבע לתגית"
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        setTagColors(prev => ({ ...prev, [t]: e.target.value }));
                                      }}
                                      className="w-3 h-3 opacity-0 group-hover/tag:opacity-100 transition-opacity cursor-pointer rounded border-0 bg-transparent"
                                    />
                                  </div>
                                );
                              })}
                              {p.tags && p.tags.length > 2 && (
                                <span className="text-[10px] text-slate-400">+{p.tags.length - 2}</span>
                              )}
                            </div>

                            <span className="shrink-0 text-[11px] text-slate-400">
                              {wordCount} {t('card.words')}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">

      <React.Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>

            {isEditing ? (
    <PromptEditor 
      editingPrompt={editingPrompt}
      setEditingPrompt={setEditingPrompt}
      isRefining={isRefining}
      handleRefinePrompt={handleRefinePrompt}
      showInlineDiff={showInlineDiff}
      setShowInlineDiff={setShowInlineDiff}
      handleSave={handleSave}
      
      
      folders={folders}
      setIsNewFolderModalOpen={setIsNewFolderModalOpen}
      categories={categories}
      onOpenManageCategories={() => setIsManageCategoriesOpen(true)}
      
      prompts={prompts}
      checkPromptValidation={checkPromptValidation}
      
      handleVarSelect={handleVarSelect}
      t={t}
      setIsRefining={setIsRefining}
      setIsEditing={setIsEditing}
      setSelectedPromptId={setSelectedPromptId}
      setCurrentView={setCurrentView}
      showToast={showToast}
      handleMagicSuggest={handleMagicSuggest}
      isMagicSuggesting={isMagicSuggesting}
      magicSuggestions={magicSuggestions}
      setMagicSuggestions={setMagicSuggestions}
      handleContentChange={handleContentChange}
      varSuggest={varSuggest}
      COMMON_VARS={COMMON_VARS}
      mlSuggestedFolder={mlSuggestedFolder}
      handleAutoTag={handleAutoTag}
      isAutoTagging={isAutoTagging}
      allTags={allTags}
      onOpenTemplateModal={() => { setTemplateTargetPrompt(editingPrompt); setIsTemplateModalOpen(true); }}
    />
  ) : selectedPrompt ? (
    isReadingMode ? (
      <div 
        key="focus-reading" 
        onScroll={handleReadingScroll}
        className="fixed inset-0 z-50 flex flex-col bg-[#fdfdfd] dark:bg-[#0c0c0c] text-slate-800 dark:text-slate-100 overflow-y-auto selection:bg-indigo-500/20"
      >
        {/* Subtle Reading Progress Bar at the Top */}
        <div className="sticky top-0 z-[60] h-[3px] bg-slate-200/50 dark:bg-white/10 w-full overflow-hidden shrink-0">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 transition-all duration-100 ease-out"
            style={{ width: `${readingScrollProgress}%` }}
          />
        </div>

        {/* Minimal Focus Header */}
        <div className="sticky top-[3px] z-50 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsReadingMode(false)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all shadow-xs shrink-0"
              title="יציאה ממצב קריאה (Esc)"
            >
              <X className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>יציאה ממצב קריאה</span>
              <kbd className="hidden sm:inline px-1 py-0.5 text-[10px] bg-white dark:bg-black/40 rounded border border-slate-300 dark:border-white/10 font-mono">Esc</kbd>
            </button>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block shrink-0" />

            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
              {selectedPrompt.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Reading stats */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 px-2.5 py-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200/60 dark:border-white/5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>{Math.max(1, Math.ceil((selectedPrompt.content.match(/\S+/g) || []).length / 200))} {t('detail.readingTime')}</span>
              <span>•</span>
              <span>{(selectedPrompt.content.match(/\S+/g) || []).length} מילים</span>
            </div>

            {/* Read Aloud Button (Web Speech API) with gentle pulsing effect */}
            <button
              type="button"
              onClick={handleToggleReadAloud}
              className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
                isReadingAloud 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-400 ring-offset-2 ring-offset-white dark:ring-offset-[#111] animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]' 
                  : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300'
              }`}
              title={isReadingAloud ? 'עצור הקראה קולית' : 'הקרא תוכן בקול רם (Web Speech API)'}
            >
              {isReadingAloud ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>עצור הקראה</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="hidden sm:inline">הקרא בקול</span>
                </>
              )}
            </button>

            {/* Export Image Card Button in Reading Mode */}
            <button
              onClick={() => { setExportingPrompt(selectedPrompt); setIsExportModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-xs"
              title="ייצא כרטיס כתמונה (html2canvas)"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">תמונה</span>
            </button>

            {/* QR Code Button */}
            <button
              onClick={() => { setQrTargetPrompt(selectedPrompt); setIsQrModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-xs"
              title="סרוק ושתף כקוד QR במובייל (Ctrl+Q)"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">QR</span>
            </button>

            {/* Social Share Button in Reading Mode */}
            <button
              onClick={() => { setShareTargetPrompt(selectedPrompt); setIsShareModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs transition-all shadow-xs"
              title="שתף ברשתות חברתיות וקישור ייחודי (Ctrl+Shift+S)"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">שיתוף</span>
            </button>

            {/* Fill Template Button in Reading Mode */}
            <button
              onClick={() => { setTemplateTargetPrompt(selectedPrompt); setIsTemplateModalOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-all shadow-xs"
              title="מלא שדות תבנית והעתק פרומפט סופי (Alt+T)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">מילוי תבנית</span>
            </button>

            {/* Speed Reading RSVP Button */}
            <button
              onClick={() => setIsSpeedReadingOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-all shadow-xs"
              title="הצג קריאה מהירה (RSVP - מילה אחת בכל פעם)"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">קריאה מהירה</span>
            </button>

            {/* Bookmarks / TOC Button */}
            <button
              onClick={() => setIsBookmarksDrawerOpen(!isBookmarksDrawerOpen)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shadow-xs"
              title="פתח סימניות וניווט מהיר בטקסט"
            >
              <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">סימניות</span>
            </button>

            {/* Font size adjustment */}
            <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-xl p-0.5 border border-slate-200/60 dark:border-white/10">
              <button
                onClick={() => setReadingFontSize('normal')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${readingFontSize === 'normal' ? 'bg-white dark:bg-[#222] shadow-xs text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="גודל גופן רגיל"
              >
                A-
              </button>
              <button
                onClick={() => setReadingFontSize('large')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${readingFontSize === 'large' ? 'bg-white dark:bg-[#222] shadow-xs text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="גודל גופן מוגדל"
              >
                A
              </button>
              <button
                onClick={() => setReadingFontSize('xlarge')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${readingFontSize === 'xlarge' ? 'bg-white dark:bg-[#222] shadow-xs text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                title="גודל גופן גדול במיוחד"
              >
                A+
              </button>
            </div>

            {/* Copy button */}
            <button
              onClick={() => handleCopy(selectedPrompt.content, selectedPrompt.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs"
              title="העתק תוכן פרומפט"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">העתק תוכן</span>
            </button>
          </div>
        </div>

        {/* Clean, Distraction-Free Prompt Content with Smooth Entrance Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 md:p-14 lg:py-16"
        >
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.28 }}
            className="mb-6 flex flex-wrap items-center gap-2"
          >
            <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${PLATFORMS[selectedPrompt.platform]?.bgColor} ${PLATFORMS[selectedPrompt.platform]?.textColor}`}>
              {PLATFORMS[selectedPrompt.platform]?.name || selectedPrompt.platform}
            </span>
            {selectedPrompt.folder && (
              <span className="text-[11px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <FolderIcon className="w-3 h-3" />
                {folders.find(f => f.id === selectedPrompt.folder)?.name || t('nav.noFolder')}
              </span>
            )}
            {(selectedPrompt.tags || []).map(t => {
              const tColor = getTagColor(t);
              return (
                <span key={t} className="text-[11px] px-2.5 py-0.5 rounded-lg font-semibold border" style={{ backgroundColor: `${tColor}15`, color: tColor, borderColor: `${tColor}35` }}>
                  #{t}
                </span>
              );
            })}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.35 }}
            className="bg-white dark:bg-[#141414] p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-xs"
          >
            <FormattedPromptView 
              content={selectedPrompt.content}
              isFullscreen={true}
              showToast={showToast}
            />
          </motion.div>

          {selectedPrompt.exampleOutput && (
            <motion.div 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.35 }}
              className="mt-8 p-6 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/20 dark:to-purple-950/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30"
            >
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>תוצאה מופקת לדוגמה (Sample Output)</span>
              </div>
              <div className="text-base font-sans leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap" dir="auto">
                {selectedPrompt.exampleOutput}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    ) : (
      <motion.div 
        key={`prompt-detail-${selectedPrompt.id}`} 
        initial={{ opacity: 0, x: appLanguage === 'en' ? -60 : 60, scale: 0.985 }} 
        animate={{ opacity: 1, x: 0, scale: 1 }} 
        exit={{ opacity: 0, x: appLanguage === 'en' ? 40 : -40, scale: 0.985 }} 
        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }} 
        className="flex-1 flex flex-col h-full bg-white dark:bg-[#111] overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto flex flex-col pb-28 md:pb-8">
        {/* Mobile Top App Bar for Prompt Detail */}
        <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-b border-slate-100 dark:border-white/5 sticky top-0 z-20 shrink-0">
          <button 
            type="button"
            onClick={() => setSelectedPromptId(null)} 
            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-bold text-xs py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
            <span>חזרה לרשימה</span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* Edit (Mobile) */}
            {!selectedPrompt.isReadOnly && (
              <button 
                type="button"
                onClick={() => { setEditingPrompt(selectedPrompt); setIsEditing(true); }} 
                className="flex items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>עריכה</span>
              </button>
            )}

            {/* Reading Mode (Mobile) */}
            <button
              type="button"
              onClick={() => setIsReadingMode(true)}
              className="p-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl"
              title="מצב קריאה"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Mobile Actions Sheet Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileDetailActionsOpen(true)}
              className="p-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 rounded-xl hover:bg-slate-200 transition-colors"
              title="פעולות נוספות"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Fast Action & Copy Banner */}
        <div className="md:hidden px-4 py-2.5 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-slate-100 dark:border-white/5 flex items-center gap-2 shrink-0">
          <button 
            type="button"
            onClick={() => handleCopy(selectedPrompt.content, selectedPrompt.id)}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <Copy className="w-4 h-4" />
            <span>העתק פרומפט עכשיו</span>
          </button>
          <button 
            type="button"
            onClick={(e) => toggleFavorite(selectedPrompt.id, e)}
            className={`p-2.5 rounded-xl border transition-all ${
              selectedPrompt.favorite 
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-500 shadow-xs' 
                : 'bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 text-slate-400'
            }`}
            title={selectedPrompt.favorite ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            <Star className={`w-4 h-4 ${selectedPrompt.favorite ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>
        </div>
        
        <div className="p-6 lg:p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-start justify-between gap-6 shrink-0">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ComplexityScoreBadge content={selectedPrompt.content} title={selectedPrompt.title} />
              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium border border-slate-200 dark:border-white/10 text-slate-500">
                {Math.max(1, Math.ceil((selectedPrompt.content.match(/\S+/g) || []).length / 200))} {t('detail.readingTime')}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${PLATFORMS[selectedPrompt.platform]?.bgColor} ${PLATFORMS[selectedPrompt.platform]?.textColor}`}>
                {PLATFORMS[selectedPrompt.platform]?.name || selectedPrompt.platform}
              </span>
              {selectedPrompt.folder && (
                 <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                   <FolderIcon className="w-3 h-3" />
                   {folders.find(f => f.id === selectedPrompt.folder)?.name || t('nav.noFolder')}
                 </span>
              )}
              {(selectedPrompt.tags || []).map(t => {
                const tColor = getTagColor(t);
                return (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-md font-medium border" style={{ backgroundColor: `${tColor}15`, color: tColor, borderColor: `${tColor}35` }}>
                    {t}
                  </span>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight break-words">{selectedPrompt.title}</h1>
              {selectedPrompt.isReadOnly && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg whitespace-nowrap">
                  <Lock className="w-3 h-3" />
                  קריאה בלבד
                </span>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {/* Primary Action: Copy Prompt */}
            <button 
              type="button"
              onClick={() => handleCopy(selectedPrompt.content, selectedPrompt.id)} 
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all"
              title="העתק תוכן פרומפט"
            >
              <Copy className="w-4 h-4" />
              <span>העתק</span>
            </button>

            {/* Test in Sandbox */}
            <button 
              type="button"
              onClick={() => handleQuickTest(selectedPrompt)} 
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-xs sm:text-sm transition-all"
              title="בדוק והרץ את הפרומפט ב-Playground"
            >
              <Play className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>הרץ</span>
            </button>

            {/* Edit */}
            {!selectedPrompt.isReadOnly && (
              <button 
                type="button"
                onClick={() => { setEditingPrompt(selectedPrompt); setIsEditing(true); }} 
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs sm:text-sm transition-all"
                title="ערוך פרומפט"
              >
                <Edit3 className="w-4 h-4 text-slate-500" />
                <span>עריכה</span>
              </button>
            )}

            {/* Fill Template */}
            <button 
              type="button"
              onClick={() => { setTemplateTargetPrompt(selectedPrompt); setIsTemplateModalOpen(true); }} 
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs sm:text-sm transition-all"
              title="מילוי שדות בתבנית"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span className="hidden xl:inline">תבנית</span>
            </button>

            {/* Task Reminder Button */}
            <button 
              type="button"
              onClick={() => setQuickReminderPrompt(selectedPrompt)} 
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl font-bold text-xs sm:text-sm transition-all ${
                selectedPrompt.reminder
                  ? selectedPrompt.reminder.isCompleted
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                    : new Date(selectedPrompt.reminder.dateTime) < new Date()
                      ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                      : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                  : 'border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200'
              }`}
              title="הגדר או ערוך תזכורת למשימה לפרומפט זה"
            >
              <Bell className={`w-4 h-4 ${selectedPrompt.reminder ? 'fill-current' : 'text-slate-500'}`} />
              <span className="hidden xl:inline">
                {selectedPrompt.reminder 
                  ? selectedPrompt.reminder.isCompleted 
                    ? 'תזכורת הושלמה' 
                    : 'תזכורת פעילה' 
                  : 'תזכורת'}
              </span>
            </button>

            {/* More Actions Dropdown Menu */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setIsDetailMoreMenuOpen(!isDetailMoreMenuOpen)}
                className={`p-2 rounded-xl border transition-all ${
                  isDetailMoreMenuOpen 
                    ? 'bg-slate-100 dark:bg-white/10 border-indigo-400 text-indigo-600' 
                    : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
                }`}
                title="פעולות נוספות"
              >
                <MoreHorizontal className="w-4.5 h-4.5" />
              </button>

              {isDetailMoreMenuOpen && (
                <div 
                  className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-[#181818] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-1.5 z-50 space-y-1 text-right text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => { setIsReadingMode(true); setIsDetailMoreMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                  >
                    <span>מצב קריאה ממוקד</span>
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { setExportingPrompt(selectedPrompt); setIsExportModalOpen(true); setIsDetailMoreMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                  >
                    <span>ייצוא כרטיס תמונה (PNG)</span>
                    <Camera className="w-4 h-4 text-indigo-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShareTargetPrompt(selectedPrompt); setIsShareModalOpen(true); setIsDetailMoreMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                  >
                    <span>שיתוף ורשתות</span>
                    <Share2 className="w-4 h-4 text-purple-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { setQrTargetPrompt(selectedPrompt); setIsQrModalOpen(true); setIsDetailMoreMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                  >
                    <span>קוד QR לשיתוף במובייל</span>
                    <QrCode className="w-4 h-4 text-indigo-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { handleExportPDF(selectedPrompt); setIsDetailMoreMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                  >
                    <span>ייצוא מסמך PDF</span>
                    <FileDown className="w-4 h-4 text-red-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { handleDuplicate(selectedPrompt); setIsDetailMoreMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                  >
                    <span>שכפל פרומפט</span>
                    <CopyPlus className="w-4 h-4 text-blue-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMoveTargetId(selectedPrompt.id); setIsMoveModalOpen(true); setIsDetailMoreMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                  >
                    <span>העבר לתיקייה</span>
                    <FolderOpen className="w-4 h-4 text-amber-500" />
                  </button>

                  {selectedPrompt.history && selectedPrompt.history.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setShowHistory(!showHistory); setIsDetailMoreMenuOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                    >
                      <span>היסטוריית גרסאות</span>
                      <History className="w-4 h-4 text-amber-500" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => { handleSave({...selectedPrompt, isReadOnly: !selectedPrompt.isReadOnly}); setIsDetailMoreMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                  >
                    <span>{selectedPrompt.isReadOnly ? 'בטל נעילה' : 'נעל לקריאה בלבד'}</span>
                    {selectedPrompt.isReadOnly ? <Unlock className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-slate-400" />}
                  </button>

                  <div className="pt-1 mt-1 border-t border-slate-100 dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => { setPromptToDelete(selectedPrompt.id); setIsDetailMoreMenuOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 font-bold transition-colors"
                    >
                      <span>מחק פרומפט</span>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Close Detail Panel */}
            <button 
              type="button"
              onClick={() => setSelectedPromptId(null)} 
              className="p-2 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" 
              title="סגור תצוגה מקדימה"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
                    </div>

                    <div className="px-6 lg:px-8 py-3 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 shrink-0 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        <motion.div key={selectedPrompt.useCount} initial={{ scale: 1.5, color: "#3b82f6" }} animate={{ scale: 1, color: "inherit" }} transition={{ duration: 0.3 }} className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-500"/> שימושים: {selectedPrompt.useCount || 0}</motion.div>
                        {selectedPrompt.lastUsedAt && <div className="flex items-center gap-1.5"><History className="w-4 h-4 text-emerald-500"/> שימוש אחרון: {new Date(selectedPrompt.lastUsedAt).toLocaleDateString('he-IL')}</div>}
                      </div>
                    </div>
                    {showHistory && selectedPrompt.history && selectedPrompt.history.length > 0 ? (
                      
                      <div className="flex-1 flex flex-col p-4 md:p-6 bg-slate-50 dark:bg-[#0a0a0a] overflow-hidden relative">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0 bg-white dark:bg-[#111] p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                          <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-amber-500" />
                            <span className="font-bold text-slate-700 dark:text-slate-300">היסטוריית גרסאות</span>
                          </div>
                          
                          <div className="flex flex-col md:flex-row items-center gap-3">
                            <select 
                              value={historyIndex} 
                              onChange={e => setHistoryIndex(Number(e.target.value))}
                              className="text-xs bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 outline-none text-slate-700 dark:text-slate-300 font-mono"
                            >
                              {selectedPrompt.history.map((h, i) => (
                                <option key={i} value={i}>{h.versionName ? `[${h.versionName}] ` : ""}גרסה ישנה: {new Date(h.updatedAt).toLocaleString("he-IL")}</option>
                              ))}
                            </select>
                            <span className="text-slate-400 text-xs px-2 font-bold">מול</span>
                            <select 
                              value={historyCompareIndex} 
                              onChange={e => setHistoryCompareIndex(Number(e.target.value))}
                              className="text-xs bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 outline-none text-slate-700 dark:text-slate-300 font-mono"
                            >
                              <option value={-1}>{selectedPrompt.currentVersionName ? `[${selectedPrompt.currentVersionName}] ` : ""}גרסה נוכחית (היום)</option>
                              {selectedPrompt.history.map((h, i) => (
                                <option key={i} value={i}>{h.versionName ? `[${h.versionName}] ` : ""}גרסה ישנה: {new Date(h.updatedAt).toLocaleString("he-IL")}</option>
                              ))}
                            </select>
                            
                            <button 
                              onClick={() => {
                                if(selectedPrompt.history![historyIndex]) handleSave({...selectedPrompt, content: selectedPrompt.history![historyIndex].content});
                                setShowHistory(false);
                                showToast('הפרומפט שוחזר לגרסה הקודמת בהצלחה', 'success');
                              }}
                              className="mr-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              שחזר לצד ימין
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-xs font-bold text-slate-500 mb-2 shrink-0 px-1">
                          השוואה בין {historyCompareIndex === -1 ? "הגרסה הנוכחית" : `${selectedPrompt.history[historyCompareIndex]?.versionName ? `[${selectedPrompt.history[historyCompareIndex]?.versionName}]` : ""} גרסה מתאריך ${new Date(selectedPrompt.history[historyCompareIndex]?.updatedAt || Date.now()).toLocaleDateString('he-IL')}`} (שמאל) ל{selectedPrompt.history[historyIndex]?.versionName ? `[${selectedPrompt.history[historyIndex]?.versionName}] ` : ""}גרסה מתאריך {new Date(selectedPrompt.history[historyIndex]?.updatedAt || Date.now()).toLocaleDateString('he-IL')} (ימין)
                        </div>
                        <DiffViewer 
                          oldText={selectedPrompt.history[historyIndex]?.content || ''} 
                          newText={historyCompareIndex === -1 ? selectedPrompt.content : (selectedPrompt.history[historyCompareIndex]?.content || '')} 
                        />
                      </div>
                    ) : (
                      <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-[#0a0a0a] selection:bg-blue-200 dark:selection:bg-blue-900/50 flex flex-col 2xl:flex-row gap-8">
                        <div className="flex-1 flex flex-col min-w-0">
                        {selectedPrompt.lastUsedAt && differenceInDays(new Date(), new Date(selectedPrompt.lastUsedAt)) > 30 && (
                          <div className="mx-6 lg:mx-8 mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800 dark:text-amber-400">
                              <span className="font-bold">שים לב:</span> לא עשית שימוש בפרומפט זה מעל ל-30 ימים. 
                              שקול לארכב או למחוק פרומפטים שאינם רלוונטיים כדי לשמור על סביבת העבודה מסודרת.
                            </div>
                          </div>
                        )}

                          {/* Categories and Tags Bar */}
                          {((selectedPrompt.categories && selectedPrompt.categories.length > 0) || (selectedPrompt.tags && selectedPrompt.tags.length > 0)) && (
                            <div className="flex items-center gap-1.5 flex-wrap mb-4">
                              {selectedPrompt.categories?.map(cId => {
                                const cat = categories.find(c => c.id === cId || c.name === cId);
                                const name = cat?.name || cId;
                                const color = cat?.color || '#6366f1';
                                return (
                                  <span
                                    key={cId}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl border shadow-2xs"
                                    style={{
                                      backgroundColor: `${color}15`,
                                      color: color,
                                      borderColor: `${color}35`
                                    }}
                                  >
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                    <span>{name}</span>
                                  </span>
                                );
                              })}
                              {selectedPrompt.tags?.map(t => {
                                const tColor = getTagColor(t);
                                return (
                                  <span key={t} className="text-xs px-2.5 py-0.5 rounded-lg font-semibold border flex items-center gap-1.5" style={{ backgroundColor: `${tColor}15`, color: tColor, borderColor: `${tColor}35` }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tColor }} />
                                    <span>#{t}</span>
                                  </span>
                                );
                              })}
                            </div>
                          )}

                          {/* Interactive Prompt Task Reminder Banner */}
                          {selectedPrompt.reminder && (
                            <div className={`mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all ${
                              selectedPrompt.reminder.isCompleted
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                                : new Date(selectedPrompt.reminder.dateTime) < new Date()
                                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                            }`}>
                              <div className="flex items-start sm:items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                  selectedPrompt.reminder.isCompleted
                                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                                    : new Date(selectedPrompt.reminder.dateTime) < new Date()
                                      ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 animate-pulse'
                                      : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                                }`}>
                                  <Bell className="w-5 h-5" />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                      {selectedPrompt.reminder.isCompleted
                                        ? 'משימת תזכורת הושלמה'
                                        : new Date(selectedPrompt.reminder.dateTime) < new Date()
                                          ? 'תזכורת באיחור!'
                                          : 'תזכורת עבודה מתוזמנת'}
                                    </span>
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                      selectedPrompt.reminder.priority === 'urgent'
                                        ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                                        : selectedPrompt.reminder.priority === 'high'
                                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                                          : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                                    }`}>
                                      {selectedPrompt.reminder.priority === 'urgent' ? 'דחוף ⚡' : selectedPrompt.reminder.priority === 'high' ? 'עדיפות גבוהה' : 'עדיפות רגילה'}
                                    </span>
                                  </div>

                                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-2 flex-wrap">
                                    <span className="flex items-center gap-1 font-mono font-bold">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      {new Date(selectedPrompt.reminder.dateTime).toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                      {' בשעה '}
                                      {new Date(selectedPrompt.reminder.dateTime).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {selectedPrompt.reminder.note && (
                                      <span className="text-slate-500 dark:text-slate-400 truncate italic">
                                        — &quot;{selectedPrompt.reminder.note}&quot;
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = selectedPrompt.reminder!;
                                    const updated = { ...current, isCompleted: !current.isCompleted };
                                    handleSaveReminder(selectedPrompt.id, updated);
                                    showToast(updated.isCompleted ? 'התזכורת סומנה כהושלמה!' : 'התזכורת הוחזרה למצב פעיל', 'success');
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                    selectedPrompt.reminder.isCompleted
                                      ? 'bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:bg-slate-50'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                  }`}
                                >
                                  {selectedPrompt.reminder.isCompleted ? 'בטל השלמה' : 'סמן כהושלם ✓'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setQuickReminderPrompt(selectedPrompt)}
                                  className="px-3 py-1.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
                                >
                                  ערוך
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleSaveReminder(selectedPrompt.id, null);
                                    showToast('התזכורת הוסרה בהצלחה', 'info');
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                  title="מחק תזכורת"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* App-like Document Canvas Card for Prompt Content */}
                          <div className="bg-white dark:bg-[#151515] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/5 shadow-xs mb-6">
                            <FormattedPromptView
                              content={selectedPrompt.content}
                              isFullscreen={isFullscreen}
                              showToast={showToast}
                            />
                          </div>

                        {selectedPrompt.exampleOutput && (
                          <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50/60 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
                            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                              <Sparkles className="w-4 h-4 text-indigo-500" />
                              <span>תוצאה מופקת לדוגמה (Sample Output)</span>
                            </div>
                            <div className="text-sm font-sans leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap" dir="auto">
                              {selectedPrompt.exampleOutput}
                            </div>
                          </div>
                        )}
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('detail.quickNotes')}</label>
                          <textarea
                            value={selectedPrompt.notes || ''}
                            onChange={(e) => {
                              const newPrompts = prompts.map(p => p.id === selectedPrompt.id ? {...p, notes: e.target.value} : p);
                              setPrompts(newPrompts); // Optimistic UI update
                            }}
                            onBlur={(e) => handleSave({...selectedPrompt, notes: e.target.value})}
                            placeholder={t('detail.notesPlaceholder')}
                            className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white resize-y min-h-[80px]"
                            dir="auto"
                          />
                        </div>
                        <RecommendationsSection
                          prompts={prompts}
                          currentPromptId={selectedPrompt.id}
                          onSelectPrompt={(id) => {
                            setSelectedPromptId(id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          onQuickTest={(p) => {
                            setSelectedPromptId(p.id);
                            setTimeout(() => {
                              const startBtn = document.getElementById('start-test-btn');
                              startBtn?.click();
                            }, 250);
                          }}
                        />
                      </div>
                      
                      {/* Right Sidebar Sandbox */}
                      <div className="w-full 2xl:w-[400px] shrink-0 border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#111] shadow-sm flex flex-col mt-8 2xl:mt-0 2xl:sticky 2xl:top-0 2xl:h-[calc(100vh-140px)]">
                         <div className="p-4 border-b border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                           <Bot className="w-4 h-4 text-indigo-500" /> Chat Sandbox
                         </div>
                         <div className="flex-1 overflow-y-auto p-4">
                           <PromptTester 
                              prompt={selectedPrompt} 
                              onUpdate={handleSave} 
                              onChain={(text) => setChainingText(text)}
                              nextPromptName={selectedPrompt.chainNextPromptId ? prompts.find(p => p.id === selectedPrompt.chainNextPromptId)?.title : undefined}
                              onAutoChain={(text) => {
                                 if (selectedPrompt.chainNextPromptId) {
                                    setChainingText(text);
                                    const nextP = prompts.find(p => p.id === selectedPrompt.chainNextPromptId);
                                    if (nextP) {
                                      // Directly move to the next prompt and append chaining text
                                      const newContent = nextP.content + "\n\n[קלט מהפרומפט הקודם]:\n" + text;
                                      setSelectedPromptId(nextP.id);
                                      setIsEditing(false);
                                      setSmartVarsText(newContent);
                                      setChainingText(null);
                                    }
                                 }
                              }}
                            />
                         </div>
                      </div>
                      
                    </div>
                  )}
                  </div>
                </motion.div>
              )
            ) : (
              <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 hidden xl:flex items-center justify-center p-8 bg-slate-50/50 dark:bg-[#0a0a0a]">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 flex items-center justify-center mx-auto text-slate-300 dark:text-slate-700">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">PandaPrompt</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">בחר פרומפט מהרשימה כדי לצפות בו או לערוך אותו, או צור פרומפט חדש.</p>
                </div>
              </motion.div>
            )}
            </React.Suspense>
</AnimatePresence>
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {!isReadingMode && (
        <MobileBottomNav 
          currentView={currentView}
          setCurrentView={(v) => {
            setSelectedPromptId(null);
            setIsEditing(false);
            setCurrentView(v);
          }}
          onOpenNewEditor={handleOpenNewEditor}
          onOpenProfile={() => {
            setSelectedPromptId(null);
            setIsEditing(false);
            setCurrentView("profile");
          }}
        />
      )}

      <FloatingActionBar 
        selectedCount={selectedIds.length}
        onCopyList={handleCopyList}
        onClear={() => setSelectedIds([])}
        onDelete={handleBulkDelete}
        onMove={() => { setMoveTargetId(null); setIsMoveModalOpen(true); }}
        onExport={handleBulkExport}
        onRename={() => setIsBulkRenameModalOpen(true)}
        onCompare={() => setShowCompare(true)}
        onTag={() => setIsBulkTagModalOpen(true)}
      />
      <CommandPalette 
        isOpen={isPaletteOpen || !!chainingText}
        setIsOpen={(open) => {
           if (!open) { setIsPaletteOpen(false); setChainingText(null); }
           else setIsPaletteOpen(true);
        }}
        prompts={prompts}
        folders={folders}
        onSelectPrompt={(id) => { 
          const p = prompts.find(pr => pr.id === id);
          if (chainingText && p) {
             const newContent = p.content + "\n\n[קלט מהפרומפט הקודם]:\n" + chainingText;
             setSmartVarsText(newContent);
             setChainingText(null);
          } else {
             setSelectedPromptId(id); 
             setIsEditing(false); 
          }
        }}
        onSelectFolder={(id) => { setSelectedFolder(id); setCurrentView("library"); }}
        onCreatePrompt={() => { setEditingPrompt({}); setIsEditing(true); setSelectedPromptId(null); }}
      />
      
      
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

      <NewFolderModal 
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onConfirm={handleCreateFolder}
      />
      <MoveFolderModal 
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        folders={folders}
        count={selectedIds.length}
        onConfirm={handleBulkMove}
      />

      <FilterRulesModal 
        isOpen={isFilterRulesModalOpen} 
        onClose={() => setIsFilterRulesModalOpen(false)} 
        rules={automationRules} 
        setRules={setAutomationRules} 
        folders={folders} 
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        appLanguage={appLanguage}
        setAppLanguage={setAppLanguage}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        isCurrentlyDark={isCurrentlyDark}
        handleForceToggleTheme={handleForceToggleTheme}
        promptsCount={prompts.length}
        foldersCount={folders.length}
        handleExportAll={handleExportAll}
        handleImportAll={handleImportAll}
        customShortcuts={customShortcuts}
        onUpdateShortcuts={(updated) => setCustomShortcuts(updated)}
        showToast={showToast}
        initialTab={settingsInitialTab}
        battery={battery}
      />

      <EnterpriseSuiteModal
        isOpen={isEnterpriseSuiteOpen}
        onClose={() => setIsEnterpriseSuiteOpen(false)}
        prompts={prompts}
        showToast={showToast}
        onOpenDeepDiagnostic={() => {
          setIsEnterpriseSuiteOpen(false);
          setIsDeepDiagnosticOpen(true);
        }}
        onOpenPromptChain={() => {
          setIsEnterpriseSuiteOpen(false);
          setIsPromptChainOpen(true);
        }}
      />

      <DeepAiDiagnosticSuite
        isOpen={isDeepDiagnosticOpen}
        onClose={() => setIsDeepDiagnosticOpen(false)}
        prompts={prompts}
        showToast={showToast}
      />

      <PromptChainBuilderModal
        isOpen={isPromptChainOpen}
        onClose={() => setIsPromptChainOpen(false)}
        prompts={prompts}
        showToast={showToast}
      />

      <AutoTagModal
        isOpen={isAutoTagOpen}
        onClose={() => setIsAutoTagOpen(false)}
        prompt={autoTagTargetPrompt}
        categories={categories}
        allTags={allTags}
        onApplyTags={(tags, cat) => {
          if (autoTagTargetPrompt) {
            handleSave({ ...autoTagTargetPrompt, tags, categories: [cat] });
          }
        }}
        showToast={showToast}
      />

      <ShortcutsModal 
        isOpen={isShortcutsOpen} 
        onClose={() => setIsShortcutsOpen(false)} 
        onAction={handleShortcutAction} 
        customShortcuts={customShortcuts}
        onOpenSettings={() => {
          setSettingsInitialTab('shortcuts');
          setIsSettingsModalOpen(true);
        }}
      />
      <PromptQrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        prompt={qrTargetPrompt}
        onShowToast={showToast}
      />
      <SharePromptModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        prompt={shareTargetPrompt || selectedPrompt}
        onShowToast={showToast}
        onOpenQrModal={() => {
          setIsShareModalOpen(false);
          setQrTargetPrompt(shareTargetPrompt || selectedPrompt);
          setIsQrModalOpen(true);
        }}
        onPublishToCommunity={handlePublishToCommunity}
      />
      <PromptTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        prompt={templateTargetPrompt || selectedPrompt}
        onComplete={(rendered) => {
          navigator.clipboard.writeText(rendered);
          showToast("הפרומפט הממולא הועתק ללוח!", "success");
        }}
        onTestInSandbox={(rendered) => {
          if (selectedPrompt) {
            handleSave({...selectedPrompt, content: rendered});
          }
          setTimeout(() => {
            const startBtn = document.getElementById('start-test-btn');
            startBtn?.click();
          }, 250);
        }}
        onUpdatePrompt={(updated) => {
          handleSave(updated);
          setTemplateTargetPrompt(updated);
        }}
        onShowToast={showToast}
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onShowToast={showToast} />
      <DeleteConfirmModal 
        isOpen={!!promptToDelete}
        onClose={() => setPromptToDelete(null)}
        onConfirm={() => promptToDelete && handleDelete(promptToDelete)}
        title={prompts.find(p => p.id === promptToDelete)?.title}
      />
      <BulkRenameModal 
        isOpen={isBulkRenameModalOpen}
        onClose={() => setIsBulkRenameModalOpen(false)}
        count={selectedIds.length}
        onConfirm={handleBulkRename}
      />
      <BulkTagModal 
        isOpen={isBulkTagModalOpen}
        onClose={() => setIsBulkTagModalOpen(false)}
        allTags={allTags}
        count={selectedIds.length}
        onConfirm={handleBulkTag}
      />
      <PromptGeneratorModal 
        isOpen={isGeneratorOpen} 
        onClose={() => setIsGeneratorOpen(false)} 
        onComplete={(text) => {
          setEditingPrompt({ ...editingPrompt, content: text, language: detectLanguage(text), aiOptimized: true });
          setIsEditing(true);
          setSelectedPromptId(null);
          setCurrentView("library");
        }} 
      />
      <ComparePromptsView 
        isOpen={showCompare}
        onClose={() => setShowCompare(false)}
        prompts={prompts.filter(p => selectedIds.includes(p.id))}
        onShowToast={showToast}
      />
      <DueReminderModal
        prompt={duePrompt}
        onClose={() => { if (duePrompt) handleSave({...duePrompt, dueDate: undefined}); setDuePrompt(null); }}
        onSnooze={handleSnooze}
      />
      <SmartVariablesModal 
        isOpen={!!smartVarsText}
        onClose={() => setSmartVarsText(null)}
        originalText={smartVarsText || ""}
      />
      <BulkOrganizerModal
        isOpen={isBulkOrganizerOpen}
        onClose={() => setIsBulkOrganizerOpen(false)}
        prompts={prompts}
        folders={folders}
        onApplyChanges={async (updates) => {
          await usePromptStore.getState().bulkUpdatePrompts(updates);
          setPrompts(usePromptStore.getState().prompts);
        }}
        showToast={showToast}
      />
      <MetaPromptModal
        isOpen={isMetaPromptOpen}
        onClose={() => setIsMetaPromptOpen(false)}
        onSaveToVault={async (newPrompt) => {
          await usePromptStore.getState().savePrompt(newPrompt);
          setPrompts(usePromptStore.getState().prompts);
          setSelectedPromptId(newPrompt.id);
          setCurrentView("library");
        }}
        onOpenInEditor={(draft) => {
          setEditingPrompt(draft);
          setIsEditing(true);
          setSelectedPromptId(null);
          setCurrentView("library");
        }}
        showToast={showToast}
        folders={folders}
      />
      <PromptCardExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        prompt={exportingPrompt}
        platforms={PLATFORMS}
        onShowToast={showToast}
      />
      <ScoreAchievementsModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Category Management Modal */}
      <ManageCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
        categories={categories}
        onSaveCategories={handleSaveCategories}
        prompts={prompts}
        onShowToast={showToast}
      />

      {/* Quick Prompt Reminder Setter Modal */}
      <QuickReminderModal
        isOpen={!!quickReminderPrompt}
        onClose={() => setQuickReminderPrompt(null)}
        prompt={quickReminderPrompt}
        onSaveReminder={(pId, rem) => {
          handleSaveReminder(pId, rem);
          if (selectedPrompt && selectedPrompt.id === pId) {
            setSelectedPromptId(pId);
          }
        }}
        onShowToast={showToast}
      />

      {/* Full Reminders Center Modal */}
      <RemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        prompts={prompts}
        onSelectPrompt={(pId) => {
          setSelectedPromptId(pId);
          setIsEditing(false);
          setIsRemindersModalOpen(false);
        }}
        onSaveReminder={(pId, rem) => {
          handleSaveReminder(pId, rem);
        }}
        onShowToast={showToast}
      />

      {/* Mobile Filter & Sort Bottom Sheet */}
      <MobileFilterSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        selectedType={selectedFolder.startsWith("type:") ? selectedFolder : "all_types"}
        onSelectType={(type) => {
          if (type === "all_types") {
            if (selectedFolder.startsWith("type:")) setSelectedFolder("all");
          } else {
            setSelectedFolder(type);
          }
        }}
        categoryFilter={categoryFilter}
        onSelectCategory={setCategoryFilter}
        availableCategories={availableCategories}
        tagFilter={tagFilter}
        onSelectTag={setTagFilter}
        availableTags={allTags}
        favoriteOnly={favoriteOnlyFilter}
        onToggleFavoriteOnly={() => setFavoriteOnlyFilter(!favoriteOnlyFilter)}
        sortOrder={sortOrder}
        onSelectSortOrder={setSortOrder}
        onResetAll={() => {
          setSearchQuery('');
          setTagFilter('all');
          setCategoryFilter('all');
          setFavoriteOnlyFilter(false);
          setSortOrder('recent');
          if (selectedFolder.startsWith('type:')) setSelectedFolder('all');
          showToast('הסננים אופסו בהצלחה', 'info');
        }}
        matchingCount={filteredPrompts.length}
      />

      {/* Mobile Detail Action Sheet */}
      {selectedPrompt && (
        <MobileDetailActionSheet
          isOpen={isMobileDetailActionsOpen}
          onClose={() => setIsMobileDetailActionsOpen(false)}
          prompt={selectedPrompt}
          onSetReminder={() => setQuickReminderPrompt(selectedPrompt)}
          onCopyMarkdown={() => {
            const md = `# ${selectedPrompt.title}\n\n**פלטפורמה:** ${PLATFORMS[selectedPrompt.platform]?.name || selectedPrompt.platform}\n**תגיות:** ${(selectedPrompt.tags||[]).join(', ')}\n\n\`\`\`\n${selectedPrompt.content}\n\`\`\`\n`;
            navigator.clipboard.writeText(md);
            showToast("הועתק כ-Markdown!", "success");
          }}
          onShareSocial={() => {
            setShareTargetPrompt(selectedPrompt);
            setIsShareModalOpen(true);
          }}
          onCopyPublicLink={() => {
            const url = window.location.origin + '?shared=' + selectedPrompt.id;
            navigator.clipboard.writeText(url);
            showToast("קישור ציבורי הועתק בהצלחה!", "success");
          }}
          onSendEmail={() => {
            const md = `# ${selectedPrompt.title}\n\n**פלטפורמה:** ${PLATFORMS[selectedPrompt.platform]?.name || selectedPrompt.platform}\n**תגיות:** ${(selectedPrompt.tags||[]).join(', ')}\n\n${selectedPrompt.content}`;
            window.open(`mailto:?subject=${encodeURIComponent(selectedPrompt.title)}&body=${encodeURIComponent(md)}`);
          }}
          onExportCardImage={() => {
            setExportingPrompt(selectedPrompt);
            setIsExportModalOpen(true);
          }}
          onExportPDF={() => handleExportPDF(selectedPrompt)}
          onShowQr={() => {
            setQrTargetPrompt(selectedPrompt);
            setIsQrModalOpen(true);
          }}
          onExportJSON={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedPrompt, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `${selectedPrompt.title || 'prompt'}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          }}
          onOpenTemplate={() => {
            setTemplateTargetPrompt(selectedPrompt);
            setIsTemplateModalOpen(true);
          }}
          onMoveFolder={() => {
            setMoveTargetId(selectedPrompt.id);
            setIsMoveModalOpen(true);
          }}
          onDuplicate={() => handleDuplicate(selectedPrompt)}
          onToggleReadOnly={() => handleSave({...selectedPrompt, isReadOnly: !selectedPrompt.isReadOnly})}
          onPublishCommunity={() => handlePublishToCommunity(selectedPrompt)}
          onToggleHistory={() => setShowHistory(!showHistory)}
          hasHistory={Boolean(selectedPrompt.history && selectedPrompt.history.length > 0)}
          onDelete={() => setPromptToDelete(selectedPrompt.id)}
          onReadingMode={() => setIsReadingMode(true)}
        />
      )}
      {selectedPrompt && (
        <SpeedReadingModal
          isOpen={isSpeedReadingOpen}
          onClose={() => setIsSpeedReadingOpen(false)}
          title={selectedPrompt.title}
          content={selectedPrompt.content}
        />
      )}
      <OnboardingTourModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
      </div>
    </MotionConfig>
  );
}

export default App;
