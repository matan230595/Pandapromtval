import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  FileCode, Calendar, FileDown, Lock, Unlock, Tag,
  Plus, Search, Folder as FolderIcon, FolderOpen, Heart, Activity, 
  Settings, Sun, Moon, ChevronRight, Copy, Check, Share2, CopyPlus, 
  Trash2, FolderDown, Edit3, Download, Play, MessageSquare, History, AlignLeft,
  Smartphone, Monitor, ChevronLeft, Sparkles, X, Menu, Command, Wand2, Loader2, HelpCircle, Maximize2, Minimize2, BarChart2, Printer, Star, Terminal
, AlertTriangle, Filter, Bot, User as UserIcon, Globe} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth, loginWithGoogle, logout } from "./firebase";
import { collection, doc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

import { Prompt, Folder, PlatformConfig, ChatMessage, Project, PromptVersion, Review } from "./types";
import { CommunityView } from "./components/CommunityView";
import { UserProfileView } from "./components/UserProfileView";
import { TagCombobox } from "./components/TagCombobox";
import { ReviewsSection } from "./components/ReviewsSection";
import { PromptTester } from "./components/PromptTester";
import { Toast, ToastType } from "./components/Toast";
import { CommandPalette } from "./components/CommandPalette";
import { SmartVariablesModal } from "./components/SmartVariablesModal";
import { MoveFolderModal } from "./components/MoveFolderModal";
import { NewFolderModal } from "./components/NewFolderModal";

import { updateDoc } from "firebase/firestore";
import { getTagColor } from "./utils/colors";
import { FloatingActionBar } from "./components/FloatingActionBar";
import { DiffViewer } from "./components/DiffViewer";
import { InsightsDashboard } from "./components/InsightsDashboard";
import { DashboardView } from "./components/DashboardView";
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';
import html2pdf from 'html2pdf.js';

import { ShortcutsModal } from "./components/ShortcutsModal";
import { PromptGeneratorModal } from "./components/PromptGeneratorModal";
import { SyncStatus } from "./components/SyncStatus";
import { BulkTagModal } from "./components/BulkTagModal";
import { EmptyState } from "./components/EmptyStates";
import { RTLTestResults } from './components/RTLTestResults';

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
    useCount: 12, projectId: "default", language: "he"
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
    useCount: 5, projectId: "default", language: "he"
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
    useCount: 8, projectId: "default", language: "he"
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
  const [user, setUser] = useState<User | null>(null);
  type ThemeMode = 'light' | 'dark' | 'system' | 'scheduled';
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
  
  

  const handleOpenNewEditor = () => {
    const draft = localStorage.getItem("promptvault_draft");
    if (draft) {
      if (window.confirm("יש לך טיוטה לא שמורה. האם תרצה לשחזר אותה?")) {
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
  
  const [currentView, setCurrentView] = useState<"dashboard" | "library" | "insights" | "settings" | "profile" | "community">("dashboard");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("all");


  const [sortOrder, setSortOrder] = useState<"recent" | "alpha" | "created">("recent");
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  
  const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt> | null>(null);
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
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [smartVarsText, setSmartVarsText] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const [focusedPromptIndex, setFocusedPromptIndex] = useState<number>(-1);




  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isRtlTestsOpen, setIsRtlTestsOpen] = useState(false);
  const [pulsingPromptId, setPulsingPromptId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [varSuggest, setVarSuggest] = useState({show: false, filter: '', cursorIndex: 0});
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


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

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

  
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      
      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsGeneratorOpen(false);
        setIsBulkTagModalOpen(false);
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !isInput) {
        e.preventDefault();
        setEditingPrompt({});
        setIsEditing(true);
        setSelectedPromptId(null);
      }
      
      if (e.key === '?' && !isInput) {
        setIsShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const allTags = useMemo(() => Array.from(new Set(prompts.flatMap(p => p.tags || []))).sort(), [prompts]);

  
  

  const filteredPrompts = useMemo(() => {
    let list = prompts;
    if (tagFilter !== 'all') {
      list = list.filter(p => p.tags && p.tags.includes(tagFilter));
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.folder !== "community") && // exclude community from general search
        (p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || (p.tags && p.tags.some(t => t.toLowerCase().includes(q))))
      );
    } else {
      if (selectedFolder === "favorites") {
        list = list.filter(p => p.favorite && p.folder !== "archive" && p.folder !== "community");
      } else if (selectedFolder === "archive") {
        list = list.filter(p => p.folder === "archive");
      } else if (selectedFolder === "community") {
        list = list.filter(p => p.folder === "community");
      } else if (selectedFolder === "all") {
        list = list.filter(p => p.folder !== "archive" && p.folder !== "community");
      } else {
        list = list.filter(p => p.folder === selectedFolder);
      }
    }
    
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [prompts, selectedFolder, searchQuery, tagFilter]);
    


  const selectedPrompt = useMemo(() => prompts.find(p => p.id === selectedPromptId), [prompts, selectedPromptId]);

  // Reset history index when prompt changes
  useEffect(() => {
    setHistoryIndex(0);
    setShowHistory(false);
  }, [selectedPromptId]);

    const showToast = (message: string, type: ToastType = 'success', action?: {label: string, onClick: () => void}) => {
    setToast({message, type, action});
  };
  const handleSaveReview = (review: Review) => {
    if (!selectedPrompt) return;
    const currentReviews = selectedPrompt.reviews || [];
    handleSave({
      ...selectedPrompt,
      reviews: [...currentReviews, review]
    });
  };

  const handleSave = async (promptData: Partial<Prompt>) => {
    const isNew = !promptData.id;
    const now = new Date().toISOString();
    let newPrompt: Prompt;

    if (isNew) {
      newPrompt = {
        id: (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)),
        title: promptData.title || "פרומפט חדש",
        content: promptData.content || "",
        platform: promptData.platform || "General",
        
        tags: promptData.tags || [],
        dueDate: promptData.dueDate || undefined,
        folder: promptData.folder || folders[0]?.id,

        favorite: false,
        createdAt: now,
        updatedAt: now,
        useCount: 0,
        projectId: "default",
        language: "he"
      };
    } else {
      const existing = prompts.find(p => p.id === promptData.id);
      if (!existing) return;
      
      const newHistory = existing.history ? [...existing.history] : [];
      if (existing.content !== promptData.content) {
        newHistory.unshift({
          content: existing.content,
          updatedAt: existing.updatedAt,
          versionId: (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2))
        });
      }

      newPrompt = {
        ...existing,
        ...promptData,
        updatedAt: now,
        history: newHistory
      } as Prompt;
    }

    if (user) {
      await setDoc(doc(db, "users", user.uid, "prompts", newPrompt.id), newPrompt);
    } else {
      const updated = isNew ? [newPrompt, ...prompts] : prompts.map(p => p.id === newPrompt.id ? newPrompt : p);
      setPrompts(updated);
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
    }
    
    setIsEditing(false);
    setSelectedPromptId(newPrompt.id);
  };

    
  const handleDragStart = (e: React.DragEvent, promptId: string) => {
    e.dataTransfer.setData('text/plain', promptId);
    e.dataTransfer.effectAllowed = 'move';
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
      id: crypto.randomUUID(),
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
    if (!window.confirm("האם למחוק את הפרומפט?")) return;
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "prompts", id));
    } else {
      const updated = prompts.filter(p => p.id !== id);
      setPrompts(updated);
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
    }
    if (selectedPromptId === id) setSelectedPromptId(null);
  };

  
  
  const handleCreateFolder = async (name: string) => {
    const newFolder = {
      id: "folder_" + (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)),
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
          updated[index].tags = newTags;
          updated[index].updatedAt = new Date().toISOString();
        }
      }
      setPrompts(updated);
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
    }
    setSelectedIds([]);
  };


  const [isRefining, setIsRefining] = useState(false);
  const [isAutoTagging, setIsAutoTagging] = useState(false);

  const handleRefinePrompt = async () => {
    if (!editingPrompt || !editingPrompt.content) return;
    setIsRefining(true);
    try {
      const response = await fetch('/api/gemini/enhance', {
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
      const response = await fetch('/api/gemini/classify', {
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
          updated[index].folder = folderId;
          updated[index].updatedAt = new Date().toISOString();
        }
      }
      setPrompts(updated);
      localStorage.setItem("promptvault_prompts", JSON.stringify(updated));
    }
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
        const stored = JSON.parse(localStorage.getItem("promptvault_prompts") || "[]");
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

  const handleExportAll = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prompts, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `promptvault_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('הגיבוי הורד בהצלחה', 'success');
  };

  const handleImportAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          if (user) {
             for (const p of imported) {
               await setDoc(doc(db, "users", user.uid, "prompts", p.id), p);
             }
             showToast('הנתונים יובאו וסונכרנו בהצלחה!', 'success');
          } else {
             const merged = [...imported, ...prompts.filter(p => !imported.some((i: any) => i.id === p.id))];
             setPrompts(merged);
             localStorage.setItem("promptvault_prompts", JSON.stringify(merged));
             showToast('הנתונים יובאו בהצלחה!', 'success');
          }
        }
      } catch (err) {
        showToast('שגיאה בייבוא הקובץ', 'error');
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
      const res = await fetch("/api/gemini/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptText: editingPrompt.content })
      });
      const data = await res.json();
      if (data.text) {
        setEditingPrompt(prev => ({ ...prev, content: data.text }));
      }
    } catch (e) {
      alert("שגיאה בשיפור הפרומפט");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopy = (content: string, id?: string) => {
    if (id) {
      const p = prompts.find(pr => pr.id === id);
      if (p) handleSave({...p, useCount: (p.useCount || 0) + 1, lastUsedAt: new Date().toISOString()});
    }
    if (/\$\([^)]+\)|\{\{[^}]+\}\}/.test(content)) {
      setSmartVarsText(content);
    } else {
      navigator.clipboard.writeText(content);
      showToast("הועתק ללוח!", "success");
    }
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const prompt = prompts.find(p => p.id === id);
    if (prompt) handleSave({ ...prompt, favorite: !prompt.favorite });
  };
  
  const handleQuickArchive = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const prompt = prompts.find(p => p.id === id);
    if (prompt) handleSave({ ...prompt, folder: "archive" });
  };


  return (
    <div className={`flex flex-col md:flex-row h-screen overflow-hidden font-sans bg-[#fcfcfc] dark:bg-[#0a0a0a] text-slate-800 dark:text-slate-200`}>
      
      {/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      {/* Sidebar */}
      <div className={`${isMobileMenuOpen ? "flex fixed inset-y-0 right-0 z-50 w-72" : "hidden md:flex w-64"} ${isFullscreen ? "!hidden" : ""} flex-col border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] md:bg-white/50 md:dark:bg-[#111111]/50 md:backdrop-blur-xl shrink-0 transition-transform duration-300`}>
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-lg">PromptVault</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X className="w-5 h-5" />
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
            <button onClick={() => { setCurrentView("profile"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentView === "profile" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <UserIcon className="w-4 h-4" /> הפרופיל שלי
            </button>
            <button onClick={() => { setCurrentView("dashboard"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentView === "dashboard" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <Activity className="w-4 h-4" /> דאשבורד ראשי
            </button>
            <button onClick={() => { setCurrentView("library"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <FolderOpen className="w-4 h-4" /> הספריה
            </button>
            <button onClick={() => { setCurrentView("insights"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentView === "insights" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <BarChart2 className="w-4 h-4" /> אנליטיקה
            </button>
          </div>

          <div className="space-y-1">
            <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">סינון</div>
            <button onClick={() => { setSelectedFolder("all"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedFolder === "all" && currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <AlignLeft className="w-4 h-4" /> כל הפרומפטים
            </button>
            <button onClick={() => { setSelectedFolder("favorites"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedFolder === "favorites" && currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <Heart className="w-4 h-4" /> מועדפים
            </button>
            <button onClick={() => { setSelectedFolder("archive"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedFolder === "archive" && currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <Download className="w-4 h-4" /> ארכיון
            </button>

          </div>

          
          <div className="space-y-1">
            <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">קהילה וכלים</div>
            <button onClick={() => { setSelectedFolder("community"); setCurrentView("library"); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${selectedFolder === "community" && currentView === "library" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <Sparkles className="w-4 h-4" /> תבניות קהילה
            </button>
          </div>

<div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">אוספים (תיקיות)</div>
              <button onClick={() => setIsNewFolderModalOpen(true)} className="text-slate-400 hover:text-blue-500 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {folders.map(f => (
              <button 
                key={f.id}
                onClick={() => { setSelectedFolder(f.id); setCurrentView("library"); setIsMobileMenuOpen(false); }}
                onDragOver={(e) => handleDragOver(e, f.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropToFolder(e, f.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${dragOverFolderId === f.id ? "bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500 text-blue-700 dark:text-blue-300 shadow-sm" : selectedFolder === f.id && currentView === "library" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}
              >
                <FolderIcon className="w-4 h-4 opacity-70" /> {f.name}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <div className="px-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-6">גיבוי וייצוא</div>
            <button onClick={handleExportCSV} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400">
              <Download className="w-4 h-4" /> ייצוא ל-CSV (Excel)
            </button>
            <button onClick={handleExportAll} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400">
              <FileCode className="w-4 h-4" /> גיבוי מלא (JSON)
            </button>
          </div>

        </div>
        <div className="p-4 border-t border-slate-200 dark:border-white/10 shrink-0">
          <SyncStatus lastSync={lastSyncTime} />
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-white/10">
          <button onClick={user ? () => logout() : () => loginWithGoogle()} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 py-2.5 rounded-xl font-medium transition-colors text-sm">
             {user ? "התנתק" : "התחבר לסנכרון"}
          </button>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#111] border-b border-slate-200 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-lg">PromptVault</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setIsGeneratorOpen(true)}
            className="w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg"
          >
            <Wand2 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleOpenNewEditor}
            className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

            {/* Main Area */}
      <div className="flex-1 flex overflow-hidden bg-slate-50/50 dark:bg-[#0a0a0a]">
        {currentView === "profile" ? (
          <div className="flex-1 overflow-y-auto">
            <UserProfileView onShowToast={showToast} />
          </div>
        ) : currentView === "dashboard" ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <DashboardView 
              prompts={prompts} 
              folders={folders} 
              platforms={PLATFORMS} 
              onSelectPrompt={(id) => { setSelectedPromptId(id); setIsEditing(false); setCurrentView("library"); }}
              onCreatePrompt={handleOpenNewEditor}
              onNavigateToLibrary={() => setCurrentView("library")}
            />
          </div>
        ) : currentView === "insights" ? (
          <div className="flex-1 overflow-y-auto p-8">
            <InsightsDashboard prompts={prompts} platforms={PLATFORMS} folders={folders} />
          </div>
        ) : (
          <>
            {/* List View */}
            <div className={`flex flex-col border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] transition-all duration-300 ${selectedPromptId || isEditing ? "hidden md:flex w-80 shrink-0" : "flex-1"} ${isFullscreen ? "!hidden" : ""}`}>
              <div className={`p-4 border-b border-slate-200 dark:border-white/10 ${!selectedPromptId && !isEditing ? "md:p-8" : ""}`}>
                {!selectedPromptId && !isEditing && (
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        {selectedFolder === "all" ? <FolderOpen className="w-5 h-5" /> : selectedFolder === "favorites" ? <Heart className="w-5 h-5" /> : selectedFolder === "archive" ? <Download className="w-5 h-5" /> : selectedFolder === "community" ? <Sparkles className="w-5 h-5" /> : <FolderIcon className="w-5 h-5" />}
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {selectedFolder === "all" ? "כל הפרומפטים" : selectedFolder === "favorites" ? "מועדפים" : selectedFolder === "archive" ? "ארכיון" : selectedFolder === "community" ? "תבניות קהילה" : folders.find(f => f.id === selectedFolder)?.name || "ספריה"}
                      </h2>
                    </div>
                  </div>
                )}
                
                  <div className="flex items-center gap-2">
                    <select
                      value={tagFilter}
                      onChange={(e) => {
                        setTagFilter(e.target.value);
                        setTimeout(() => {
                          const grid = document.getElementById('prompts-grid');
                          if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 50);
                      }}
                      className="bg-slate-100 dark:bg-white/5 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 py-2 px-3 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <option value="all">כל התגיות</option>
                      {allTags.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                
                <div className="relative flex-1 flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="חיפוש חופשי..."
                      className="w-full ps-9 pe-10 py-2 bg-slate-100 dark:bg-white/5 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50 pointer-events-none text-slate-400">
                      <Command className="w-3 h-3" />
                      <span className="text-[10px] font-bold">K</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Filter className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select 
                        value={tagFilter}
                        onChange={(e) => {
                        setTagFilter(e.target.value);
                        setTimeout(() => {
                          const grid = document.getElementById('prompts-grid');
                          if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 50);
                      }}
                        className="ps-9 pe-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-700 dark:text-slate-300 min-w-[120px]"
                      >
                        <option value="all">כל התגיות</option>
                        {allTags.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <select 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-700 dark:text-slate-300 min-w-[100px]"
                    >
                      <option value="recent">אחרונים</option>
                      <option value="popular">הכי שימושיים</option>
                      <option value="alpha">א-ב</option>
                      <option value="created">תאריך יצירה</option>
                    </select>
                  </div>
                </div>

                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {filteredPrompts.length === 0 && (
                  <EmptyState 
                    type={searchQuery ? 'search' : selectedFolder === 'all' || selectedFolder === 'favorites' ? 'all' : 'folder'} 
                    searchQuery={searchQuery}
                    folderName={folders.find(f => f.id === selectedFolder)?.name}
                  />
                )}
                
                
                {selectedFolder === "community" ? (
                  <CommunityView onImport={(p) => {
                    handleSave({ ...p, folder: folders.length > 0 ? folders[0].id : 'all' });
                    setSelectedFolder('all');
                  }} onShowToast={showToast} />
                ) : (
                  <div id="prompts-grid" className={!selectedPromptId && !isEditing ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start [perspective:1000px]" : "space-y-2"}>


                  <AnimatePresence mode="popLayout">
                  {filteredPrompts.map(p => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                    whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2, z: 20, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                    key={p.id}
                    draggable={true}
                    onDragStart={(e: React.DragEvent) => handleDragStart(e, p.id)}
                    onClick={() => { setSelectedPromptId(p.id); setIsEditing(false); }}
                    className={`cursor-pointer rounded-2xl border transition-all active:cursor-grabbing ${!selectedPromptId && !isEditing ? 'p-5 hover:-translate-y-1 hover:shadow-lg' : 'p-3'} ${pulsingPromptId === p.id ? 'animate-pulse ring-2 ring-blue-500 shadow-lg' : ''} ${selectedPromptId === p.id || focusedPromptIndex === filteredPrompts.indexOf(p) ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50 ring-2 ring-blue-500/30' : 'bg-white dark:bg-[#111] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'}`}
                  >
                    <div className={`flex items-start gap-3 ${!selectedPromptId && !isEditing ? 'h-full flex-col' : ''}`}>
                      <div className={`flex ${!selectedPromptId && !isEditing ? 'w-full justify-between items-center mb-2' : ''}`}>
                        <input 
                          type="checkbox"
                          checked={selectedIds.includes(p.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) setSelectedIds([...selectedIds, p.id]);
                            else setSelectedIds(selectedIds.filter(id => id !== p.id));
                          }}
                          className={`w-4 h-4 rounded border-slate-300 accent-blue-600 cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none ${!selectedPromptId && !isEditing ? '' : 'mt-1'}`}
                        />
                        {!selectedPromptId && !isEditing && (
                          
                          <div className="flex items-center gap-2">
                            <button onClick={(e) => handleQuickArchive(p.id, e)} className="text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors" title="העבר לארכיון">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => toggleFavorite(p.id, e)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Heart className={`w-4 h-4 ${p.favorite ? "fill-red-500 text-red-500" : ""}`} />
                            </button>
                          </div>

                        )}
                      </div>
                      <div className="flex-1 min-w-0 w-full flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          
                          {inlineEditingId === p.id ? (
                            <form 
                              onSubmit={(e) => handleInlineSave(p.id, e)}
                              className="flex items-center gap-1 w-full mr-2"
                              onClick={e => e.stopPropagation()}
                            >
                              <input
                                autoFocus
                                value={inlineEditValue}
                                onChange={e => setInlineEditValue(e.target.value)}
                                className="flex-1 min-w-0 bg-white dark:bg-[#222] border border-blue-400 rounded px-2 py-1 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyDown={(e) => {
                                  if (e.key === 'Escape') setInlineEditingId(null);
                                }}
                              />
                              {isSavingInline ? (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
                              ) : (
                                <>
                                  <button type="submit" className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded p-1 transition-colors shrink-0">
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button type="button" onClick={() => setInlineEditingId(null)} className="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded p-1 transition-colors shrink-0">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </form>
                          ) : (
                            <div className="flex items-center gap-1 min-w-0 flex-1 group">
                              <h3 className={`font-bold truncate text-slate-900 dark:text-white pr-2 ${!selectedPromptId && !isEditing ? 'text-lg' : 'text-sm'}`}>{p.title}</h3>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInlineEditValue(p.title);
                                  setInlineEditingId(p.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded shrink-0 focus:opacity-100"
                                aria-label="ערוך שם"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          { (selectedPromptId || isEditing) && (
                            <button onClick={(e) => toggleFavorite(p.id, e)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Heart className={`w-3.5 h-3.5 ${p.favorite ? "fill-red-500 text-red-500" : ""}`} />
                            </button>
                          )}
                        </div>
                        <p className={`text-slate-500 dark:text-slate-400 leading-relaxed ${!selectedPromptId && !isEditing ? 'text-sm line-clamp-3 mb-4 flex-1' : 'text-xs line-clamp-2'}`}>{p.content}</p>
                        <div className="flex justify-between items-center mt-3 overflow-hidden">
                          <div className="flex flex-wrap gap-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${PLATFORMS[p.platform]?.bgColor} ${PLATFORMS[p.platform]?.textColor}`}>
                              {PLATFORMS[p.platform]?.name || p.platform}
                            </span>
                            {p.tags?.slice(0, 2).map(t => (
                              <button
                                key={t}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTagFilter(t);
                                  setTimeout(() => {
                                    const grid = document.getElementById('prompts-grid');
                                    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }, 50);
                                }}
                                className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                              >
                                {t}
                              </button>
                            ))}
                            {(p.tags?.length || 0) > 2 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-white/10 text-slate-500">
                                +{(p.tags?.length || 0) - 2}
                              </span>
                            )}
                          </div>
                          {p.successRating && (
                            <div className="flex items-center gap-0.5">
                              {[...Array(p.successRating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                  </AnimatePresence>
                </div>
                )}
              </div>
            </div>

            {/* Detail View / Editor */}
            {(selectedPromptId || isEditing) ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-transparent">
                {isEditing ? (
                  <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-4xl mx-auto w-full">
                    <div className="bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 space-y-6">
                      <button onClick={() => { setIsEditing(false); setSelectedPromptId(null); }} className="md:hidden flex items-center gap-2 text-slate-500 mb-4 font-medium hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" /> חזור לרשימה
                      </button>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{editingPrompt?.id ? "עריכת פרומפט" : "פרומפט חדש"}</h2>
                      </div>
                      
                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">כותרת הפרומפט</label>
                          <input 
                            type="text"
                            value={editingPrompt?.title || ""}
                            onChange={e => setEditingPrompt({...editingPrompt, title: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                            placeholder="לדוגמה: ניסוח מייל ללקוח חשוב..."
                          />
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">תוכן הפרומפט</label>
                            <button 
                              onClick={() => setIsFullscreen(!isFullscreen)}
                              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                              title="מצב מיקוד (Focus Mode)"
                            >
                              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={handleEnhancePrompt} 
                              disabled={isEnhancing || !editingPrompt?.content}
                              className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors disabled:opacity-50"
                            >
                              {isEnhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                              שפר בעזרת AI
                            </button>
                          </div>
                          
                          <div className="relative">
                            
                      <div className="flex gap-2">
                        <button 
                          onClick={handleRefinePrompt}
                          disabled={isRefining}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-200 dark:border-indigo-800/30"
                        >
                          {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                          שדרוג חכם (AI Refiner)
                        </button>
                        <button 
                          onClick={handleAutoTag}
                          disabled={isAutoTagging}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200 dark:border-emerald-800/30"
                        >
                          {isAutoTagging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
                          תיוג אוטומטי (AI)
                        </button>
                      </div>
                      
  <div className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus-within:ring-2 focus-within:ring-blue-500/50 text-sm font-mono text-slate-900 dark:text-white" dir="auto" style={{ minHeight: '256px' }}>
    <Editor
      value={editingPrompt?.content || ""}
      onValueChange={(code) => handleContentChange({target: {value: code}} as any)}
      highlight={code => Prism.highlight(code, Prism.languages.markdown, 'markdown')}
      padding={16}
      style={{
        fontFamily: '"Fira Code", "JetBrains Mono", monospace',
        minHeight: '256px',
        direction: 'ltr',
        whiteSpace: 'pre-wrap'
      }}
      placeholder="הקלד את התוכן כאן. השתמש ב $(משתנים) כדי להפוך אותו לדינמי..."
      textareaClassName="focus:outline-none"
    />
  </div>

                            {varSuggest.show && (
                              <div className="absolute z-10 bottom-4 left-4 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[200px]">
                                <div className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                                  משתנים נפוצים
                                </div>
                                <div className="max-h-40 overflow-y-auto p-1">
                                  {COMMON_VARS.filter(v => v.name.includes(varSuggest.filter.toUpperCase())).map(v => (
                                    <button
                                      key={v.name}
                                      onClick={() => handleVarSelect(v.name)}
                                      className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors"
                                    >
                                      <div className="text-sm font-mono font-bold">{v.name}</div>
                                      <div className="text-[10px] text-slate-500">{v.desc} ({v.format})</div>
                                    </button>
                                  ))}
                                  {COMMON_VARS.filter(v => v.name.includes(varSuggest.filter.toUpperCase())).length === 0 && (
                                    <div className="px-3 py-2 text-sm text-slate-400">אין תוצאות...</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">פלטפורמה מומלצת</label>
                            <select 
                              value={editingPrompt?.platform || "General"}
                              onChange={e => setEditingPrompt({...editingPrompt, platform: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                            >
                              {Object.keys(PLATFORMS).map(k => <option key={k} value={k}>{PLATFORMS[k].name}</option>)}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">נושא (Topic)</label>
                            <select 
                              value={editingPrompt?.topic || "General"}
                              onChange={e => setEditingPrompt({...editingPrompt, topic: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                            >
                              {['General', 'Finance', 'Tech', 'Marketing', 'Sales', 'HR', 'Creative', 'Academic', 'Writing', 'SEO', 'Coding'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                                תיקייה
                                {folders.length === 0 && (
                                  <button type="button" onClick={() => setIsNewFolderModalOpen(true)} className="ml-2 text-blue-500 hover:text-blue-600">
                                    + צור תיקייה
                                  </button>
                                )}
                              </label>
                            </div>
                            <select 
                              value={editingPrompt?.folder || (folders.length > 0 ? folders[0].id : '')}
                              onChange={e => setEditingPrompt({...editingPrompt, folder: e.target.value})}
                              className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                            >
                              {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תגיות (חפש או צור)</label>
                          <TagCombobox 
                            tags={editingPrompt?.tags || []}
                            allTags={allTags}
                            onChange={(tags) => setEditingPrompt({...editingPrompt, tags})}
                          />
                        
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">תאריך יעד / תזכורת</label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="date"
                              value={editingPrompt?.dueDate || ""}
                              onChange={(e) => setEditingPrompt({...editingPrompt, dueDate: e.target.value})}
                              className="w-full ps-9 pe-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
<div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">פלט לדוגמה (Preview Output)</label>
                          <textarea
                            value={editingPrompt?.exampleOutput || ""}
                            onChange={(e) => setEditingPrompt({...editingPrompt, exampleOutput: e.target.value})}
                            placeholder="הוסף דוגמה של הפלט שהפרומפט הזה מייצר..."
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm font-mono text-slate-800 dark:text-slate-200 resize-y min-h-[120px]"
                            dir="auto"
                          />
                        </div>
                      </div>

                      {checkPromptValidation(editingPrompt?.content || '') && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-3 rounded-xl flex items-start gap-2 text-amber-700 dark:text-amber-400 text-xs mt-3">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{checkPromptValidation(editingPrompt?.content || '')}</span>
                        </div>
                      )}
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                        <button onClick={() => { setIsEditing(false); if(!editingPrompt?.id) setSelectedPromptId(null); }} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-sm">
                          ביטול
                        </button>
                        <button onClick={() => handleSave(editingPrompt || {})} className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-colors text-sm">
                          <Check className="w-4 h-4" /> שמור שינויים
                        </button>
                      </div>
                    </div>
                  </div>
                ) : selectedPrompt ? (
                  <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#111] overflow-hidden">
                    <div className="md:hidden border-b border-slate-100 dark:border-white/5 p-4 shrink-0">
                      <button onClick={() => setSelectedPromptId(null)} className="flex items-center gap-2 text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" /> חזור לרשימה
                      </button>
                    </div>
                    
                    <div className="p-6 lg:p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-start justify-between gap-6 shrink-0">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium border border-slate-200 dark:border-white/10 text-slate-500">
                            {Math.max(1, Math.ceil((selectedPrompt.content.match(/\S+/g) || []).length / 200))} דק' קריאה
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${PLATFORMS[selectedPrompt.platform]?.bgColor} ${PLATFORMS[selectedPrompt.platform]?.textColor}`}>
                            {PLATFORMS[selectedPrompt.platform]?.name || selectedPrompt.platform}
                          </span>
                          {selectedPrompt.folder && (
                             <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                               <FolderIcon className="w-3 h-3" />
                               {folders.find(f => f.id === selectedPrompt.folder)?.name || 'ללא תיקייה'}
                             </span>
                          )}
                          {(selectedPrompt.tags || []).map(t => (
                            <span key={t} className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${getTagColor(t).bg} ${getTagColor(t).text} ${getTagColor(t).border}`}>
                              {t}
                            </span>
                          ))}
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
                      
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        
                          <button title="ייצא כ-PDF" onClick={() => handleExportPDF(selectedPrompt)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg">
                            <FileDown className="w-4.5 h-4.5" />
                          </button>
<button title="מצב מיקוד (Focus Mode)" onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-50 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg">
                            {isFullscreen ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
                          </button>
                          
                          <button 
                            title="העבר לתיקייה אחרת" 
                            onClick={() => { setMoveTargetId(selectedPrompt.id); setIsMoveModalOpen(true); }} 
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-slate-50 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-900/20 rounded-lg"
                          >
                            <FolderOpen className="w-4.5 h-4.5" />
                          </button>
                          
                          {!selectedPrompt.isReadOnly && (
    <button title="ערוך פרומפט" onClick={() => { setEditingPrompt(selectedPrompt); setIsEditing(true); }} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 hover:bg-blue-50 dark:bg-white/5 dark:hover:bg-blue-900/20 rounded-lg">
      <Edit3 className="w-4.5 h-4.5" />
    </button>
  )}
                        
                          <button title="העתק כ-Markdown" onClick={() => {
                            const md = `# ${selectedPrompt.title}\n\n**פלטפורמה:** ${PLATFORMS[selectedPrompt.platform]?.name || selectedPrompt.platform}\n**תגיות:** ${(selectedPrompt.tags||[]).join(', ')}\n\n\`\`\`\n${selectedPrompt.content}\n\`\`\`\n`;
                            navigator.clipboard.writeText(md);
                            showToast("הועתק כ-Markdown!", "success");
                          }} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-slate-50 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-900/20 rounded-lg">
                            <FileCode className="w-4.5 h-4.5" />
                          </button>
                          
                          <button 
                            title={selectedPrompt.isReadOnly ? "פרומפט זה נעול לקריאה בלבד ומוגן מפני עריכה. לחץ כדי לבטל נעילה." : "נעל פרומפט - מונע עריכה בטעות"} 
                            onClick={() => handleSave({...selectedPrompt, isReadOnly: !selectedPrompt.isReadOnly})} 
                            className={`p-2 transition-all duration-300 rounded-lg ${selectedPrompt.isReadOnly ? 'text-red-500 bg-red-100 dark:bg-red-900/40 ring-2 ring-red-500/30 animate-[pulse_2s_ease-in-out_infinite]' : 'text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-900/20'}`}
                          >
                            {selectedPrompt.isReadOnly ? <Lock className="w-4.5 h-4.5" /> : <Unlock className="w-4.5 h-4.5" />}
                          </button>

<button title="העתק תוכן" onClick={() => handleCopy(selectedPrompt.content, selectedPrompt.id)} className="p-2 text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors bg-slate-50 hover:bg-green-50 dark:bg-white/5 dark:hover:bg-green-900/20 rounded-lg">
                          <Copy className="w-4.5 h-4.5" />
                        </button>
                        <button title="שכפל פרומפט" onClick={() => handleDuplicate(selectedPrompt)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 hover:bg-blue-50 dark:bg-white/5 dark:hover:bg-blue-900/20 rounded-lg">
                          <CopyPlus className="w-4.5 h-4.5" />
                        </button>
                        
                        <button title="פרסם לקהילה" onClick={() => handlePublishToCommunity(selectedPrompt)} className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-50 hover:bg-emerald-50 dark:bg-white/5 dark:hover:bg-emerald-900/20 rounded-lg flex items-center gap-1">
                          <Globe className="w-4.5 h-4.5" />
                        </button>
                        {navigator.share && (
                          <button title="שתף" onClick={() => navigator.share({ title: selectedPrompt.title, text: selectedPrompt.content }).catch(e => console.error(e))} className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors bg-slate-50 hover:bg-purple-50 dark:bg-white/5 dark:hover:bg-purple-900/20 rounded-lg">
                            <Share2 className="w-4.5 h-4.5" />
                          </button>
                        )}
                        <button title="הדפס" onClick={() => window.print()} className="p-2 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors bg-slate-50 hover:bg-orange-50 dark:bg-white/5 dark:hover:bg-orange-900/20 rounded-lg">
                          <Printer className="w-4.5 h-4.5" />
                        </button>
                        <button title="יצא כ-JSON" onClick={() => {
                          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedPrompt, null, 2));
                          const downloadAnchorNode = document.createElement('a');
                          downloadAnchorNode.setAttribute("href", dataStr);
                          downloadAnchorNode.setAttribute("download", `${selectedPrompt.title || 'prompt'}.json`);
                          document.body.appendChild(downloadAnchorNode);
                          downloadAnchorNode.click();
                          downloadAnchorNode.remove();
                        }} className="p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors bg-slate-50 hover:bg-cyan-50 dark:bg-white/5 dark:hover:bg-cyan-900/20 rounded-lg">
                          <Download className="w-4.5 h-4.5" />
                        </button>
                        {selectedPrompt.history && selectedPrompt.history.length > 1 && (
                          <button onClick={() => setShowHistory(!showHistory)} className={`p-2 transition-colors rounded-lg ${showHistory ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-400 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 dark:bg-white/5 dark:hover:bg-amber-900/20'}`}>
                            <History className="w-4.5 h-4.5" />
                          </button>
                        )}
                        <button title="מחק פרומפט" onClick={() => handleDelete(selectedPrompt.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-slate-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-900/20 rounded-lg ml-2">
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                        <button title="סגור" onClick={() => setSelectedPromptId(null)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-50 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg ml-2 md:flex hidden">
                          <X className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>

                    <div className="px-6 lg:px-8 py-3 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 shrink-0 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-500"/> שימושים: {selectedPrompt.useCount || 0}</div>
                        {selectedPrompt.lastUsedAt && <div className="flex items-center gap-1.5"><History className="w-4 h-4 text-emerald-500"/> שימוש אחרון: {new Date(selectedPrompt.lastUsedAt).toLocaleDateString('he-IL')}</div>}
                        <div className="flex items-center gap-1 ms-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSave({...selectedPrompt, successRating: star});
                              }}
                              className="focus:outline-none hover:scale-110 transition-transform p-0.5"
                            >
                              <Star className={`w-4 h-4 ${selectedPrompt.successRating && selectedPrompt.successRating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {showHistory && selectedPrompt.history && selectedPrompt.history.length > 1 ? (
                      <div className="flex-1 flex flex-col p-6 lg:p-8 bg-slate-50 dark:bg-[#0a0a0a] overflow-hidden">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">היסטוריית גרסאות</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            
                            <button 
                              onClick={() => {
                                handleSave({
                                  ...selectedPrompt,
                                  content: selectedPrompt.history![historyIndex].content
                                });
                                setShowHistory(false);
                                showToast('הפרומפט שוחזר לגרסה הקודמת בהצלחה', 'success');
                              }}
                              className="px-3 py-1.5 ml-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors border border-amber-200 dark:border-amber-800/30"
                            >
                              <History className="w-3.5 h-3.5" />
                              שחזר לגרסה זו
                            </button>
                            <button onClick={() => setHistoryIndex(Math.min(historyIndex + 1, selectedPrompt.history!.length - 1))}
 disabled={historyIndex === selectedPrompt.history!.length - 1} className="p-1 text-slate-400 disabled:opacity-30">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                            <span className="text-xs font-mono bg-white dark:bg-[#111] px-2 py-1 rounded-md border border-slate-200 dark:border-white/10">
                              {new Date(selectedPrompt.history[historyIndex].updatedAt).toLocaleString('he-IL')}
                            </span>
                            <button onClick={() => setHistoryIndex(Math.max(historyIndex - 1, 0))} disabled={historyIndex === 0} className="p-1 text-slate-400 disabled:opacity-30">
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-slate-500 mb-2 shrink-0">
                          השוואה בין הגרסה הנוכחית לגרסה מתאריך {new Date(selectedPrompt.history[historyIndex].updatedAt).toLocaleDateString('he-IL')}
                        </div>
                        <DiffViewer 
                          oldText={selectedPrompt.history[historyIndex].content} 
                          newText={selectedPrompt.content} 
                        />
                      </div>
                    ) : (
                      <div className="flex-1 p-6 lg:p-8 bg-slate-50 dark:bg-[#0a0a0a] overflow-y-auto selection:bg-blue-200 dark:selection:bg-blue-900/50 flex flex-col 2xl:flex-row gap-8">
                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="font-mono text-[15px] leading-8 whitespace-pre-wrap text-slate-800 dark:text-slate-200 flex-1" dir="auto" dangerouslySetInnerHTML={{ __html: Prism.highlight(selectedPrompt.content, Prism.languages.markdown, 'markdown') }} />

                        {selectedPrompt.exampleOutput && (
                          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-indigo-500 flex items-center gap-2">
                              <Terminal className="w-4 h-4" />
                              פלט לדוגמה
                            </label>
                            <div className="p-4 bg-slate-100/50 dark:bg-white/5 rounded-xl text-[14px] font-mono leading-7 text-slate-700 dark:text-slate-300 whitespace-pre-wrap border border-slate-200/50 dark:border-white/10" dir="auto">
                              {selectedPrompt.exampleOutput}
                            </div>
                          </div>
                        )}
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">פתקים מהירים (Quick Notes)</label>
                          <textarea
                            value={selectedPrompt.notes || ''}
                            onChange={(e) => {
                              const newPrompts = prompts.map(p => p.id === selectedPrompt.id ? {...p, notes: e.target.value} : p);
                              setPrompts(newPrompts); // Optimistic UI update
                            }}
                            onBlur={(e) => handleSave({...selectedPrompt, notes: e.target.value})}
                            placeholder="רשום לעצמך הערות, הקשר או טיפים לשימוש בפרומפט הזה..."
                            className="w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white resize-y min-h-[80px]"
                            dir="auto"
                          />
                        </div>
                        <ReviewsSection prompt={selectedPrompt} onSaveReview={handleSaveReview} />
                      </div>
                      
                      {/* Right Sidebar Sandbox */}
                      <div className="w-full 2xl:w-[400px] shrink-0 border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#111] shadow-sm flex flex-col mt-8 2xl:mt-0 2xl:sticky 2xl:top-0 2xl:h-[calc(100vh-140px)]">
                         <div className="p-4 border-b border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                           <Bot className="w-4 h-4 text-indigo-500" /> Chat Sandbox
                         </div>
                         <div className="flex-1 overflow-y-auto p-4">
                           <PromptTester prompt={selectedPrompt} />
                         </div>
                      </div>
                      
                    </div>
                  )}
                </div>
              ) : null}
              </div>
            ) : (
              <div className="flex-1 hidden xl:flex items-center justify-center p-8 bg-slate-50/50 dark:bg-[#0a0a0a]">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 flex items-center justify-center mx-auto text-slate-300 dark:text-slate-700">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Prompt Vault</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">בחר פרומפט מהרשימה כדי לצפות בו או לערוך אותו, או צור פרומפט חדש.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <FloatingActionBar 
        selectedCount={selectedIds.length}
        onCopyList={handleCopyList}
        onClear={() => setSelectedIds([])}
        onDelete={handleBulkDelete}
        onMove={() => { setMoveTargetId(null); setIsMoveModalOpen(true); }}
        onExport={handleBulkExport}
        onTag={() => setIsBulkTagModalOpen(true)}
      />
      <CommandPalette 
        isOpen={isPaletteOpen}
        setIsOpen={setIsPaletteOpen}
        prompts={prompts}
        folders={folders}
        onSelectPrompt={(id) => { setSelectedPromptId(id); setIsEditing(false); }}
        onSelectFolder={(id) => { setSelectedFolder(id); setCurrentView("library"); }}
        onCreatePrompt={() => { setEditingPrompt({}); setIsEditing(true); setSelectedPromptId(null); }}
      />
      
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
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
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
          setEditingPrompt({ ...editingPrompt, content: text, language: detectLanguage(text) });
          setIsEditing(true);
          setSelectedPromptId(null);
          setCurrentView("library");
        }} 
      />
      <SmartVariablesModal 
        isOpen={!!smartVarsText}
        onClose={() => setSmartVarsText(null)}
        originalText={smartVarsText || ""}
      />
    </div>
  );
}

export default App;
