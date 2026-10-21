import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, RotateCcw, Filter, Star, Sparkles, Code2, FileText, ArrowUpDown } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedType: string;
  onSelectType: (type: string) => void;
  categoryFilter: string;
  onSelectCategory: (cat: string) => void;
  availableCategories: string[];
  tagFilter: string;
  onSelectTag: (tag: string) => void;
  availableTags: string[];
  favoriteOnly: boolean;
  onToggleFavoriteOnly: () => void;
  sortOrder: string;
  onSelectSortOrder: (order: any) => void;
  onResetAll: () => void;
  matchingCount: number;
}

export const MobileFilterSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedType,
  onSelectType,
  categoryFilter,
  onSelectCategory,
  availableCategories,
  tagFilter,
  onSelectTag,
  availableTags,
  favoriteOnly,
  onToggleFavoriteOnly,
  sortOrder,
  onSelectSortOrder,
  onResetAll,
  matchingCount,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative z-10 bg-white dark:bg-[#151515] rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-slate-200 dark:border-white/10"
        >
          {/* Drag Handle */}
          <div className="pt-3 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">סינון ומיון</h3>
                <p className="text-xs text-slate-500">{matchingCount} פרומפטים תואמים</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResetAll}
                className="text-xs font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>איפוס</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Filter Options */}
          <div className="overflow-y-auto px-5 py-4 space-y-5 flex-1">
            {/* 1. Prompt Type */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                סוג פרומפט
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all_types', label: 'הכל', icon: Filter },
                  { id: 'type:text', label: 'טקסט / LLM', icon: FileText },
                  { id: 'type:image', label: 'תמונות AI', icon: Sparkles },
                  { id: 'type:code', label: 'קוד ותכנות', icon: Code2 },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => onSelectType(type.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{type.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 ms-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Sort Order */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>סדר מיון</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'relevance', label: 'הכי רלוונטי (Relevance)' },
                  { id: 'recent', label: 'עודכן לאחרונה' },
                  { id: 'created', label: 'תאריך הוספה (Date Added)' },
                  { id: 'popular', label: 'הכי פופולרי (Popularity)' },
                  { id: 'alpha', label: 'לפי א-ב' },
                ].map((sort) => {
                  const isSelected = sortOrder === sort.id;
                  return (
                    <button
                      key={sort.id}
                      type="button"
                      onClick={() => onSelectSortOrder(sort.id)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-start flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 font-bold'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{sort.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Favorites Toggle */}
            <div>
              <button
                type="button"
                onClick={onToggleFavoriteOnly}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                  favoriteOnly
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400/20'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${favoriteOnly ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                  <span>הצג רק פרומפטים מועדפים</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${favoriteOnly ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'}`}>
                  {favoriteOnly && <Check className="w-3.5 h-3.5" />}
                </div>
              </button>
            </div>

            {/* 4. Category Filter */}
            {availableCategories.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  פלטפורמה / קטגוריה
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      categoryFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    הכל
                  </button>
                  {availableCategories.map((cat) => {
                    const isSelected = categoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => onSelectCategory(isSelected ? 'all' : cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Tag Filter */}
            {availableTags.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  תגיות נבחרות
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  <button
                    type="button"
                    onClick={() => onSelectTag('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      tagFilter === 'all'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    כל התגיות
                  </button>
                  {availableTags.slice(0, 15).map((tag) => {
                    const isSelected = tagFilter === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => onSelectTag(isSelected ? 'all' : tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Button */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-[#111]">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>הצג {matchingCount} תוצאות</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
