import React, { useState, useEffect } from 'react';
import { PublicPrompt, UserProfile, PromptComment } from '../types';
import { db, auth } from '../firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp } from 'firebase/firestore';
import { Sparkles, Heart, MessageSquare, Download, Loader2, User as UserIcon, Star, Filter, Share2, CornerDownLeft, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface Props {
  onImport: (prompt: Partial<PublicPrompt>) => void;
  onShowToast: (message: string, type: 'success'|'error'|'info') => void;
}

export const CommunityView: React.FC<Props> = ({ onImport, onShowToast }) => {
  const [prompts, setPrompts] = useState<PublicPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'popular' | 'trending' | 'following'>('popular');
  const [following, setFollowing] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PublicPrompt | null>(null);
  const [comments, setComments] = useState<PromptComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setUserProfile(data);
            setFollowing(data.following || []);
          }
        }
        
        let promptsQuery;
        // In a real app we'd use complex queries, but for now we fetch recent and sort locally
        promptsQuery = query(collection(db, 'public_prompts'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(promptsQuery);
        let fetchedPrompts = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as PublicPrompt));
        
        if (filter === 'popular') {
          fetchedPrompts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        } else if (filter === 'trending') {
          fetchedPrompts.sort((a, b) => (b.useCount || 0) - (a.useCount || 0));
        } else if (filter === 'following' && auth.currentUser) {
          // fetch followed users prompts
          fetchedPrompts = fetchedPrompts.filter(p => following.includes(p.authorId));
        }
        setPrompts(fetchedPrompts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filter, following.length]);

  const toggleLike = async (prompt: PublicPrompt, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    const isLiked = prompt.likes?.includes(auth.currentUser.uid);
    try {
      const promptRef = doc(db, 'public_prompts', prompt.id);
      if (isLiked) {
        await updateDoc(promptRef, { likes: arrayRemove(auth.currentUser.uid) });
        setPrompts(prompts.map(p => p.id === prompt.id ? {...p, likes: p.likes.filter(id => id !== auth.currentUser?.uid)} : p));
      } else {
        await updateDoc(promptRef, { likes: arrayUnion(auth.currentUser.uid) });
        setPrompts(prompts.map(p => p.id === prompt.id ? {...p, likes: [...(p.likes||[]), auth.currentUser!.uid]} : p));
      }
    } catch (e) {
      console.error(e);
      onShowToast('שגיאה בעדכון הלייק', 'error');
    }
  };

  const toggleFollow = async (authorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser || auth.currentUser.uid === authorId) return;
    const isFollowing = following.includes(authorId);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      if (isFollowing) {
        await updateDoc(userRef, { following: arrayRemove(authorId) });
        setFollowing(f => f.filter(id => id !== authorId));
        onShowToast('הסרת עוקב בהצלחה', 'info');
      } else {
        await updateDoc(userRef, { following: arrayUnion(authorId) });
        setFollowing(f => [...f, authorId]);
        onShowToast('עוקב נוסף בהצלחה', 'success');
      }
    } catch (error) {
      onShowToast('שגיאה בעדכון עוקב', 'error');
    }
  };

  const handleImport = async (prompt: PublicPrompt) => {
    const newPrompt = {
      ...prompt,
      id: Date.now().toString(),
      useCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isReadOnly: false,
      history: []
    };
    onImport(newPrompt);
    try {
      // Increment use count
      const promptRef = doc(db, 'public_prompts', prompt.id);
      await updateDoc(promptRef, { useCount: (prompt.useCount || 0) + 1 });
      setPrompts(prompts.map(p => p.id === prompt.id ? {...p, useCount: (p.useCount || 0) + 1} : p));
    } catch (e) {}
  };

  const loadComments = async (promptId: string) => {
    setLoadingComments(true);
    try {
      const q = query(collection(db, 'public_prompts', promptId, 'comments'), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      setComments(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as PromptComment)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(false);
    }
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPrompt || !auth.currentUser) return;
    
    try {
      const commentData = {
        promptId: selectedPrompt.id,
        authorId: auth.currentUser.uid,
        authorName: userProfile?.displayName || auth.currentUser.displayName || 'Anonymous',
        authorPhoto: userProfile?.photoURL || auth.currentUser.photoURL || '',
        text: newComment,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'public_prompts', selectedPrompt.id, 'comments'), commentData);
      setComments([...comments, { ...commentData, id: docRef.id } as PromptComment]);
      setNewComment('');
      await updateDoc(doc(db, 'public_prompts', selectedPrompt.id), { commentsCount: (selectedPrompt.commentsCount || 0) + 1 });
    } catch (error) {
      onShowToast('שגיאה בשליחת תגובה', 'error');
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header & Filters */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-500" />
              קהילת הפרומפטים
            </h2>
            <p className="text-sm text-slate-500 mt-1">גלה, דרג ושתף פרומפטים עם הקהילה.</p>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
            {(['popular', 'trending', 'following'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${filter === f ? 'bg-white dark:bg-[#222] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {f === 'popular' ? 'פופולרי' : f === 'trending' ? 'חמים' : 'נעקבים'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {prompts.map(p => (
              <motion.div
                layout
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => { setSelectedPrompt(p); loadComments(p.id); }}
                className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer group flex flex-col"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
                      {p.authorPhoto ? <img src={p.authorPhoto} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 m-2.5 text-slate-400" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{p.title}</h4>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span className="font-medium">{p.authorName}</span>
                        {auth.currentUser && p.authorId !== auth.currentUser.uid && (
                          <button onClick={(e) => toggleFollow(p.authorId, e)} className="text-blue-500 hover:text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                            {following.includes(p.authorId) ? 'נעקב' : '+ עקוב'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-1">{p.content}</p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                  <div className="flex gap-4">
                    <button onClick={(e) => toggleLike(p, e)} className={`flex items-center gap-1 text-xs font-bold transition-colors ${p.likes?.includes(auth.currentUser?.uid || '') ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}>
                      <Heart className={`w-3.5 h-3.5 ${p.likes?.includes(auth.currentUser?.uid || '') ? 'fill-red-500' : ''}`} />
                      {p.likes?.length || 0}
                    </button>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {p.commentsCount || 0}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleImport(p); }} className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:scale-105 transition-transform flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> שמור
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {prompts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              אין פרומפטים להצגה בקטגוריה זו.
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedPrompt(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#111] rounded-3xl w-full max-w-4xl max-h-full overflow-hidden flex flex-col md:flex-row shadow-2xl border border-slate-200 dark:border-white/10"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Prompt details */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto border-b md:border-b-0 md:border-l border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  {selectedPrompt.authorPhoto ? <img src={selectedPrompt.authorPhoto} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 m-3 text-slate-400" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedPrompt.title}</h3>
                  <div className="text-sm text-slate-500 flex items-center gap-2">
                    מאת <span className="font-bold text-slate-700 dark:text-slate-300">{selectedPrompt.authorName}</span>
                    {selectedPrompt.createdAt && <span>• {formatDistanceToNow(new Date(selectedPrompt.createdAt), {addSuffix: true, locale: he})}</span>}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl font-mono text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-300 mb-6">
                {selectedPrompt.content}
              </div>

              <div className="flex items-center gap-4">
                <button onClick={(e) => toggleLike(selectedPrompt, e)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${selectedPrompt.likes?.includes(auth.currentUser?.uid || '') ? 'bg-red-50 text-red-600 dark:bg-red-900/30' : 'bg-slate-100 text-slate-600 dark:bg-white/5 hover:bg-slate-200'}`}>
                  <Heart className={`w-4 h-4 ${selectedPrompt.likes?.includes(auth.currentUser?.uid || '') ? 'fill-red-600' : ''}`} />
                  {selectedPrompt.likes?.length || 0} לייקים
                </button>
                <button onClick={() => handleImport(selectedPrompt)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" /> התקן לספרייה
                </button>
              </div>
            </div>

            {/* Comments sidebar */}
            <div className="w-full md:w-96 flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
              <div className="p-4 border-b border-slate-200 dark:border-white/10 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                תגובות הקהילה ({comments.length})
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px]">
                {loadingComments ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                ) : comments.length > 0 ? (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0 mt-1">
                        {c.authorPhoto ? <img src={c.authorPhoto} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 m-2 text-slate-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="bg-white dark:bg-[#1a1a1a] p-3 rounded-2xl rounded-tr-none shadow-sm border border-slate-200 dark:border-white/5">
                          <div className="font-bold text-xs text-slate-900 dark:text-white mb-1">{c.authorName}</div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{c.text}</p>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 px-1">
                          {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), {addSuffix: true, locale: he}) : ''}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 py-8 text-sm">היה הראשון להגיב!</div>
                )}
              </div>

              <div className="p-4 bg-white dark:bg-[#111] border-t border-slate-200 dark:border-white/10">
                <form onSubmit={postComment} className="relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="כתוב תגובה..."
                    className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                  />
                  <button type="submit" disabled={!newComment.trim()} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-400">
                    <CornerDownLeft className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
