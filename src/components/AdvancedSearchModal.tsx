import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, X, Tag, Layers, Folder as FolderIcon, Filter, 
  Sparkles, Check, ArrowRight, CornerDownLeft, Star, ExternalLink, RefreshCw
} from 'lucide-react';
import { Prompt, Folder, Category } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  folders: Folder[];
  categories: Category[];
  allTags: string[];
  onSelectPrompt: (promptId: string) => void;
  onApplyFiltersToLibrary: (filters: {
    keyword: string;
    selectedTags: string[];
    selectedCategory: string | null;
    folderId: string | null;
    platform: string | null;
  }) => void;
}

export const AdvancedSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  prompts,
  folders,
  categories,
  allTags,
  onSelectPrompt,
  onApplyFiltersToLibrary
}) => {
  const [keyword, setKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [searchScope, setSearchScope] = useState<'all' | 'title' | 'content'>('all');
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const [minPopularity, setMinPopularity] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'oldest' | 'popularity' | 'title'>('relevance');

  const platforms = ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'DALL-E', 'General'];

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Reset all search fields
  const handleReset = () => {
    setKeyword('');
    setSelectedTags([]);
    setSelectedCategory(null);
    setSelectedFolderId(null);
    setSelectedPlatform(null);
    setSearchScope('all');
    setDateRange('all');
    setMinPopularity(false);
    setSortBy('relevance');
  };

  // Filter prompts according to active criteria
  const matchingPrompts = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const tokens = kw.split(/\s+/).filter(Boolean);

    const filtered = prompts.filter(p => {
      // 1. Keyword check
      if (tokens.length > 0) {
        const title = (p.title || '').toLowerCase();
        const content = (p.content || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const notes = (p.notes || '').toLowerCase();

        const matchScope = (token: string) => {
          if (searchScope === 'title') {
            return title.includes(token);
          }
          if (searchScope === 'content') {
            return content.includes(token) || desc.includes(token);
          }
          // 'all' scope
          const pCategories = (p.categories || []).map(cId => {
            const cat = categories.find(c => c.id === cId || c.name === cId);
            return (cat ? `${cat.name} ${cId}` : cId).toLowerCase();
          }).join(' ');
          const pTags = (p.tags || []).join(' ').toLowerCase();

          return (
            title.includes(token) ||
            content.includes(token) ||
            desc.includes(token) ||
            notes.includes(token) ||
            pCategories.includes(token) ||
            pTags.includes(token)
          );
        };

        const allTokensMatch = tokens.every(matchScope);
        if (!allTokensMatch) return false;
      }

      // 2. Tags check (must include all selected tags)
      if (selectedTags.length > 0) {
        const pTags = p.tags || [];
        const hasAllTags = selectedTags.every(st => pTags.includes(st));
        if (!hasAllTags) return false;
      }

      // 3. Category check
      if (selectedCategory) {
        const catObj = categories.find(c => c.id === selectedCategory || c.name === selectedCategory);
        const pCats = p.categories || [];
        const matchesCategory = pCats.includes(selectedCategory) || (catObj && pCats.includes(catObj.name));
        if (!matchesCategory) return false;
      }

      // 4. Folder check
      if (selectedFolderId && selectedFolderId !== 'all') {
        if (p.folder !== selectedFolderId) return false;
      }

      // 5. Platform check
      if (selectedPlatform && selectedPlatform !== 'all') {
        if (p.platform?.toLowerCase() !== selectedPlatform.toLowerCase()) return false;
      }

      // 6. Date range check
      if (dateRange !== 'all') {
        const pDate = new Date(p.updatedAt || p.createdAt).getTime();
        const now = Date.now();
        const diffDays = (now - pDate) / (1000 * 60 * 60 * 24);
        if (dateRange === '7days' && diffDays > 7) return false;
        if (dateRange === '30days' && diffDays > 30) return false;
        if (dateRange === '90days' && diffDays > 90) return false;
      }

      // 7. Popularity check
      if (minPopularity) {
        if ((p.useCount || 0) <= 0 && !p.favorite) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime();
      }
      if (sortBy === 'popularity') {
        return (b.useCount || 0) - (a.useCount || 0);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    return filtered;
  }, [prompts, keyword, selectedTags, selectedCategory, selectedFolderId, selectedPlatform, searchScope, dateRange, minPopularity, sortBy, categories]);

  if (!isOpen) return null;

  const hasActiveFilters = Boolean(
    keyword.trim() || 
    selectedTags.length > 0 || 
    selectedCategory || 
    selectedFolderId || 
    selectedPlatform || 
    searchScope !== 'all'
  );

  const handleApplyToLibrary = () => {
    onApplyFiltersToLibrary({
      keyword: keyword.trim(),
      selectedTags,
      selectedCategory,
      folderId: selectedFolderId,
      platform: selectedPlatform
    });
    onClose();
  };

  // Highlight search text helper
  const highlightMatch = (text: string, term: string) => {
    if (!term || !text) return text;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-900/60 text-slate-900 dark:text-amber-100 rounded-sm px-0.5 font-bold">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm select-none" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-4xl bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-[#111]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                חיפוש מתקדם בפרומפטים
              </h3>
              <p className="text-xs text-slate-500">
                חיפוש משולב לפי מילות מפתח, תגיות, קטגוריות ותיקיות
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                איפוס הכל
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Filters & Live Results */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-200 dark:divide-white/10">
          
          {/* Left Column: Filter Controls (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 space-y-4 overflow-y-auto bg-slate-50/30 dark:bg-[#121212]/30 text-xs">
            {/* 1. Keyword Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                מילות מפתח (Keywords)
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="חיפוש חופשי בכל הטקסטים..."
                  className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl ps-9 pe-8 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
                  autoFocus
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => setKeyword('')}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Scope Pills */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-bold">טווח חיפוש:</span>
                {(['all', 'title', 'content'] as const).map(sc => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setSearchScope(sc)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      searchScope === sc
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    {sc === 'all' ? 'הכל' : sc === 'title' ? 'כותרת בלבד' : 'תוכן בלבד'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Categories Filter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3 text-indigo-500" />
                  <span>קטגוריה</span>
                </label>
                {selectedCategory && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    נקה בחירה
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                {categories.map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'text-white shadow-2xs'
                          : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                      }`}
                      style={isSelected ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }}
                      />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Tags Multi-Select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3 h-3 text-purple-500" />
                  <span>תגיות (Tags) {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
                </label>
                {selectedTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTags([])}
                    className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    נקה תגיות
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {allTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-purple-600 border-purple-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-purple-300'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
                {allTags.length === 0 && (
                  <span className="text-[11px] text-slate-400 italic">אין תגיות זמינות</span>
                )}
              </div>
            </div>

            {/* 4. Folder & Platform Filters */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 dark:border-white/5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  תיקייה
                </label>
                <select
                  value={selectedFolderId || 'all'}
                  onChange={e => setSelectedFolderId(e.target.value === 'all' ? null : e.target.value)}
                  className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="all">כל התיקיות</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  פלטפורמה
                </label>
                <select
                  value={selectedPlatform || 'all'}
                  onChange={e => setSelectedPlatform(e.target.value === 'all' ? null : e.target.value)}
                  className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="all">כל הפלטפורמות</option>
                  {platforms.map(pl => (
                    <option key={pl} value={pl}>{pl}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Sorting, Date Range & Popularity Filters */}
            <div className="space-y-3 pt-3 border-t border-slate-200/80 dark:border-white/5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    מיון תוצאות
                  </label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="relevance">רלוונטיות</option>
                    <option value="newest">החדשים ביותר</option>
                    <option value="oldest">הישנים ביותר</option>
                    <option value="popularity">הפופולריים ביותר (שימוש)</option>
                    <option value="title">לפי א'-ת' (כותרת)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    טווח תאריכים
                  </label>
                  <select
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value as any)}
                    className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="all">כל הזמנים</option>
                    <option value="7days">שבוע אחרון</option>
                    <option value="30days">חודש אחרון</option>
                    <option value="90days">3 חודשים אחרונים</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={minPopularity}
                    onChange={e => setMinPopularity(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>הצג רק פרומפטים פופולריים / מועדפים בשימוש</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Live Matching Results (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-white dark:bg-[#151515]">
            {/* Results Counter Header */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">תוצאות חיפוש:</span>
                <span className="font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                  {matchingPrompts.length} פרומפטים
                </span>
              </div>

              <button
                type="button"
                onClick={handleApplyToLibrary}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-2xs transition-colors"
              >
                <span>החל על הספריה</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </div>

            {/* Results Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {matchingPrompts.map(prompt => {
                const folderName = folders.find(f => f.id === prompt.folder)?.name;

                return (
                  <div
                    key={prompt.id}
                    onClick={() => {
                      onSelectPrompt(prompt.id);
                      onClose();
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-800 bg-white dark:bg-[#1a1a1a] hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 cursor-pointer transition-all group shadow-2xs space-y-2"
                  >
                    {/* Item Top: Title + Quick Access Button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {highlightMatch(prompt.title, keyword)}
                        </h4>
                        {prompt.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {highlightMatch(prompt.description, keyword)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 dark:text-slate-400 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <span>פתח</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Content Snippet */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans bg-slate-50 dark:bg-black/20 p-2 rounded-xl border border-slate-100 dark:border-white/5">
                      {highlightMatch(prompt.content.slice(0, 160), keyword)}
                    </p>

                    {/* Metadata Strip: Category, Tags, Platform */}
                    <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Platform */}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-bold text-slate-600 dark:text-slate-300">
                          {prompt.platform || 'כללי'}
                        </span>

                        {/* Folder */}
                        {folderName && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <FolderIcon className="w-3 h-3" />
                            <span>{folderName}</span>
                          </span>
                        )}

                        {/* Categories */}
                        {prompt.categories?.slice(0, 2).map(cId => {
                          const cat = categories.find(c => c.id === cId || c.name === cId);
                          const name = cat?.name || cId;
                          const color = cat?.color || '#6366f1';
                          return (
                            <span
                              key={cId}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border"
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

                        {/* Tags */}
                        {prompt.tags?.slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-semibold">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <span className="text-[10px] font-mono shrink-0">
                        {new Date(prompt.updatedAt).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                  </div>
                );
              })}

              {matchingPrompts.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    לא נמצאו פרומפטים תואמים
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    נסה לשנות את מילות החיפוש, להסיר תגיות או לאפס את סינון הקטגוריות.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                  >
                    נקה את כל הסננים
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:px-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-[#111]/50 text-xs">
          <div className="text-slate-500 font-medium">
            הקש <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-[10px]">Enter</kbd> לפתיחת הפרומפט הראשון, או לחץ לפתיחה מיידית
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-bold transition-colors"
            >
              סגור
            </button>
            <button
              type="button"
              onClick={handleApplyToLibrary}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>הצג {matchingPrompts.length} תוצאות בספריה</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
