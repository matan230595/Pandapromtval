import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Shield, Check, X, Mail, Globe, Lock, Trash2, Crown, Sparkles } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Pending';
  avatar: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
}

export const TeamCollaborationModal: React.FC<Props> = ({ isOpen, onClose, showToast }) => {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: '1', name: 'משה כהן (אתה)', email: 'matan1995el@gmail.com', role: 'Admin', status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' },
    { id: '2', name: 'שרה לוי', email: 'sarah.l@company.com', role: 'Editor', status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
    { id: '3', name: 'דוד ישראלי', email: 'david.i@company.com', role: 'Viewer', status: 'Pending', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' }
  ]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Editor');
  const [workspaceName, setWorkspaceName] = useState('PandaPrompt Enterprise Workspace');
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      showToast('נא להזין כתובת אימייל תקינה', 'error');
      return;
    }
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newEmail.split('@')[0],
      email: newEmail.trim(),
      role: newRole,
      status: 'Pending',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*999999)}?w=100&h=100&fit=crop&crop=faces`
    };
    setMembers([...members, newMember]);
    setNewEmail('');
    showToast('הזמנה נשלחה בהצלחה לחבר הצוות!', 'success');
  };

  const handleRemove = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    showToast('חבר הצוות הוסר מהמרחב', 'info');
  };

  const handleRoleChange = (id: string, role: 'Admin' | 'Editor' | 'Viewer') => {
    setMembers(members.map(m => m.id === id ? { ...m, role } : m));
    showToast('הרשאת חבר הצוות עודכנה בהצלחה', 'success');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  ניהול סביבת עבודה משותפת (Workspace)
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">Enterprise</span>
                </h3>
                <p className="text-xs text-indigo-100">ניהול חברי צוות, הרשאות גישה וספריות פרומפטים משותפות</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-100">
            {/* Workspace Settings */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">שם המרחב</span>
                {isEditingWorkspace ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => { setIsEditingWorkspace(false); showToast('שם המרחב עודכן בהצלחה', 'success'); }}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      שמור
                    </button>
                  </div>
                ) : (
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                    {workspaceName}
                    <button
                      onClick={() => setIsEditingWorkspace(true)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-normal"
                    >
                      ערוך
                    </button>
                  </h4>
                )}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <Globe className="w-4 h-4" />
                סנכרון בזמן אמת פעיל
              </div>
            </div>

            {/* Invite Form */}
            <form onSubmit={handleInvite} className="space-y-3">
              <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                הזמנת חבר צוות חדש למרחב
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="כתובת אימייל (לדוגמה: colleague@company.com)"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Admin">מנהל (Admin)</option>
                  <option value="Editor">עורך (Editor)</option>
                  <option value="Viewer">צופה (Viewer)</option>
                </select>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2 shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  הזמן
                </button>
              </div>
            </form>

            {/* Members List */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>חברי הצוות במרחב ({members.length})</span>
                <span className="text-xs font-normal text-slate-500">גישה מלאה לספריות משותפות</span>
              </h4>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 hover:border-indigo-500/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/20" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{member.name}</span>
                          {member.role === 'Admin' && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                          {member.status === 'Pending' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                              ממתין לאישור
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{member.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="Admin">מנהל</option>
                        <option value="Editor">עורך</option>
                        <option value="Viewer">צופה</option>
                      </select>
                      {member.role !== 'Admin' && (
                        <button
                          onClick={() => handleRemove(member.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                          title="הסר מהצוות"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors"
            >
              סגור
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
