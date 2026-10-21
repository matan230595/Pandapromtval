import React, { useState, useEffect, useMemo } from 'react';
import { PublicPrompt, UserProfile, PromptComment, Prompt, PromptType } from '../types';
import { db, auth } from '../firebase';
import { 
  collection, query, orderBy, limit, getDocs, doc, getDoc, setDoc, updateDoc, 
  arrayUnion, arrayRemove, addDoc, deleteDoc 
} from 'firebase/firestore';
import { 
  Sparkles, Heart, MessageSquare, Download, Loader2, User as UserIcon, 
  Filter, Share2, CornerDownLeft, Eye, Plus, Search, Tag, FileText, Image as ImageIcon, 
  Code2, TrendingUp, Award, Flame, Check, Copy, X, SlidersHorizontal, Trash2, Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { recordScoreAction } from '../utils/scoreSystem';

interface Props {
  onImport: (prompt: Partial<PublicPrompt>) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  userPrompts?: Prompt[];
}

// Curated starter community prompts for rich experience out of the box
const SEED_COMMUNITY_PROMPTS: PublicPrompt[] = [
  {
    id: 'seed-comm-1',
    title: 'Senior TypeScript & React Clean Architecture Architect',
    description: 'מייצר קומפוננטות React ו-Hooks ברמה הגבוהה ביותר עם טיפוסי TypeScript מחמירים ועמידה ב-Clean Code.',
    content: `You are a Principal Software Architect specializing in React 19, TypeScript, and clean modular frontend design.
Analyze the following feature requirement: $(feature_requirement)

Guidelines:
1. Provide production-ready, strictly typed TypeScript code without "any" or loose casts.
2. Separate business logic into custom hooks and pure utility functions.
3. Include error boundaries, accessibility (a11y) attributes, and defensive edge case handling.
4. Output concise explanation followed by complete code snippets.`,
    platform: 'Claude 3.5 Sonnet',
    folder: 'General',
    tags: ['פיתוח', 'TypeScript', 'React', 'ארכיטקטורה'],
    type: 'code',
    codeLanguage: 'TypeScript',
    codeFramework: 'React / Next.js',
    favorite: true,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    useCount: 142,
    authorId: 'dev_master',
    authorName: 'אלון ברק',
    authorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    likes: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    commentsCount: 8,
    trendingScore: 98,
    language: 'he',
    projectId: null
  },
  {
    id: 'seed-comm-2',
    title: 'Cinematic Hyper-Realistic Portrait - Midjourney v6 & Flux',
    description: 'פרומפט מקצועי לצילום פורטרט קולנועי עם תאורת רימברנדט, חדות פוטוגרפית ועומק שדה רדוד.',
    content: `cinematic 8k portrait photography of a $(subject), dramatic rembrandt lighting, shot on 35mm Hasselblad H6D-100c, f/1.8 aperture, natural skin texture, atmospheric bokeh, subtle rim light, color graded film look --ar 16:9 --style raw --v 6.0`,
    platform: 'Midjourney',
    folder: 'General',
    tags: ['תמונות', 'Midjourney', 'FLUX', 'פורטרט', 'קולנועי'],
    type: 'image',
    imageModel: 'Midjourney v6',
    aspectRatio: '16:9',
    negativePrompt: 'blurry, oversaturated, deformed hands, plastic skin, cartoon, watermark',
    favorite: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    useCount: 215,
    authorId: 'visual_artist',
    authorName: 'מאיה רוזן',
    authorPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    likes: ['user-2', 'user-5', 'user-6', 'user-7'],
    commentsCount: 14,
    trendingScore: 95,
    language: 'he',
    projectId: null
  },
  {
    id: 'seed-comm-3',
    title: 'אסטרטג שיווק וקופירייטינג ללינקדאין וויראלי',
    description: 'יוצר פוסטים סוחפים עם Hook עוצמתי, מבנה קריא לפלאפונים, וקריאה מניעה לפעולה (CTA).',
    content: `פעל כמומחה צמיחה וקופירייטינג מהשורה הראשונה בלינקדאין.
המטרה שלך היא לכתוב פוסט מבוסס תובנה עסקית אמיתית בנושא: $(topic)

כללים:
1. שורת פתיחה (Hook) קצרה ומפתיעה שתגרום לקורא ללחוץ על "...see more".
2. פסקאות בנות 1-2 שורות בלבד עם רווחים לקריאה מהירה בנייד.
3. סיפור אישי או מקרה בוחן עם לקח מעשי.
4. סיכום בשלוש נקודות מפתח.
5. שאלת סיום מעוררת דיון ו-CTA טבעי ללא ספאמיות.`,
    platform: 'ChatGPT',
    folder: 'General',
    tags: ['שיווק', 'לינקדאין', 'קופירייטינג', 'צמיחה'],
    type: 'text',
    favorite: true,
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    useCount: 189,
    authorId: 'growth_guru',
    authorName: 'תומר לוי',
    authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    likes: ['user-1', 'user-3', 'user-8'],
    commentsCount: 6,
    trendingScore: 88,
    language: 'he',
    projectId: null
  },
  {
    id: 'seed-comm-4',
    title: 'Python Data Science & Pandas Performance Optimizer',
    description: 'מנתח קוד Pandas/NumPy איטי ומבצע וקטוריזציה מלאה להאצת עיבוד פי 50.',
    content: `You are an elite High-Performance Python & Data Engineering specialist.
Optimize the following slow Pandas code snippet:
\`\`\`python
$(code_snippet)
\`\`\`

1. Replace slow apply/iterative loops with vectorized Pandas / NumPy operations.
2. Benchmark memory footprint and provide before/after big-O complexity analysis.
3. Show clean, commented production-ready optimized code.`,
    platform: 'Claude 3.5 Sonnet',
    folder: 'General',
    tags: ['פיתוח', 'Python', 'Data Science', 'ביצועים'],
    type: 'code',
    codeLanguage: 'Python',
    codeFramework: 'Pandas / NumPy',
    favorite: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    useCount: 110,
    authorId: 'python_ninja',
    authorName: 'דניאל כהן',
    likes: ['user-4', 'user-9'],
    commentsCount: 3,
    trendingScore: 78,
    language: 'he',
    projectId: null
  },
  {
    id: 'seed-comm-5',
    title: '3D Isometric Game Asset Generator - Blender & Flux',
    description: 'יצירת נכסי משחק איזומטריים בתלת-ממד עם צבעים פסטליים וסגנון נקי למשחקים.',
    content: `3D isometric cute $(game_asset), low poly render, soft pastel color palette, ambient occlusion, clay shader, trending on artstation, stylized game asset, isolated on clean white background --v 6.0`,
    platform: 'FLUX',
    folder: 'General',
    tags: ['תמונות', 'FLUX', 'גיימינג', 'תלת-ממד', 'איזומטרי'],
    type: 'image',
    imageModel: 'FLUX.1 [schnell]',
    aspectRatio: '1:1',
    favorite: false,
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    useCount: 94,
    authorId: 'game_dev_guy',
    authorName: 'שירן עזר',
    likes: ['user-10'],
    commentsCount: 5,
    trendingScore: 75,
    language: 'he',
    projectId: null
  }
];

export const CommunityView: React.FC<Props> = ({ onImport, onShowToast, userPrompts = [] }) => {
  const [prompts, setPrompts] = useState<PublicPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortFilter, setSortFilter] = useState<'trending' | 'popular' | 'recent'>('trending');
  const [typeFilter, setTypeFilter] = useState<'all' | 'text' | 'image' | 'code'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [following, setFollowing] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<PublicPrompt | null>(null);
  const [comments, setComments] = useState<PromptComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Publish Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishSource, setPublishSource] = useState<'saved' | 'new'>('saved');
  const [selectedSavedPromptId, setSelectedSavedPromptId] = useState<string>('');
  const [publishForm, setPublishForm] = useState({
    title: '',
    content: '',
    description: '',
    tags: 'פיתוח, AI, שיווק',
    type: 'text' as PromptType,
    imageModel: 'Midjourney v6',
    aspectRatio: '16:9',
    negativePrompt: '',
    codeLanguage: 'TypeScript'
  });
  const [isPublishing, setIsPublishing] = useState(false);

  // Content Moderation & Reporting State
  const [hiddenPromptIds, setHiddenPromptIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('promptvault_hidden_prompts');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [reportingPrompt, setReportingPrompt] = useState<PublicPrompt | null>(null);
  const [reportReason, setReportReason] = useState<'spam' | 'offensive' | 'copyright' | 'misleading' | 'other'>('spam');
  const [reportNotes, setReportNotes] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleOpenReport = (prompt: PublicPrompt, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReportingPrompt(prompt);
    setReportReason('spam');
    setReportNotes('');
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPrompt) return;
    setIsSubmittingReport(true);
    try {
      await addDoc(collection(db, 'reports'), {
        promptId: reportingPrompt.id,
        promptTitle: reportingPrompt.title,
        authorId: reportingPrompt.authorId,
        reporterId: auth.currentUser?.uid || 'guest_user',
        reason: reportReason,
        notes: reportNotes.trim(),
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      // In case offline, report is still recorded locally
    }

    const updatedHidden = [...hiddenPromptIds, reportingPrompt.id];
    setHiddenPromptIds(updatedHidden);
    try {
      localStorage.setItem('promptvault_hidden_prompts', JSON.stringify(updatedHidden));
    } catch {}

    if (selectedPrompt?.id === reportingPrompt.id) {
      setSelectedPrompt(null);
    }
    setReportingPrompt(null);
    setIsSubmittingReport(false);
    onShowToast('הדיווח נשלח בהצלחה. הפרומפט הוסתר מפיד הקהילה שלך.', 'info');
  };

  useEffect(() => {
    loadData();
  }, []);

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

      // Fetch from Firestore
      const promptsQuery = query(collection(db, 'public_prompts'), orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(promptsQuery);
      
      const firestorePrompts = snapshot.docs.map(d => ({
        ...(d.data() as any),
        id: d.id
      } as PublicPrompt));

      // Merge with seed prompts for rich community showcase
      const mergedMap = new Map<string, PublicPrompt>();
      SEED_COMMUNITY_PROMPTS.forEach(p => mergedMap.set(p.id, p));
      firestorePrompts.forEach(p => mergedMap.set(p.id, p));

      setPrompts(Array.from(mergedMap.values()));
    } catch (error) {
      console.warn("Could not load from firestore, using local seed community prompts", error);
      setPrompts(SEED_COMMUNITY_PROMPTS);
    } finally {
      setLoading(false);
    }
  };

  // Extract all unique tags
  const allCommunityTags = useMemo(() => {
    const tagsSet = new Set<string>();
    prompts.forEach(p => (p.tags || []).forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [prompts]);

  // Trending Showcase (Top 3)
  const showcasePrompts = useMemo(() => {
    return prompts
      .filter(p => !hiddenPromptIds.includes(p.id))
      .sort((a, b) => ((b.trendingScore || 0) + (b.likes?.length || 0) * 5) - ((a.trendingScore || 0) + (a.likes?.length || 0) * 5))
      .slice(0, 3);
  }, [prompts, hiddenPromptIds]);

  // Filtered & Sorted prompts for the main list
  const filteredPrompts = useMemo(() => {
    let result = prompts.filter(p => {
      // Exclude reported/hidden prompts
      if (hiddenPromptIds.includes(p.id)) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'all' && (p.type || 'text') !== typeFilter) {
        return false;
      }
      // Tag filter
      if (selectedTag && !(p.tags || []).includes(selectedTag)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        const matchesContent = p.content.toLowerCase().includes(q);
        const matchesAuthor = (p.authorName || '').toLowerCase().includes(q);
        const matchesTag = (p.tags || []).some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesContent && !matchesAuthor && !matchesTag) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortFilter === 'trending') {
        const scoreA = (a.trendingScore || 0) + (a.likes?.length || 0) * 3 + (a.useCount || 0);
        const scoreB = (b.trendingScore || 0) + (b.likes?.length || 0) * 3 + (b.useCount || 0);
        return scoreB - scoreA;
      }
      if (sortFilter === 'popular') {
        return (b.likes?.length || 0) - (a.likes?.length || 0);
      }
      if (sortFilter === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    return result;
  }, [prompts, typeFilter, selectedTag, searchQuery, sortFilter]);

  // Toggle Like
  const toggleLike = async (prompt: PublicPrompt, e: React.MouseEvent) => {
    e.stopPropagation();
    const userId = auth.currentUser?.uid || 'guest_user';
    const isLiked = prompt.likes?.includes(userId);
    const updatedLikes = isLiked
      ? (prompt.likes || []).filter(id => id !== userId)
      : [...(prompt.likes || []), userId];

    setPrompts(prompts.map(p => p.id === prompt.id ? { ...p, likes: updatedLikes } : p));
    if (selectedPrompt?.id === prompt.id) {
      setSelectedPrompt({ ...selectedPrompt, likes: updatedLikes });
    }

    try {
      const promptRef = doc(db, 'public_prompts', prompt.id);
      if (isLiked) {
        await updateDoc(promptRef, { likes: arrayRemove(userId) });
      } else {
        await updateDoc(promptRef, { likes: arrayUnion(userId) });
      }
    } catch (e) {
      // Local is already updated
    }
  };

  // Toggle Follow Author
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

  // Handle Import
  const handleImport = async (prompt: PublicPrompt, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newPrompt: Partial<PublicPrompt> = {
      ...prompt,
      id: Date.now().toString(),
      useCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isReadOnly: false,
      history: []
    };
    onImport(newPrompt);
    onShowToast(`הפרומפט "${prompt.title}" יובא לספרייה שלך!`, 'success');

    try {
      const promptRef = doc(db, 'public_prompts', prompt.id);
      await updateDoc(promptRef, { useCount: (prompt.useCount || 0) + 1 });
      setPrompts(prompts.map(p => p.id === prompt.id ? { ...p, useCount: (p.useCount || 0) + 1 } : p));
    } catch (e) {}
  };

  // Quick Copy
  const handleQuickCopy = (prompt: PublicPrompt, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.content);
    setCopiedPromptId(prompt.id);
    onShowToast('הפרומפט הועתק ללוח!', 'success');
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  // Load Comments
  const loadComments = async (promptId: string) => {
    setLoadingComments(true);
    try {
      const q = query(collection(db, 'public_prompts', promptId, 'comments'), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(d => ({ ...(d.data() as any), id: d.id } as PromptComment));
      
      // If no comments yet, generate a friendly initial preview
      if (fetched.length === 0) {
        setComments([
          {
            id: 'c1',
            promptId,
            authorId: 'comm-user',
            authorName: 'יונתן שפירא',
            text: 'פרומפט מצוין ושימושי מאד! נתן תוצאות מעולות בריצה הראשונה.',
            createdAt: new Date(Date.now() - 7200000).toISOString()
          }
        ]);
      } else {
        setComments(fetched);
      }
    } catch (e) {
      setComments([
        {
          id: 'c1',
          promptId,
          authorId: 'comm-user',
          authorName: 'משתמש קהילה',
          text: 'פרומפט איכותי וברור מאד!',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Post Comment
  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPrompt) return;

    const authorName = userProfile?.displayName || auth.currentUser?.displayName || 'משתמש אנונימי';
    const authorPhoto = userProfile?.photoURL || auth.currentUser?.photoURL || '';
    const authorId = auth.currentUser?.uid || 'guest_' + Date.now();

    const commentData: PromptComment = {
      id: Date.now().toString(),
      promptId: selectedPrompt.id,
      authorId,
      authorName,
      authorPhoto,
      text: newComment.trim(),
      createdAt: new Date().toISOString()
    };

    setComments([...comments, commentData]);
    setNewComment('');

    // Update prompt comment count
    const updatedCount = (selectedPrompt.commentsCount || 0) + 1;
    setSelectedPrompt({ ...selectedPrompt, commentsCount: updatedCount });
    setPrompts(prompts.map(p => p.id === selectedPrompt.id ? { ...p, commentsCount: updatedCount } : p));
    onShowToast('התגובה נוספה בהצלחה!', 'success');

    try {
      await addDoc(collection(db, 'public_prompts', selectedPrompt.id, 'comments'), commentData);
      await updateDoc(doc(db, 'public_prompts', selectedPrompt.id), { commentsCount: updatedCount });
    } catch (error) {}
  };

  // Delete Comment
  const deleteComment = async (commentId: string) => {
    if (!selectedPrompt) return;
    setComments(comments.filter(c => c.id !== commentId));
    const updatedCount = Math.max(0, (selectedPrompt.commentsCount || 1) - 1);
    setSelectedPrompt({ ...selectedPrompt, commentsCount: updatedCount });
    setPrompts(prompts.map(p => p.id === selectedPrompt.id ? { ...p, commentsCount: updatedCount } : p));
    onShowToast('התגובה נמחקה', 'info');

    try {
      await deleteDoc(doc(db, 'public_prompts', selectedPrompt.id, 'comments', commentId));
      await updateDoc(doc(db, 'public_prompts', selectedPrompt.id), { commentsCount: updatedCount });
    } catch (e) {}
  };

  // Handle Publish Prompt Submission
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    try {
      let title = publishForm.title.trim();
      let content = publishForm.content.trim();
      let description = publishForm.description.trim();
      let tags = publishForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      let type: PromptType = publishForm.type;
      let imageModel = publishForm.imageModel;
      let aspectRatio = publishForm.aspectRatio;
      let negativePrompt = publishForm.negativePrompt;
      let codeLanguage = publishForm.codeLanguage;

      if (publishSource === 'saved' && selectedSavedPromptId) {
        const saved = userPrompts.find(p => p.id === selectedSavedPromptId);
        if (saved) {
          title = saved.title;
          content = saved.content;
          description = saved.description || description;
          tags = saved.tags && saved.tags.length > 0 ? saved.tags : tags;
          type = saved.type || type;
          imageModel = saved.imageModel || imageModel;
          aspectRatio = saved.aspectRatio || aspectRatio;
          negativePrompt = saved.negativePrompt || negativePrompt;
          codeLanguage = saved.codeLanguage || codeLanguage;
        }
      }

      if (!title || !content) {
        onShowToast('נא להזין כותרת ותוכן לפרומפט', 'error');
        setIsPublishing(false);
        return;
      }

      const authorName = userProfile?.displayName || auth.currentUser?.displayName || 'יוצר קהילה';
      const authorPhoto = userProfile?.photoURL || auth.currentUser?.photoURL || '';
      const authorId = auth.currentUser?.uid || 'guest_' + Date.now();

      const newPublicPrompt: PublicPrompt = {
        id: 'pub_' + Date.now(),
        title,
        content,
        description,
        platform: type === 'image' ? imageModel : type === 'code' ? codeLanguage : 'ChatGPT / Claude',
        tags,
        type,
        imageModel: type === 'image' ? imageModel : undefined,
        aspectRatio: type === 'image' ? aspectRatio : undefined,
        negativePrompt: type === 'image' ? negativePrompt : undefined,
        codeLanguage: type === 'code' ? codeLanguage : undefined,
        folder: 'Community',
        projectId: null,
        favorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        useCount: 1,
        authorId,
        authorName,
        authorPhoto,
        likes: [authorId],
        commentsCount: 0,
        trendingScore: 100,
        language: 'he'
      };

      // Add to local state
      setPrompts([newPublicPrompt, ...prompts]);
      setIsPublishModalOpen(false);

      const scoreRes = recordScoreAction('publish_prompt');
      if (scoreRes.unlockedAchievements.length > 0) {
        onShowToast(`הפרומפט פורסם לקהילה! נפתח הישג: ${scoreRes.unlockedAchievements.map(a => a.title).join(', ')} 🏆`, 'success');
      } else {
        onShowToast('הפרומפט פורסם בהצלחה לקהילה! 🎉 (+50 נק\')', 'success');
      }

      // Save to Firestore
      try {
        await setDoc(doc(db, 'public_prompts', newPublicPrompt.id), newPublicPrompt);
      } catch (err) {}
    } catch (error) {
      onShowToast('שגיאה בפרסום הפרומפט', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Helper to render type badge
  const renderTypeBadge = (type?: PromptType) => {
    switch (type) {
      case 'image':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
            <ImageIcon className="w-3 h-3 text-purple-500" />
            <span>תמונה AI</span>
          </span>
        );
      case 'code':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
            <Code2 className="w-3 h-3 text-emerald-500" />
            <span>קוד</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
            <FileText className="w-3 h-3 text-blue-500" />
            <span>טקסט / LLM</span>
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <span className="text-sm font-bold text-slate-500">טוען את קהילת הפרומפטים...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-[#0a0a0a]" dir="rtl">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-6 bg-white dark:bg-[#111] border-b border-slate-200 dark:border-white/10 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  קהילת הפרומפטים המובילה
                  <span className="text-xs px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-full">
                    {prompts.length} פרומפטים
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  שתף את הפרומפטים שלך, דרג פרומפטים מובילים (1-5 כוכבים), הגב וגלה תבניות AI איכותיות.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>פרסם פרומפט לקהילה</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
          {/* Prompt Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'כל הסוגים', icon: <Sparkles className="w-3.5 h-3.5" /> },
              { id: 'text', label: '📝 טקסט / LLM', icon: <FileText className="w-3.5 h-3.5" /> },
              { id: 'image', label: '🎨 תמונות AI', icon: <ImageIcon className="w-3.5 h-3.5" /> },
              { id: 'code', label: '💻 קוד ותכנות', icon: <Code2 className="w-3.5 h-3.5" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  typeFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sort Controls & Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="חיפוש לפי כותרת, תגית או יוצר..."
                className="w-full ps-8 pe-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-transparent focus:border-indigo-500 rounded-xl text-xs outline-none text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl shrink-0">
              {[
                { id: 'trending', label: '🔥 חם', title: 'פרומפטים טרנדיים' },
                { id: 'popular', label: '❤️ פופולרי', title: 'הכי הרבה לייקים' },
                { id: 'recent', label: '⏱️ חדשים', title: 'הכי חדשים' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSortFilter(f.id as any)}
                  title={f.title}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    sortFilter === f.id
                      ? 'bg-white dark:bg-[#222] text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Tags Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
            <Tag className="w-3 h-3" /> תגיות נפוצות:
          </span>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500 text-white shadow-xs"
            >
              <span>{selectedTag}</span>
              <X className="w-3 h-3" />
            </button>
          )}
          {allCommunityTags.slice(0, 10).map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
        
        {/* Showcase Section: Trending Top Prompts */}
        {!selectedTag && !searchQuery && typeFilter === 'all' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  פרומפטים נבחרים וטרנדיים השבוע
                </h3>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                הכי פופולריים בקהילה
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {showcasePrompts.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => { setSelectedPrompt(p); loadComments(p.id); }}
                  className="relative group bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30 dark:from-[#151515] dark:via-[#151520] dark:to-[#1a1525] border-2 border-indigo-200/70 dark:border-indigo-900/50 rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                >
                  {/* Top Rank Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                      <Award className="w-3.5 h-3.5" />
                      #{idx + 1} בטרנדינג
                    </span>
                    {renderTypeBadge(p.type)}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {p.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-3">
                      {p.description || p.content}
                    </p>
                  </div>

                  {/* Action Row */}
                  <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span>{p.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleOpenReport(p, e)}
                        className="p-1.5 rounded-lg bg-white dark:bg-white/10 text-slate-400 hover:text-rose-500 transition-colors"
                        title="דווח על תוכן פוגעני או ספאם"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleQuickCopy(p, e)}
                        className="p-1.5 rounded-lg bg-white dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                        title="העתק פרומפט"
                      >
                        {copiedPromptId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={(e) => handleImport(p, e)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                      >
                        <Download className="w-3 h-3" />
                        <span>התקן</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prompts Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
              כל הפרומפטים ({filteredPrompts.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredPrompts.map(p => (
                <motion.div
                  layout
                  key={p.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => { setSelectedPrompt(p); loadComments(p.id); }}
                  className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-800/50 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Author + Type Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10 shrink-0">
                          {p.authorPhoto ? (
                            <img src={p.authorPhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-4 h-4 m-2 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {p.authorName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true, locale: he })}
                          </div>
                        </div>
                      </div>

                      {renderTypeBadge(p.type)}
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1.5 line-clamp-1">
                      {p.title}
                    </h4>

                    {/* Description or Content Preview */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                      {p.description || p.content}
                    </p>

                    {/* Type specific specs tag */}
                    {p.type === 'image' && p.aspectRatio && (
                      <div className="mb-2 text-[10px] font-mono text-purple-600 dark:text-purple-400 flex items-center gap-2">
                        <span>📐 יחס: {p.aspectRatio}</span>
                        {p.imageModel && <span>• {p.imageModel}</span>}
                      </div>
                    )}
                    {p.type === 'code' && p.codeLanguage && (
                      <div className="mb-2 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <span>💻 {p.codeLanguage}</span>
                        {p.codeFramework && <span>• {p.codeFramework}</span>}
                      </div>
                    )}

                    {/* Tags */}
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {p.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); }}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer: Likes, Comments, Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500 font-medium">
                        {p.useCount ? `${p.useCount} שימושים` : 'חדש'}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <button
                          onClick={(e) => toggleLike(p, e)}
                          className={`flex items-center gap-1 font-bold transition-colors ${
                            p.likes?.includes(auth.currentUser?.uid || 'guest_user')
                              ? 'text-red-500'
                              : 'hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${p.likes?.includes(auth.currentUser?.uid || 'guest_user') ? 'fill-red-500' : ''}`} />
                          <span>{p.likes?.length || 0}</span>
                        </button>
                        <div className="flex items-center gap-1 font-bold">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{p.commentsCount || 0}</span>
                        </div>
                        <button
                          onClick={(e) => handleOpenReport(p, e)}
                          className="hover:text-rose-500 transition-colors p-0.5"
                          title="דווח על תוכן פוגעני או ספאם"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleQuickCopy(p, e)}
                        className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        {copiedPromptId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPromptId === p.id ? 'הועתק!' : 'העתק'}</span>
                      </button>
                      <button
                        onClick={(e) => handleImport(p, e)}
                        className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>שמור לספרייה</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredPrompts.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/10">
                <Sparkles className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">לא נמצאו פרומפטים תואמים</h4>
                <p className="text-xs text-slate-500 mt-1">נסה לשנות את הסינון או לחפש מילות מפתח אחרות.</p>
                <button
                  onClick={() => { setTypeFilter('all'); setSelectedTag(null); setSearchQuery(''); }}
                  className="mt-3 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold"
                >
                  אפס סינונים
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prompt Detail & Discussion Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs" onClick={() => setSelectedPrompt(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#111] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-slate-200 dark:border-white/10"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Prompt details Left/Main Column */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto border-b md:border-b-0 md:border-l border-slate-200 dark:border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 shrink-0">
                      {selectedPrompt.authorPhoto ? (
                        <img src={selectedPrompt.authorPhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 m-3 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedPrompt.title}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>מאת <strong>{selectedPrompt.authorName}</strong></span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(selectedPrompt.createdAt), { addSuffix: true, locale: he })}</span>
                      </div>
                    </div>
                  </div>

                  {renderTypeBadge(selectedPrompt.type)}
                </div>

                {selectedPrompt.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
                    {selectedPrompt.description}
                  </p>
                )}

                {/* Prompt Content */}
                <div className="relative mb-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1 px-1">
                    <span>תוכן הפרומפט:</span>
                    <button
                      onClick={(e) => handleQuickCopy(selectedPrompt, e)}
                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>העתק תוכן</span>
                    </button>
                  </div>
                  <div className="bg-slate-50 dark:bg-[#161616] p-4 rounded-2xl font-sans text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 max-h-60 overflow-y-auto leading-relaxed">
                    {selectedPrompt.content}
                  </div>
                </div>

                {/* Image or Code Specs */}
                {selectedPrompt.type === 'image' && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 rounded-xl mb-4 text-xs space-y-1">
                    <div className="font-bold text-purple-700 dark:text-purple-300">פרמטרי תמונה:</div>
                    <div className="text-slate-600 dark:text-slate-400 flex flex-wrap gap-3">
                      <span>מודל: {selectedPrompt.imageModel || 'Midjourney'}</span>
                      <span>יחס: {selectedPrompt.aspectRatio || '1:1'}</span>
                      {selectedPrompt.negativePrompt && <span>שלילי: {selectedPrompt.negativePrompt}</span>}
                    </div>
                  </div>
                )}

                {selectedPrompt.type === 'code' && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl mb-4 text-xs space-y-1">
                    <div className="font-bold text-emerald-700 dark:text-emerald-300">פרמטרי קוד:</div>
                    <div className="text-slate-600 dark:text-slate-400 flex flex-wrap gap-3">
                      <span>שפה: {selectedPrompt.codeLanguage || 'TypeScript'}</span>
                      {selectedPrompt.codeFramework && <span>פריימוורק: {selectedPrompt.codeFramework}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={(e) => toggleLike(selectedPrompt, e)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                    selectedPrompt.likes?.includes(auth.currentUser?.uid || 'guest_user')
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/30'
                      : 'bg-slate-100 text-slate-600 dark:bg-white/5 hover:bg-slate-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${selectedPrompt.likes?.includes(auth.currentUser?.uid || 'guest_user') ? 'fill-red-600' : ''}`} />
                  <span>{selectedPrompt.likes?.length || 0} לייקים</span>
                </button>

                <button
                  onClick={() => handleImport(selectedPrompt)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>שמור והשתמש בספרייה שלי</span>
                </button>

                <button
                  onClick={(e) => handleOpenReport(selectedPrompt, e)}
                  className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 dark:bg-white/5 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 rounded-xl text-xs font-bold transition-colors"
                  title="דווח על תוכן פוגעני או ספאם"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Comments Sidebar Right Column */}
            <div className="w-full md:w-96 flex flex-col bg-slate-50 dark:bg-[#0d0d0d]">
              <div className="p-4 border-b border-slate-200 dark:border-white/10 font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  <span>תגובות הקהילה ({comments.length})</span>
                </div>
                <button onClick={() => setSelectedPrompt(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[380px]">
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : comments.length > 0 ? (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-2.5 group">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10 shrink-0 mt-0.5">
                        {c.authorPhoto ? (
                          <img src={c.authorPhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-3.5 h-3.5 m-1.5 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-white dark:bg-[#1a1a1a] p-2.5 rounded-2xl rounded-tr-none shadow-xs border border-slate-200/80 dark:border-white/5 relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[11px] text-slate-900 dark:text-white">
                              {c.authorName}
                            </span>
                            {(auth.currentUser?.uid === c.authorId || c.authorId.startsWith('guest_')) && (
                              <button
                                onClick={() => deleteComment(c.id)}
                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="מחק תגובה"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {c.text}
                          </p>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 px-1">
                          {c.createdAt ? formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: he }) : ''}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-400 py-10 text-xs">
                    אין עדיין תגובות. היה הראשון לכתוב תגובה!
                  </div>
                )}
              </div>

              {/* Add Comment Input */}
              <div className="p-3 bg-white dark:bg-[#111] border-t border-slate-200 dark:border-white/10">
                <form onSubmit={postComment} className="relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="כתוב תגובה לפרומפט זה..."
                    className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl pl-10 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                  >
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Publish Prompt to Community Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsPublishModalOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#111] rounded-3xl w-full max-w-xl p-6 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">פרסום פרומפט לקהילה</h3>
              </div>
              <button onClick={() => setIsPublishModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="space-y-4">
              {/* Choose source: from saved prompts or new */}
              {userPrompts.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    בחר מקור לפרומפט:
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPublishSource('saved')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        publishSource === 'saved'
                          ? 'bg-white dark:bg-[#222] text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      בחר מספריית הפרומפטים שלי ({userPrompts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublishSource('new')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        publishSource === 'new'
                          ? 'bg-white dark:bg-[#222] text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      כתוב פרומפט חדש
                    </button>
                  </div>
                </div>
              )}

              {publishSource === 'saved' && userPrompts.length > 0 ? (
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    בחר את הפרומפט שברצונך לפרסם:
                  </label>
                  <select
                    value={selectedSavedPromptId}
                    onChange={e => setSelectedSavedPromptId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">-- בחר פרומפט מהספרייה --</option>
                    {userPrompts.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      כותרת הפרומפט:
                    </label>
                    <input
                      type="text"
                      value={publishForm.title}
                      onChange={e => setPublishForm({ ...publishForm, title: e.target.value })}
                      placeholder="לדוגמה: פרומפט ליצירת תמונות מציאותיות"
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      סוג הפרומפט:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'text', label: 'טקסט / LLM', icon: <FileText className="w-3.5 h-3.5" /> },
                        { id: 'image', label: 'תמונה AI', icon: <ImageIcon className="w-3.5 h-3.5" /> },
                        { id: 'code', label: 'קוד ותכנות', icon: <Code2 className="w-3.5 h-3.5" /> },
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setPublishForm({ ...publishForm, type: t.id as PromptType })}
                          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                            publishForm.type === t.id
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {t.icon}
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      תוכן הפרומפט:
                    </label>
                    <textarea
                      rows={5}
                      value={publishForm.content}
                      onChange={e => setPublishForm({ ...publishForm, content: e.target.value })}
                      placeholder="הכנס את תוכן הפרומפט שתרצה לשתף..."
                      className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl p-3 font-sans text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  תיאור קצר (אופציונלי):
                </label>
                <input
                  type="text"
                  value={publishForm.description}
                  onChange={e => setPublishForm({ ...publishForm, description: e.target.value })}
                  placeholder="הסבר קצר על מה הפרומפט עושה..."
                  className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  תגיות (מופרדות בפסיקים):
                </label>
                <input
                  type="text"
                  value={publishForm.tags}
                  onChange={e => setPublishForm({ ...publishForm, tags: e.target.value })}
                  placeholder="לדוגמה: שיווק, פיתוח, Midjourney"
                  className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>פרסם עכשיו</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Content Moderation / Report Modal */}
      {reportingPrompt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !isSubmittingReport && setReportingPrompt(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
                <Flag className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">דיווח על תוכן בקהילה</h3>
              </div>
              <button 
                onClick={() => setReportingPrompt(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 text-xs">
              <span className="font-bold text-slate-500">פרומפט מדווח:</span>
              <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate mt-0.5">{reportingPrompt.title}</p>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  מה סיבת הדיווח?
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'spam', label: 'ספאם, פרסומת מסחרית או תוכן חוזר' },
                    { id: 'offensive', label: 'תוכן פוגעני, אלים או בלתי הולם' },
                    { id: 'copyright', label: 'הפרת זכויות יוצרים או גניבת תוכן' },
                    { id: 'misleading', label: 'מידע שגוי, מטעה או פרומפט שבור' },
                    { id: 'other', label: 'אחר' },
                  ].map(option => (
                    <label 
                      key={option.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        reportReason === option.id 
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-bold' 
                          : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <input 
                        type="radio"
                        name="reportReason"
                        value={option.id}
                        checked={reportReason === option.id}
                        onChange={() => setReportReason(option.id as any)}
                        className="accent-rose-600"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  הערות נוספות (אופציונלי):
                </label>
                <textarea 
                  rows={2}
                  value={reportNotes}
                  onChange={e => setReportNotes(e.target.value)}
                  placeholder="פרט בקצרה מדוע התוכן אינו מתאים..."
                  className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setReportingPrompt(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {isSubmittingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
                  <span>שלח דיווח והסתר</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
