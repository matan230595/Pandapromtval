import { create } from 'zustand';
import { Prompt, Folder } from '../types';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export const INITIAL_PROMPTS: Prompt[] = [
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
    useCount: 12,
    usageHistory: Array.from({ length: 12 }, (_, i) => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()),
    projectId: "default",
    language: "he"
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
    useCount: 5,
    usageHistory: Array.from({ length: 5 }, (_, i) => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()),
    projectId: "default",
    language: "he"
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
    useCount: 8,
    usageHistory: Array.from({ length: 8 }, (_, i) => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()),
    projectId: "default",
    language: "he"
  }
];

export const INITIAL_FOLDERS: Folder[] = [
  { id: "work", name: "עבודה מקצועית", icon: "briefcase" },
  { id: "writing", name: "כתיבה ותוכן", icon: "pen-tool" },
  { id: "personal", name: "אישי ופנאי", icon: "coffee" }
];

const loadInitialPrompts = (): Prompt[] => {
  try {
    const saved = localStorage.getItem("promptvault_prompts");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse stored prompts", e);
  }
  return INITIAL_PROMPTS;
};

const loadInitialFolders = (): Folder[] => {
  try {
    const saved = localStorage.getItem("promptvault_folders");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse stored folders", e);
  }
  return INITIAL_FOLDERS;
};

export type SyncStatusType = "idle" | "syncing" | "saved" | "error" | "offline";

interface PromptState {
  prompts: Prompt[];
  folders: Folder[];
  user: User | null;
  selectedPromptId: string | null;
  selectedFolder: string;
  searchQuery: string;
  tagFilter: string;
  sortOrder: "recent" | "alpha" | "created" | "popular" | "custom";
  syncStatus: SyncStatusType;
  lastSyncTime: Date | null;
  dailyGoal: number;
  isSmartGrouping: boolean;
  unsubscribers: Unsubscribe[];

  // Actions
  setUser: (user: User | null) => void;
  setPrompts: (prompts: Prompt[]) => void;
  setFolders: (folders: Folder[]) => void;
  setSelectedPromptId: (id: string | null) => void;
  setSelectedFolder: (folderId: string) => void;
  setSearchQuery: (query: string) => void;
  setTagFilter: (tag: string) => void;
  setSortOrder: (order: "recent" | "alpha" | "created" | "popular" | "custom") => void;
  setSyncStatus: (status: SyncStatusType) => void;
  setDailyGoal: (goal: number) => void;
  setIsSmartGrouping: (val: boolean) => void;
  recordPromptUsage: (promptId: string) => Promise<void>;

  // Data persistence
  savePrompt: (prompt: Prompt) => Promise<void>;
  deletePrompt: (promptId: string) => Promise<void>;
  duplicatePrompt: (prompt: Prompt) => Promise<Prompt>;
  saveFolder: (folder: Folder) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  bulkUpdatePrompts: (updates: { id: string; changes: Partial<Prompt> }[]) => Promise<void>;
  bulkDeletePrompts: (ids: string[]) => Promise<void>;
  
  // Real-time listener binder
  bindRealtimeListeners: (user: User | null) => void;
  triggerManualSync: () => Promise<void>;
}

export const usePromptStore = create<PromptState>((set, get) => ({
  prompts: loadInitialPrompts(),
  folders: loadInitialFolders(),
  user: null,
  selectedPromptId: null,
  selectedFolder: "all",
  searchQuery: "",
  tagFilter: "all",
  sortOrder: "recent",
  syncStatus: "idle",
  lastSyncTime: null,
  dailyGoal: (() => {
    try {
      const g = localStorage.getItem("promptvault_daily_goal");
      return g ? Math.max(1, parseInt(g, 10)) : 5;
    } catch {
      return 5;
    }
  })(),
  isSmartGrouping: (() => {
    try {
      return localStorage.getItem("promptvault_smart_grouping") === "true";
    } catch {
      return false;
    }
  })(),
  unsubscribers: [],

  setUser: (user) => {
    set({ user });
    get().bindRealtimeListeners(user);
  },

  setPrompts: (prompts) => {
    set({ prompts });
    localStorage.setItem("promptvault_prompts", JSON.stringify(prompts));
  },

  setFolders: (folders) => {
    set({ folders });
    localStorage.setItem("promptvault_folders", JSON.stringify(folders));
  },

  setSelectedPromptId: (selectedPromptId) => set({ selectedPromptId }),
  setSelectedFolder: (selectedFolder) => set({ selectedFolder }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setTagFilter: (tagFilter) => set({ tagFilter }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),

  setDailyGoal: (dailyGoal) => {
    const val = Math.max(1, dailyGoal);
    set({ dailyGoal: val });
    try {
      localStorage.setItem("promptvault_daily_goal", val.toString());
    } catch (e) {
      console.error(e);
    }
  },

  setIsSmartGrouping: (isSmartGrouping) => {
    set({ isSmartGrouping });
    try {
      localStorage.setItem("promptvault_smart_grouping", isSmartGrouping ? "true" : "false");
    } catch (e) {
      console.error(e);
    }
  },

  recordPromptUsage: async (promptId: string) => {
    const { prompts, savePrompt } = get();
    const target = prompts.find(p => p.id === promptId);
    if (!target) return;
    const now = new Date().toISOString();
    const currentHistory = Array.isArray(target.usageHistory) ? target.usageHistory : [];
    const updated: Prompt = {
      ...target,
      useCount: (target.useCount || 0) + 1,
      lastUsedAt: now,
      usageHistory: [...currentHistory, now],
    };
    await savePrompt(updated);
  },

  savePrompt: async (prompt) => {
    const { user, prompts } = get();
    set({ syncStatus: "syncing" });

    const now = new Date().toISOString();
    const updatedPrompt: Prompt = {
      ...prompt,
      updatedAt: now,
      createdAt: prompt.createdAt || now,
    };

    const exists = prompts.some(p => p.id === updatedPrompt.id);
    const updatedList = exists
      ? prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p)
      : [updatedPrompt, ...prompts];

    set({ prompts: updatedList, lastSyncTime: new Date() });
    localStorage.setItem("promptvault_prompts", JSON.stringify(updatedList));

    if (user) {
      const path = `users/${user.uid}/prompts/${updatedPrompt.id}`;
      try {
        await setDoc(doc(db, "users", user.uid, "prompts", updatedPrompt.id), updatedPrompt);
        set({ syncStatus: "saved" });
      } catch (err) {
        handleFirestoreError(err, exists ? OperationType.UPDATE : OperationType.CREATE, path);
        set({ syncStatus: "error" });
      }
    } else {
      set({ syncStatus: "saved" });
    }
  },

  deletePrompt: async (promptId) => {
    const { user, prompts, selectedPromptId } = get();
    set({ syncStatus: "syncing" });

    const updatedList = prompts.filter(p => p.id !== promptId);
    set({
      prompts: updatedList,
      selectedPromptId: selectedPromptId === promptId ? null : selectedPromptId,
      lastSyncTime: new Date()
    });
    localStorage.setItem("promptvault_prompts", JSON.stringify(updatedList));

    if (user) {
      const path = `users/${user.uid}/prompts/${promptId}`;
      try {
        await deleteDoc(doc(db, "users", user.uid, "prompts", promptId));
        set({ syncStatus: "saved" });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
        set({ syncStatus: "error" });
      }
    } else {
      set({ syncStatus: "saved" });
    }
  },

  duplicatePrompt: async (prompt) => {
    const newId = "p_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const duplicated: Prompt = {
      ...prompt,
      id: newId,
      title: `${prompt.title} (עותק)`,
      useCount: 0,
      usageHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await get().savePrompt(duplicated);
    set({ selectedPromptId: newId });
    return duplicated;
  },

  saveFolder: async (folder) => {
    const { user, folders } = get();
    set({ syncStatus: "syncing" });

    const exists = folders.some(f => f.id === folder.id);
    const updatedList = exists
      ? folders.map(f => f.id === folder.id ? folder : f)
      : [...folders, folder];

    set({ folders: updatedList, lastSyncTime: new Date() });
    localStorage.setItem("promptvault_folders", JSON.stringify(updatedList));

    if (user) {
      const path = `users/${user.uid}/folders/${folder.id}`;
      try {
        await setDoc(doc(db, "users", user.uid, "folders", folder.id), folder);
        set({ syncStatus: "saved" });
      } catch (err) {
        handleFirestoreError(err, exists ? OperationType.UPDATE : OperationType.CREATE, path);
        set({ syncStatus: "error" });
      }
    } else {
      set({ syncStatus: "saved" });
    }
  },

  deleteFolder: async (folderId) => {
    const { user, folders, prompts, selectedFolder } = get();
    set({ syncStatus: "syncing" });

    const updatedFolders = folders.filter(f => f.id !== folderId);
    // Move prompts in that folder to 'all' / unassigned
    const updatedPrompts = prompts.map(p => p.folder === folderId ? { ...p, folder: 'work' } : p);

    set({
      folders: updatedFolders,
      prompts: updatedPrompts,
      selectedFolder: selectedFolder === folderId ? 'all' : selectedFolder,
      lastSyncTime: new Date()
    });
    localStorage.setItem("promptvault_folders", JSON.stringify(updatedFolders));
    localStorage.setItem("promptvault_prompts", JSON.stringify(updatedPrompts));

    if (user) {
      const path = `users/${user.uid}/folders/${folderId}`;
      try {
        await deleteDoc(doc(db, "users", user.uid, "folders", folderId));
        set({ syncStatus: "saved" });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
        set({ syncStatus: "error" });
      }
    } else {
      set({ syncStatus: "saved" });
    }
  },

  bulkUpdatePrompts: async (updates) => {
    const { user, prompts } = get();
    set({ syncStatus: "syncing" });

    const updateMap = new Map(updates.map(u => [u.id, u.changes]));
    const now = new Date().toISOString();

    const updatedList = prompts.map(p => {
      const changes = updateMap.get(p.id);
      if (changes) {
        return { ...p, ...changes, updatedAt: now };
      }
      return p;
    });

    set({ prompts: updatedList, lastSyncTime: new Date() });
    localStorage.setItem("promptvault_prompts", JSON.stringify(updatedList));

    if (user) {
      try {
        for (const update of updates) {
          const fullPrompt = updatedList.find(p => p.id === update.id);
          if (fullPrompt) {
            await setDoc(doc(db, "users", user.uid, "prompts", fullPrompt.id), fullPrompt);
          }
        }
        set({ syncStatus: "saved" });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/prompts`);
        set({ syncStatus: "error" });
      }
    } else {
      set({ syncStatus: "saved" });
    }
  },

  bulkDeletePrompts: async (ids) => {
    const { user, prompts, selectedPromptId } = get();
    set({ syncStatus: "syncing" });

    const idSet = new Set(ids);
    const updatedList = prompts.filter(p => !idSet.has(p.id));

    set({
      prompts: updatedList,
      selectedPromptId: selectedPromptId && idSet.has(selectedPromptId) ? null : selectedPromptId,
      lastSyncTime: new Date()
    });
    localStorage.setItem("promptvault_prompts", JSON.stringify(updatedList));

    if (user) {
      try {
        for (const id of ids) {
          await deleteDoc(doc(db, "users", user.uid, "prompts", id));
        }
        set({ syncStatus: "saved" });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/prompts`);
        set({ syncStatus: "error" });
      }
    } else {
      set({ syncStatus: "saved" });
    }
  },

  bindRealtimeListeners: (user) => {
    const { unsubscribers } = get();
    // Unsubscribe existing listeners
    unsubscribers.forEach(unsub => unsub());

    if (!user) {
      // Fallback to local storage
      set({
        unsubscribers: [],
        prompts: loadInitialPrompts(),
        folders: loadInitialFolders(),
        syncStatus: "idle"
      });
      return;
    }

    set({ syncStatus: "syncing" });
    const promptsPath = `users/${user.uid}/prompts`;
    const foldersPath = `users/${user.uid}/folders`;

    const unsubPrompts = onSnapshot(
      collection(db, "users", user.uid, "prompts"),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map(d => d.data() as Prompt);
          set({ prompts: loaded, lastSyncTime: new Date(), syncStatus: "saved" });
          localStorage.setItem("promptvault_prompts", JSON.stringify(loaded));
        } else {
          // If Firestore is empty for this user, seed with initial prompts
          const current = get().prompts;
          if (current.length > 0) {
            current.forEach(p => {
              setDoc(doc(db, "users", user.uid, "prompts", p.id), p).catch(err => {
                handleFirestoreError(err, OperationType.CREATE, `${promptsPath}/${p.id}`);
              });
            });
          }
          set({ syncStatus: "saved" });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, promptsPath);
        set({ syncStatus: "error" });
      }
    );

    const unsubFolders = onSnapshot(
      collection(db, "users", user.uid, "folders"),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map(d => d.data() as Folder);
          set({ folders: loaded, syncStatus: "saved" });
          localStorage.setItem("promptvault_folders", JSON.stringify(loaded));
        } else {
          const current = get().folders;
          if (current.length > 0) {
            current.forEach(f => {
              setDoc(doc(db, "users", user.uid, "folders", f.id), f).catch(err => {
                handleFirestoreError(err, OperationType.CREATE, `${foldersPath}/${f.id}`);
              });
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, foldersPath);
      }
    );

    set({ unsubscribers: [unsubPrompts, unsubFolders] });
  },

  triggerManualSync: async () => {
    const { user, prompts, folders } = get();
    set({ syncStatus: "syncing" });
    try {
      if (!navigator.onLine) {
        set({ syncStatus: "offline" });
        return;
      }
      if (user) {
        // Push any local prompts and folders into user collection
        for (const p of prompts) {
          await setDoc(doc(db, "users", user.uid, "prompts", p.id), p, { merge: true });
        }
        for (const f of folders) {
          await setDoc(doc(db, "users", user.uid, "folders", f.id), f, { merge: true });
        }
        set({ lastSyncTime: new Date(), syncStatus: "saved" });
        setTimeout(() => {
          if (get().syncStatus === "saved") {
            set({ syncStatus: "idle" });
          }
        }, 3000);
      } else {
        localStorage.setItem("promptvault_prompts", JSON.stringify(prompts));
        localStorage.setItem("promptvault_folders", JSON.stringify(folders));
        await new Promise(r => setTimeout(r, 450));
        set({ lastSyncTime: new Date(), syncStatus: "saved" });
        setTimeout(() => {
          if (get().syncStatus === "saved") {
            set({ syncStatus: "idle" });
          }
        }, 3000);
      }
    } catch (err) {
      console.error("Manual sync failed", err);
      set({ syncStatus: "error" });
      throw err;
    }
  }
}));
