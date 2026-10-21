import React, { useState } from 'react';
import { 
  X, Mail, Lock, LogIn, UserPlus, Key, Eye, EyeOff, ShieldCheck, 
  Check, AlertCircle, Sparkles, User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  updateProfile 
} from 'firebase/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface PasswordEvaluation {
  score: number;
  label: string;
  color: string;
  hasMinLength: boolean;
  hasMixedCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

function evaluatePassword(pass: string): PasswordEvaluation {
  const hasMinLength = pass.length >= 8;
  const hasMixedCase = /[a-z]/.test(pass) && /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(pass);

  let score = 0;
  if (pass.length >= 6) score++;
  if (hasMinLength) score++;
  if (hasMixedCase || (hasNumber && hasSpecialChar)) score++;
  if (hasMinLength && hasMixedCase && hasNumber && hasSpecialChar) score++;

  let label = 'חלשה';
  let color = 'bg-rose-500';
  if (score === 2) {
    label = 'בינונית';
    color = 'bg-amber-500';
  } else if (score === 3) {
    label = 'טובה';
    color = 'bg-blue-500';
  } else if (score >= 4) {
    label = 'חזקה ומאובטחת';
    color = 'bg-emerald-500';
  }

  return { score, label, color, hasMinLength, hasMixedCase, hasNumber, hasSpecialChar };
}

function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'כתובת האימייל הזו כבר רשומה במערכת. אנא התחבר לחשבונך.';
    case 'auth/invalid-email':
      return 'כתובת האימייל שהוזנה אינה תקינה.';
    case 'auth/user-not-found':
      return 'לא נמצא משתמש עם כתובת אימייל זו.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'כתובת האימייל או הסיסמה שגויים. אנא נסה שוב.';
    case 'auth/weak-password':
      return 'הסיסמה חלשה מדי. עליה להכיל לפחות 6 תווים (מומלץ 8 ומעלה).';
    case 'auth/too-many-requests':
      return 'בוצעו ניסיונות התחברות כושלים רבים מדי. אנא המתן מספר דקות ונסה שוב.';
    case 'auth/network-request-failed':
      return 'שגיאת רשת. אנא בדוק את החיבור לאינטרנט ונסה שוב.';
    case 'auth/popup-closed-by-user':
      return 'חלון ההתחברות של Google נסגר לפני סיום התהליך.';
    default:
      return 'אירעה שגיאה בתהליך האימות. אנא נסה שנית.';
  }
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onShowToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('promptvault_remembered_email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  if (!isOpen) return null;

  const passwordEval = evaluatePassword(password);
  const passwordsMatch = !isLogin ? password === confirmPassword && confirmPassword.length > 0 : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isResetMode) {
      handleResetPassword();
      return;
    }

    if (!isLogin) {
      if (password.length < 8) {
        onShowToast('מטעמי אבטחה, הסיסמה חייבת להכיל לפחות 8 תווים', 'error');
        return;
      }
      if (password !== confirmPassword) {
        onShowToast('הסיסמאות אינן תואמות', 'error');
        return;
      }
      if (passwordEval.score < 2) {
        onShowToast('הסיסמה חלשה מדי. אנא הוסף מספרים או אותיות גדולות', 'error');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        if (rememberMe) {
          localStorage.setItem('promptvault_remembered_email', email.trim());
        } else {
          localStorage.removeItem('promptvault_remembered_email');
        }
        onShowToast('התחברת בהצלחה ל-Prompt Vault!', 'success');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim() && userCredential.user) {
          try {
            await updateProfile(userCredential.user, {
              displayName: displayName.trim()
            });
          } catch (profileErr) {
            console.warn('Could not update display name:', profileErr);
          }
        }
        if (rememberMe) {
          localStorage.setItem('promptvault_remembered_email', email.trim());
        }
        onShowToast(`ברוך הבא ${displayName.trim() || ''}! החשבון נוצר בהצלחה`, 'success');
      }
      onClose();
    } catch (err: any) {
      const msg = getAuthErrorMessage(err?.code);
      onShowToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      onShowToast('אנא הזן כתובת אימייל לקבלת קישור איפוס', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      onShowToast('אימייל לאיפוס סיסמה נשלח בהצלחה! בדוק את תיבת הדואר שלך', 'success');
      setIsResetMode(false);
    } catch (err: any) {
      const msg = getAuthErrorMessage(err?.code);
      onShowToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onShowToast('התחברת בהצלחה עם חשבון Google!', 'success');
      onClose();
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
        const msg = getAuthErrorMessage(error?.code);
        onShowToast(msg, 'error');
      }
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 shrink-0">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              {isResetMode ? (
                <>
                  <Key className="w-5 h-5 text-amber-500" />
                  <span>איפוס סיסמה</span>
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>התחברות למערכת</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>יצירת חשבון חדש</span>
                </>
              )}
            </h3>
            <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab selector between Login and Signup */}
          {!isResetMode && (
            <div className="p-1.5 bg-slate-100 dark:bg-white/5 mx-5 mt-4 rounded-2xl flex items-center shrink-0">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setIsResetMode(false); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  isLogin 
                    ? 'bg-white dark:bg-[#1e1e1e] text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                התחברות
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setIsResetMode(false); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  !isLogin 
                    ? 'bg-white dark:bg-[#1e1e1e] text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                הרשמה
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
            {/* Display Name (Only in Registration) */}
            {!isLogin && !isResetMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  שם מלא / כינוי
                </label>
                <div className="relative">
                  <UserIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="ישראל ישראלי"
                    className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl pr-10 pl-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                כתובת אימייל
              </label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  dir="ltr"
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl pr-10 pl-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password Field (Hidden in Reset Mode) */}
            {!isResetMode && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    סיסמה
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      שכחת סיסמה?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl pr-10 pl-10 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator on Sign Up */}
                {!isLogin && password.length > 0 && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-600 dark:text-slate-400">חוזק סיסמה:</span>
                      <span className={`font-black ${
                        passwordEval.score <= 1 ? 'text-rose-500' :
                        passwordEval.score === 2 ? 'text-amber-500' :
                        passwordEval.score === 3 ? 'text-blue-500' : 'text-emerald-500'
                      }`}>
                        {passwordEval.label}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4].map(step => (
                        <div
                          key={step}
                          className={`h-full flex-1 transition-all ${
                            step <= passwordEval.score ? passwordEval.color : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Checklist Requirements */}
                    <div className="grid grid-cols-2 gap-1 text-[10px] pt-1">
                      <div className={`flex items-center gap-1 ${passwordEval.hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        <Check className="w-3 h-3" />
                        <span>לפחות 8 תווים</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordEval.hasMixedCase ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        <Check className="w-3 h-3" />
                        <span>אותיות A-z</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordEval.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        <Check className="w-3 h-3" />
                        <span>לפחות מספר אחד</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordEval.hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        <Check className="w-3 h-3" />
                        <span>תו מיוחד (!@#$)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password Field (Sign Up Only) */}
            {!isLogin && !isResetMode && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  אימות סיסמה
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    dir="ltr"
                    placeholder="••••••••"
                    className={`w-full bg-slate-50 dark:bg-[#1a1a1a] border rounded-xl pr-10 pl-10 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 transition-all ${
                      confirmPassword.length > 0 && !passwordsMatch 
                        ? 'border-rose-400 focus:ring-rose-500/50' 
                        : 'border-slate-200 dark:border-white/10 focus:ring-indigo-500/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showConfirmPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <p className={`text-[10px] font-bold mt-1 ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {passwordsMatch ? '✓ הסיסמאות תואמות' : '✗ הסיסמאות אינן תואמות'}
                  </p>
                )}
              </div>
            )}

            {/* Remember Me Checkbox */}
            {isLogin && !isResetMode && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500/30"
                  />
                  <span>זכור אותי במכשיר זה</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (!isLogin && !isResetMode && (!passwordsMatch || passwordEval.score < 2))}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl py-3 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
            >
              {isLoading ? (
                <span>מעבד נתונים...</span>
              ) : isResetMode ? (
                <span>שלח קישור לאיפוס סיסמה</span>
              ) : isLogin ? (
                <span>התחבר לחשבון</span>
              ) : (
                <span>צור חשבון מאובטח</span>
              )}
            </button>

            {/* Reset Password Back Button */}
            {isResetMode && (
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="w-full text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold transition-colors"
              >
                חזרה למסך התחברות
              </button>
            )}

            {/* Social Divider */}
            {!isResetMode && (
              <>
                <div className="relative flex items-center justify-center py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-white/10" />
                  </div>
                  <div className="relative bg-white dark:bg-[#111] px-3 text-[11px] font-bold text-slate-400">
                    או התחבר עם
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white font-bold rounded-xl py-2.5 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                  <span>המשך עם חשבון Google</span>
                </button>
              </>
            )}
          </form>

          {/* Footer */}
          <div className="p-3.5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0a]/50 text-center text-xs shrink-0 flex items-center justify-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>הסיסמאות והנתונים מוצפנים ומאובטחים בתקן Firebase Auth</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
