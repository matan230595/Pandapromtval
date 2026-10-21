const fs = require('fs');
let codeApp = fs.readFileSync('src/App.tsx', 'utf8');
let codeDash = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

codeApp = codeApp.replace(
  'import { BookOpen, Cloud, CloudOff,   FileCode, Calendar, FileDown, Lock, Unlock, Tag,  Plus, Search, Folder as FolderIcon, FolderOpen, Heart, Activity,   Settings, Sun, Moon, ChevronRight, Copy, Check, Share2, CopyPlus,   Trash2, FolderDown, Edit3, Download, Play, MessageSquare, History, AlignLeft, ArrowDownAZ, Clock, FileText,  Smartphone, Monitor, ChevronLeft, Sparkles, X, Menu, Command, Wand2, Loader2, HelpCircle, Maximize2, Minimize2, BarChart2, Printer, Star, Terminal, AlertTriangle, Filter, Bot, User as UserIcon, Globe, LayoutGrid, List, Kanban, Clipboard, Link2, Mic, Bell, CalendarClock, Link, Save, RotateCcw, Share, XCircle, LayoutTemplate, GitMerge, Users, ChevronDown } from "lucide-react";',
  'import { BookOpen, Cloud, CloudOff,   FileCode, Calendar, FileDown, Lock, Unlock, Tag,  Plus, Search, Folder as FolderIcon, FolderOpen, Heart, Activity,   Settings, Sun, Moon, ChevronRight, Copy, Check, Share2, CopyPlus,   Trash2, FolderDown, Edit3, Download, Play, MessageSquare, History, AlignLeft, ArrowDownAZ, Clock, FileText,  Smartphone, Monitor, ChevronLeft, Sparkles, X, Menu, Command, Wand2, Loader2, HelpCircle, Maximize2, Minimize2, BarChart2, Printer, Star, Terminal, AlertTriangle, Filter, Bot, User as UserIcon, Globe, LayoutGrid, List, Kanban, Clipboard, Link2, Mic, Bell, CalendarClock, Link, Save, RotateCcw, Share, XCircle, LayoutTemplate, GitMerge, Users, ChevronDown, Mail } from "lucide-react";'
);

codeDash = codeDash.replace(
  "Calendar, Bot } from 'lucide-react';",
  "Calendar } from 'lucide-react';"
);

codeDash = codeDash.replace(
  "import { Plus, Clock, Heart, ArrowLeft, Terminal, TrendingUp, Star, Zap, Search, Activity, Calendar } from 'lucide-react';",
  "import { Plus, Clock, Heart, ArrowLeft, Terminal, TrendingUp, Star, Zap, Search, Activity, Calendar, Bot } from 'lucide-react';"
);

fs.writeFileSync('src/App.tsx', codeApp);
fs.writeFileSync('src/components/DashboardView.tsx', codeDash);
