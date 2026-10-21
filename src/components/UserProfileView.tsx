import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Camera, Save, User as UserIcon, Loader2, Github, Twitter, Globe } from 'lucide-react';

interface Props {
  onShowToast: (message: string, type: 'success'|'error'|'info') => void;
}

export const UserProfileView: React.FC<Props> = ({ onShowToast }) => {
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    displayName: auth.currentUser?.displayName || '',
    photoURL: auth.currentUser?.photoURL || '',
    bio: '',
    socialLinks: { twitter: '', github: '', website: '' }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.photoURL || null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth?.currentUser) {
        setIsLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setPhotoPreview(data.photoURL || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const updatedProfile: UserProfile = {
        uid: auth.currentUser.uid,
        displayName: profile.displayName || 'Anonymous',
        photoURL: photoPreview || undefined,
        bio: profile.bio || '',
        socialLinks: profile.socialLinks || {},
        followers: profile.followers || [],
        following: profile.following || []
      };
      await setDoc(userRef, updatedProfile, { merge: true });
      onShowToast('הפרופיל נשמר בהצלחה', 'success');
    } catch (e) {
      console.error(e);
      onShowToast('שגיאה בשמירת הפרופיל', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024) {
        onShowToast('תמונה חייבת להיות קטנה מ-200KB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setProfile(p => ({ ...p, photoURL: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  if (!auth?.currentUser && !isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-8" dir="rtl">
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-10 text-center shadow-sm">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <img src="/logo.png" alt="Panda Mascot" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">עליך להתחבר כדי לצפות בפרופיל</h2>
          <p className="text-slate-500 mb-8">התחבר עם Google כדי לשמור את הפרופיל שלך, לשתף פרומפטים עם הקהילה, ולנהל מועדפים.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8" dir="rtl">
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">הפרופיל שלי</h2>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-white/5 border-4 border-white dark:border-[#222] shadow-xl flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">שם תצוגה</label>
              <input
                type="text"
                value={profile.displayName || ''}
                onChange={e => setProfile({...profile, displayName: e.target.value})}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                placeholder="איך יראו אותך בקהילה?"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ביו (אודות)</label>
            <textarea
              value={profile.bio || ''}
              onChange={e => setProfile({...profile, bio: e.target.value})}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white min-h-[100px] resize-y"
              placeholder="ספר קצת על עצמך ועל תחומי העניין שלך בפרומפטים..."
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg border-b border-slate-100 dark:border-white/10 pb-2">קישורים חברתיים</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 shrink-0">
                <Twitter className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={profile.socialLinks?.twitter || ''}
                onChange={e => setProfile({...profile, socialLinks: {...profile.socialLinks, twitter: e.target.value}})}
                className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                placeholder="קישור לטוויטר (X)"
                dir="ltr"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 shrink-0">
                <Github className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={profile.socialLinks?.github || ''}
                onChange={e => setProfile({...profile, socialLinks: {...profile.socialLinks, github: e.target.value}})}
                className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                placeholder="קישור לגיטהאב"
                dir="ltr"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="url"
                value={profile.socialLinks?.website || ''}
                onChange={e => setProfile({...profile, socialLinks: {...profile.socialLinks, website: e.target.value}})}
                className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white"
                placeholder="אתר אישי (https://...)"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            שמור פרופיל
          </button>
        </div>
      </div>
    </div>
  );
};
