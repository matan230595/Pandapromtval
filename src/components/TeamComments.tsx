import React, { useState } from 'react';
import { Prompt, PromptComment } from '../types';
import { User, MessageSquare, Send } from 'lucide-react';
import { auth } from '../firebase';

interface Props {
  prompt: Prompt;
  onUpdate: (prompt: Partial<Prompt>) => void;
}

export const TeamComments: React.FC<Props> = ({ prompt, onUpdate }) => {
  const [newComment, setNewComment] = useState('');
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const user = auth.currentUser;
    const comment: PromptComment = {
      id: Date.now().toString(),
      promptId: prompt.id,
      authorId: user?.uid || 'anonymous',
      authorName: user?.displayName || 'אורח',
      authorPhoto: user?.photoURL || undefined,
      text: newComment,
      createdAt: new Date().toISOString()
    };
    
    onUpdate({ teamComments: [...(prompt.teamComments || []), comment] });
    setNewComment('');
  };

  const comments = prompt.teamComments || [];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111]">
      <div className="p-4 border-b border-slate-200 dark:border-white/10 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-emerald-500" /> דיון וצוות ({comments.length})
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center text-slate-400 text-sm mt-10">
            אין תגובות. היה הראשון להגיב!
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="flex gap-3 bg-slate-50 dark:bg-[#1a1a1a] p-3 rounded-xl border border-slate-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 overflow-hidden">
                {c.authorPhoto ? <img src={c.authorPhoto} alt={c.authorName} className="w-full h-full object-cover" /> : <User className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{c.authorName}</span>
                  <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString('he-IL')}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-white/10 flex gap-2 bg-slate-50 dark:bg-[#0a0a0a]">
        <input 
          type="text"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddComment()}
          placeholder="כתוב תגובה לחברי הצוות..."
          className="flex-1 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
        />
        <button onClick={handleAddComment} className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 transition-colors rounded-xl shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
