import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit2, Trash2, Tag, Check, Palette, Layers, AlertCircle } from 'lucide-react';
import { Category, Prompt } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveCategories: (categories: Category[]) => void;
  prompts: Prompt[];
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f43f5e', // rose
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#64748b', // slate
];

export const ManageCategoriesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
  prompts,
  onShowToast
}) => {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingCatId(null);
    setName('');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setDescription('');
    setIsCreating(true);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setName(cat.name);
    setColor(cat.color || PRESET_COLORS[0]);
    setDescription(cat.description || '');
    setIsCreating(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      onShowToast('אנא הזן שם לקטגוריה', 'error');
      return;
    }

    // Check duplicate name
    const isDuplicate = categories.some(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editingCatId
    );
    if (isDuplicate) {
      onShowToast('קטגוריה בשם זה כבר קיימת', 'error');
      return;
    }

    if (editingCatId) {
      const updated = categories.map(c => 
        c.id === editingCatId ? { ...c, name: trimmedName, color, description: description.trim() } : c
      );
      onSaveCategories(updated);
      onShowToast('הקטגוריה עודכנה בהצלחה', 'success');
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: trimmedName,
        color,
        description: description.trim(),
        createdAt: new Date().toISOString()
      };
      onSaveCategories([...categories, newCat]);
      onShowToast(`הקטגוריה "${trimmedName}" נוצרה בהצלחה`, 'success');
    }

    setIsCreating(false);
    setEditingCatId(null);
  };

  const handleDelete = (catId: string, catName: string) => {
    const count = prompts.filter(p => p.categories?.includes(catId) || p.categories?.includes(catName)).length;
    if (count > 0) {
      if (!confirm(`שים לב: ${count} פרומפטים משוייכים לקטגוריה "${catName}". האם למחוק אותה בכל זאת?`)) {
        return;
      }
    }
    const updated = categories.filter(c => c.id !== catId);
    onSaveCategories(updated);
    onShowToast(`הקטגוריה "${catName}" נמחקה`, 'info');
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#131313] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">ניהול קטגוריות</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">ארגן וקטלג את הפרומפטים שלך לפי תחומי עבודה</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Create/Edit Form */}
            {isCreating ? (
              <form onSubmit={handleSave} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {editingCatId ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    ביטול
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">שם הקטגוריה</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="למשל: אוטומציה ו-AI, פיננסים, כתיבה שיווקית..."
                    required
                    autoFocus
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">צבע מזהה</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                          color === c ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-110 shadow-sm' : ''
                        }`}
                      >
                        {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5 ms-2">
                      <input
                        type="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="w-6 h-6 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                        title="בחר צבע מותאם אישית"
                      />
                      <span className="text-[10px] font-mono text-slate-400">{color}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">תיאור (אופציונלי)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="הסבר קצר על סוגי הפרומפטים בקטגוריה זו..."
                    className="w-full px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
                  >
                    {editingCatId ? 'עדכן קטגוריה' : 'שמור קטגוריה'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={handleStartCreate}
                className="w-full py-2.5 px-4 border border-dashed border-indigo-300 dark:border-indigo-800/60 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>צור קטגוריה חדשה</span>
              </button>
            )}

            {/* List of existing categories */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                קטגוריות קיימות ({categories.length})
              </span>

              {categories.map(cat => {
                const count = prompts.filter(p => p.categories?.includes(cat.id) || p.categories?.includes(cat.name)).length;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200/80 dark:border-white/5 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: cat.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                            {cat.name}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                            {count} פרומפטים
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{cat.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="ערוך קטגוריה"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 transition-colors"
                        title="מחק קטגוריה"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#161616]/50 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-800 dark:text-white transition-colors"
            >
              סגור
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
