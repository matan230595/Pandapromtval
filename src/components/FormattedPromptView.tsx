import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Code, FileText, Copy, Check, Eye, Terminal, 
  Variable, CheckCircle2, ChevronDown, ChevronUp, Layers
} from 'lucide-react';
import * as Prism from 'prismjs';

interface Props {
  content: string;
  isFullscreen?: boolean;
  onCopyVariable?: (varName: string) => void;
  showToast?: (message: string, type: 'success' | 'info') => void;
}

/**
 * FormattedPromptView
 * Renders prompt text as a modern, human-readable app document
 * rather than a raw monospace computer code block.
 * Supports inline dynamic variables with interactive chips,
 * clean headings, lists, and an optional toggle to code mode.
 */
export const FormattedPromptView: React.FC<Props> = ({
  content,
  isFullscreen = false,
  showToast
}) => {
  const [viewMode, setViewMode] = useState<'app' | 'code'>('app');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Extract variables: {{var}}, $(VAR), {VAR}, or [VAR]
  const detectedVariables = useMemo(() => {
    const regex = /(\{\{([^{}]+)\}\}|\$\(([a-zA-Z0-9_-]+)\)|\[([A-Zא-ת0-9_\s-]{2,})\])/g;
    const matches = new Set<string>();
    let m;
    while ((m = regex.exec(content)) !== null) {
      const v = m[2] || m[3] || m[4];
      if (v && v.trim().length > 0) {
        matches.add(v.trim());
      }
    }
    return Array.from(matches);
  }, [content]);

  const handleCopyVar = (v: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`{{${v}}}`);
    setCopiedVar(v);
    if (showToast) showToast(`המשתנה {{${v}}} הועתק`, 'success');
    setTimeout(() => setCopiedVar(null), 1800);
  };

  // Render text with rich interactive variable chips and clean paragraphs
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Split content by paragraphs
    const paragraphs = content.split(/\n{2,}/);

    return paragraphs.map((para, pIdx) => {
      const trimmed = para.trim();
      if (!trimmed) return null;

      // Header 1 (# Title)
      if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^#\s+/, '');
        return (
          <h2 key={pIdx} className="text-xl md:text-2xl font-black text-slate-900 dark:text-white pt-4 pb-2 border-b border-slate-100 dark:border-white/5 tracking-tight">
            {renderInlineVariables(text, handleCopyVar, copiedVar)}
          </h2>
        );
      }

      // Header 2 (## Subtitle)
      if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^##\s+/, '');
        return (
          <h3 key={pIdx} className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-slate-100 pt-3 pb-1 tracking-tight">
            {renderInlineVariables(text, handleCopyVar, copiedVar)}
          </h3>
        );
      }

      // Header 3 (### Subtitle)
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^###\s+/, '');
        return (
          <h4 key={pIdx} className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 pt-2 pb-0.5">
            {renderInlineVariables(text, handleCopyVar, copiedVar)}
          </h4>
        );
      }

      // Actual code block inside triple backticks (```lang ... ```)
      if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
        const lines = trimmed.split('\n');
        const lang = lines[0].replace('```', '').trim() || 'javascript';
        const codeText = lines.slice(1, -1).join('\n');
        const highlighted = Prism.languages[lang] 
          ? Prism.highlight(codeText, Prism.languages[lang], lang)
          : Prism.highlight(codeText, Prism.languages.markdown, 'markdown');

        return (
          <div key={pIdx} className="my-4 rounded-2xl bg-slate-900 text-slate-100 p-4 border border-slate-800 shadow-inner overflow-x-auto text-sm font-mono dir-ltr text-left">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-slate-400 font-sans">
              <span className="font-semibold uppercase tracking-wider">{lang}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(codeText);
                  if (showToast) showToast('הקוד הועתק ללוח', 'success');
                }}
                className="hover:text-white transition-colors"
              >
                העתק קוד
              </button>
            </div>
            <pre dangerouslySetInnerHTML={{ __html: highlighted }} />
          </div>
        );
      }

      // Blockquote (> text)
      if (trimmed.startsWith('>')) {
        const text = trimmed.replace(/^>\s*/gm, '');
        return (
          <blockquote key={pIdx} className="my-3 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border-r-4 border-indigo-500 text-slate-700 dark:text-slate-300 italic text-sm md:text-base leading-relaxed">
            {renderInlineVariables(text, handleCopyVar, copiedVar)}
          </blockquote>
        );
      }

      // Check if it's a bullet list or numbered list
      const lines = trimmed.split('\n');
      const isList = lines.every(l => /^\s*([*\-•]|\d+\.)\s+/.test(l));

      if (isList) {
        return (
          <ul key={pIdx} className="space-y-2 my-3">
            {lines.map((line, lIdx) => {
              const cleaned = line.replace(/^\s*([*\-•]|\d+\.)\s+/, '');
              const isNumbered = /^\s*\d+\.\s+/.test(line);
              const numMatch = line.match(/^\s*(\d+)\.\s+/);
              return (
                <li key={lIdx} className="flex items-start gap-3 text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                  {isNumbered ? (
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                      {numMatch ? numMatch[1] : lIdx + 1}
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2.5" />
                  )}
                  <span className="flex-1">
                    {renderInlineVariables(cleaned, handleCopyVar, copiedVar)}
                  </span>
                </li>
              );
            })}
          </ul>
        );
      }

      // Regular Paragraph
      return (
        <p key={pIdx} className={`text-slate-800 dark:text-slate-200 transition-all ${
          isFullscreen 
            ? 'text-lg md:text-xl leading-[2]' 
            : 'text-base md:text-lg leading-relaxed'
        }`}>
          {renderInlineVariables(trimmed, handleCopyVar, copiedVar)}
        </p>
      );
    });
  }, [content, isFullscreen, copiedVar]);

  return (
    <div className="space-y-4">
      {/* View Mode Switcher Header & Detected Variables Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/5">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5">
          <button
            type="button"
            onClick={() => setViewMode('app')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'app'
                ? 'bg-white dark:bg-[#202020] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>תצוגת אפליקציה</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'code'
                ? 'bg-white dark:bg-[#202020] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>קוד ו-Markdown</span>
          </button>
        </div>

        {/* Right: Quick Variable Indicators */}
        {detectedVariables.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Variable className="w-3.5 h-3.5 text-indigo-500" />
              <span>משתנים שזוהו:</span>
            </span>
            {detectedVariables.map(v => (
              <button
                key={v}
                type="button"
                onClick={(e) => handleCopyVar(v, e)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 text-xs font-bold transition-all"
                title={`לחץ להעתקת המשתנה {{${v}}}`}
              >
                {copiedVar === v ? <Check className="w-3 h-3 text-emerald-500" /> : null}
                <span>{`{{${v}}}`}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Render Canvas */}
      {viewMode === 'app' ? (
        <div 
          className="space-y-4 font-sans leading-relaxed selection:bg-indigo-500/20"
          dir="auto"
        >
          {renderedElements}
        </div>
      ) : (
        /* Monospace Code & Markdown syntax view */
        <div 
          className={`font-mono leading-8 whitespace-pre-wrap text-slate-800 dark:text-slate-200 p-4 bg-slate-50 dark:bg-[#0e0e0e] rounded-2xl border border-slate-200/80 dark:border-white/5 ${
            isFullscreen ? 'text-[18px] md:text-[22px] max-w-4xl mx-auto my-8 leading-[1.8]' : 'text-[15px]'
          }`}
          dir="auto"
          dangerouslySetInnerHTML={{ 
            __html: Prism.highlight(content, Prism.languages.markdown, 'markdown') 
          }} 
        />
      )}
    </div>
  );
};

/**
 * Helper to parse inline text and render variables like {{var}} or $(VAR)
 * as beautiful tactile badges.
 */
function renderInlineVariables(
  text: string, 
  onCopy: (v: string, e: React.MouseEvent) => void,
  copiedVar: string | null
): React.ReactNode {
  const regex = /(\{\{([^{}]+)\}\}|\$\(([a-zA-Z0-9_-]+)\)|\[([A-Zא-ת0-9_\s-]{2,})\])/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const varName = match[2] || match[3] || match[4];
    const fullMatch = match[0];

    parts.push(
      <span
        key={`var-${match.index}`}
        onClick={(e) => onCopy(varName, e)}
        className="inline-flex items-center gap-1 mx-1 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm border border-indigo-200/80 dark:border-indigo-800/50 shadow-2xs hover:shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-all active:scale-95 select-all"
        title={`משתנה חכם: לחץ להעתקה`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
        <span>{fullMatch}</span>
        {copiedVar === varName && <Check className="w-3 h-3 text-emerald-500" />}
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  // Add trailing text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
