const fs = require('fs');

let content = fs.readFileSync('src/components/PromptEditor.tsx', 'utf8');

// Add missing imports
content = content.replace("Trash2, Plus, Terminal", "Trash2, Plus, Terminal, Shield, BarChart2, Wand2, X");

// Fix TS1259 / TS1192
content = content.replace("import React from 'react';", "import * as React from 'react';");
content = content.replace("import Prism from 'prismjs';", "import * as Prism from 'prismjs';");

// Extend Props interface
const newProps = `
  setIsRefining: (b: boolean) => void;
  setIsEditing: (b: boolean) => void;
  setSelectedPromptId: (id: string | null) => void;
  setCurrentView: (view: any) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  handleMagicSuggest: () => void;
  isMagicSuggesting: boolean;
  magicSuggestions: any;
  setMagicSuggestions: (val: any) => void;
  handleContentChange: (e: any) => void;
  varSuggest: any;
  COMMON_VARS: any[];
  mlSuggestedFolder: any;
  handleAutoTag: () => void;
  isAutoTagging: boolean;
  allTags: string[];
`;
content = content.replace("t: (key: string) => string;", "t: (key: string) => string;" + newProps);

// Add to destructured params
const params = `
  setIsRefining, setIsEditing, setSelectedPromptId, setCurrentView, showToast, handleMagicSuggest,
  isMagicSuggesting, magicSuggestions, setMagicSuggestions, handleContentChange, varSuggest,
  COMMON_VARS, mlSuggestedFolder, handleAutoTag, isAutoTagging, allTags
`;
content = content.replace("smartVariables, handleVarSelect, t", "smartVariables, handleVarSelect, t, " + params);

fs.writeFileSync('src/components/PromptEditor.tsx', content);
