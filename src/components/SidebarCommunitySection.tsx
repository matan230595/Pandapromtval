import React, { useState } from 'react';
import { POPULAR_COMMUNITY_TEMPLATES, CommunityTemplateItem } from '../data/communityTemplates';
import { usePromptStore } from '../store/promptStore';
import { Sparkles, Download, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prompt } from '../types';

interface Props {
  onOpenCommunityHub: () => void;
  showToast?: (message: string, type: string) => void;
}

export const SidebarCommunitySection: React.FC<Props> = ({
  onOpenCommunityHub,
  showToast
}) => {
  const { prompts, savePrompt, setSelectedPromptId } = usePromptStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [installedIds, setInstalledIds] = useState<string[]>(() => {
    // Check which ones might already be installed by title match
    const existingTitles = new Set(prompts.map(p => p.title.trim()));
    return POPULAR_COMMUNITY_TEMPLATES
      .filter(tpl => existingTitles.has(tpl.title.trim()))
      .map(tpl => tpl.id);
  });

  const handleImport = async (tpl: CommunityTemplateItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (importingId) return;
    setImportingId(tpl.id);

    try {
      const now = new Date().toISOString();
      const newPrompt: Prompt = {
        id: 'comm-user-' + Date.now(),
        title: tpl.title,
        description: tpl.description,
        content: tpl.content,
        folder: 'all',
        topic: tpl.category,
        tags: [...tpl.tags, 'קהילה'],
        platform: tpl.platform,
        favorite: false,
        useCount: 1,
        language: 'he',
        projectId: null,
        createdAt: now,
        updatedAt: now,
        lastUsedAt: now,
        usageHistory: [now]
      };

      await savePrompt(newPrompt);
      setInstalledIds(prev => [...prev, tpl.id]);
      if (showToast) {
        showToast(`תבנית "${tpl.title}" יובאה בהצלחה לספרייה!`, 'success');
      }
    } catch (err) {
      console.error("Failed to import community template", err);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="space-y-1.5 px-1">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2 mb-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>תבניות קהילה נבחרות</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          type="button"
          onClick={onOpenCommunityHub}
          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
          title="פתח את מאגר הקהילה המלא"
        >
          <span>הכל</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Templates List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1 overflow-hidden"
          >
            {POPULAR_COMMUNITY_TEMPLATES.slice(0, 4).map(tpl => {
              const isInstalled = installedIds.includes(tpl.id);
              const isCurrentlyImporting = importingId === tpl.id;

              return (
                <div
                  key={tpl.id}
                  className="group relative flex flex-col p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-slate-50/50 hover:bg-indigo-50/40 dark:bg-white/[0.02] dark:hover:bg-indigo-950/20 transition-all text-right"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {tpl.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                        {tpl.description}
                      </p>
                    </div>

                    {/* 1-Click Import Button */}
                    <button
                      type="button"
                      onClick={(e) => handleImport(tpl, e)}
                      disabled={isInstalled || isCurrentlyImporting}
                      className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all shadow-xs ${
                        isInstalled
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60'
                          : 'bg-white dark:bg-[#1f1f1f] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white border border-slate-200 dark:border-white/10'
                      }`}
                      title={isInstalled ? 'תבנית זו כבר נמצאת בספרייה שלך' : 'ייבא תבנית זו ישירות לספרייה'}
                    >
                      {isInstalled ? (
                        <>
                          <Check className="w-2.5 h-2.5" />
                          <span>נוסף</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-2.5 h-2.5" />
                          <span>ייבא</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Category & Platform Footer */}
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-200/40 dark:border-white/5 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Download className="w-2.5 h-2.5 text-indigo-500" />
                      <span>{tpl.installs.toLocaleString()} התקנות</span>
                    </div>

                    <span className="px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-white/10 font-mono text-[9px] text-slate-600 dark:text-slate-300">
                      {tpl.platform}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Quick Link to Browse All */}
            <button
              type="button"
              onClick={onOpenCommunityHub}
              className="w-full py-1.5 px-3 rounded-xl border border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>עיין בכל תבניות הקהילה</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
