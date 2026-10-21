import React, { useState } from 'react';
import { Download, LayoutTemplate, Search, Tag, Filter } from 'lucide-react';
import { Prompt } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const PREDEFINED_TEMPLATES: Partial<Prompt>[] = [
  {
    title: 'SEO Article Writer',
    description: 'Generates a highly optimized SEO article based on target keywords.',
    content: 'Act as an expert SEO copywriter. Write a 1000-word article about {topic}. Include the following keywords naturally: {keywords}. Ensure the tone is {tone}. Structure with H1, H2, and H3 tags. Add a compelling meta description at the end.',
    topic: 'SEO',
    tags: ['SEO', 'Copywriting', 'Blog'],
    platform: 'ChatGPT',
  },
  {
    title: 'Code Review Assistant',
    description: 'Analyzes code for bugs, security issues, and best practices.',
    content: 'Review the following code snippet. Focus on:\n1. Security vulnerabilities\n2. Performance bottlenecks\n3. Code readability and maintainability\n4. Adherence to best practices\n\nProvide actionable suggestions and a refactored version if necessary.\n\nCode:\n{code}',
    topic: 'Coding',
    tags: ['Code Review', 'Security', 'Refactoring'],
    platform: 'Claude',
  },
  {
    title: 'Marketing Email Campaign',
    description: 'Writes a 3-part email sequence for product launch.',
    content: 'Act as a seasoned email marketer. Write a 3-part email sequence for launching a new product called {product_name}.\nEmail 1: Teaser and problem awareness.\nEmail 2: Product announcement and key benefits.\nEmail 3: Urgency and call to action.\nTarget audience: {audience}. Tone: {tone}.',
    topic: 'Marketing',
    tags: ['Email', 'Launch', 'Sales'],
    platform: 'ChatGPT',
  },
  {
    title: 'React Component Generator',
    description: 'Generates a functional React component with Tailwind CSS.',
    content: 'Write a React functional component named {component_name} using TypeScript and Tailwind CSS. It should accept the following props: {props}. Include basic error handling and an accessible, responsive layout. Use lucide-react for icons if needed.',
    topic: 'Coding',
    tags: ['React', 'Frontend', 'Tailwind'],
    platform: 'Gemini',
  }
];

interface Props {
  onImport: (template: Partial<Prompt>) => void;
}

export const TemplatesGallery: React.FC<Props> = ({ onImport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');

  const topics = ['All', ...Array.from(new Set(PREDEFINED_TEMPLATES.map(t => t.topic)))];

  const filtered = PREDEFINED_TEMPLATES.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === 'All' || t.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-2">
            <LayoutTemplate className="w-8 h-8 text-indigo-500" />
            תבניות מוכנות
          </h2>
          <p className="text-slate-500 dark:text-slate-400">ייבא תבניות פרומפטים מקצועיות מוגדרות מראש ישירות לכספת שלך.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-[#111] p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="חפש תבניות..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-4 pr-9 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="pl-4 pr-9 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white appearance-none min-w-[120px]"
            >
              {topics.map(t => <option key={t || 'All'} value={t || 'All'}>{t || 'All'}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((template, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              key={template.title}
              className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-3xl p-6 flex flex-col shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate mb-1">{template.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
                      {template.topic}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-md">
                      {template.platform}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onImport(template)}
                  className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors shrink-0"
                  title="ייבא תבנית"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1 line-clamp-3">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
                {template.tags?.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs rounded-lg font-medium">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
          <p>לא נמצאו תבניות התואמות לחיפוש.</p>
        </div>
      )}
    </div>
  );
};
