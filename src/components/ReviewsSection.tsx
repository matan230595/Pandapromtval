import React, { useState } from 'react';
import { Star, Send, User } from 'lucide-react';
import { Prompt, Review } from '../types';

interface Props {
  prompt: Prompt;
  onSaveReview: (review: Review) => void;
}

export const ReviewsSection: React.FC<Props> = ({ prompt, onSaveReview }) => {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    onSaveReview({
      id: Date.now().toString(),
      rating,
      text,
      date: new Date().toISOString()
    });
    
    setText('');
    setRating(5);
  };

  const reviews = prompt.reviews || [];
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
      <div className="flex justify-between items-center mb-6">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" /> דירוגים וביקורות
        </label>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300">
            {avgRating} <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> ({reviews.length})
          </div>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {reviews.map(r => (
          <div key={r.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">משתמש קהילה</span>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-3.5 h-3.5 ${star <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-700"}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed" dir="auto">{r.text}</p>
            <div className="text-[10px] text-slate-400 mt-2">{new Date(r.date).toLocaleDateString('he-IL')}</div>
          </div>
        ))}
        
        {reviews.length === 0 && (
          <div className="text-center py-6 text-sm text-slate-500">
            אין עדיין ביקורות לפרומפט זה. תהיה הראשון לדרג!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">הדירוג שלך:</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star} 
                type="button" 
                onClick={() => setRating(star)} 
                className="focus:outline-none"
              >
                <Star className={`w-5 h-5 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600 hover:text-amber-300"}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="כתוב ביקורת על הפרומפט..."
            className="flex-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button 
            type="submit" 
            disabled={!text.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" /> שלח
          </button>
        </div>
      </form>
    </div>
  );
};
