const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<FolderOpen className="w-4 h-4" \/> \{t\('nav\.library'\)\}\n\s*<\/button>/,
  `<FolderOpen className="w-4 h-4" /> {t('nav.library')}\n            </button>\n            <button onClick={() => { setCurrentView("templates"); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors \${currentView === "templates" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}\`}>\n              <LayoutTemplate className="w-4 h-4" /> תבניות מוכנות\n            </button>\n            <button onClick={() => { setCurrentView("workflows"); setIsMobileMenuOpen(false); }} className={\`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors \${currentView === "workflows" ? "bg-slate-100 dark:bg-white/10 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}\`}>\n              <GitMerge className="w-4 h-4" /> תהליכי עבודה (Workflows)\n            </button>`
);

code = code.replace(
  'import { Sun, Moon, Monitor, Trash2, Edit3, FolderPlus, Download, Check, X, Search, Plus, Filter, AlertCircle, Copy, FolderOpen, AlignLeft, Star, Upload, History, Share2, Tag, Calendar, MoreVertical, Hash, LogOut, Code, User as UserIcon, Activity, Key, Save, Play, MessageSquare, Bot, Scale, SplitSquareHorizontal, Lightbulb, Zap, Send, Link2, Settings, Menu, Maximize, Minimize, HelpCircle, FileJson, FileText, Smartphone, Globe, Eye, ChevronDown, CheckCircle2, CopyCheck, Users, SearchSlash, BarChart2, CheckSquare, List, Grid, Lock, Unlock, Mail, XCircle, Clock, PlusSquare, Server, Link, Database, Shield, Sparkles, Terminal } from "lucide-react";',
  'import { Sun, Moon, Monitor, Trash2, Edit3, FolderPlus, Download, Check, X, Search, Plus, Filter, AlertCircle, Copy, FolderOpen, AlignLeft, Star, Upload, History, Share2, Tag, Calendar, MoreVertical, Hash, LogOut, Code, User as UserIcon, Activity, Key, Save, Play, MessageSquare, Bot, Scale, SplitSquareHorizontal, Lightbulb, Zap, Send, Link2, Settings, Menu, Maximize, Minimize, HelpCircle, FileJson, FileText, Smartphone, Globe, Eye, ChevronDown, CheckCircle2, CopyCheck, Users, SearchSlash, BarChart2, CheckSquare, List, Grid, Lock, Unlock, Mail, XCircle, Clock, PlusSquare, Server, Link, Database, Shield, Sparkles, Terminal, LayoutTemplate, GitMerge } from "lucide-react";'
);

fs.writeFileSync('src/App.tsx', code);
