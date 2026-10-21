import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Webhook, Key, Copy, Check, Plus, Trash2, X, Globe, Shield, Terminal } from 'lucide-react';

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  event: string;
  status: 'Active' | 'Paused';
}

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  created: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info' | 'version') => void;
}

export const WebhookApiHubModal: React.FC<Props> = ({ isOpen, onClose, showToast }) => {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([
    { id: '1', name: 'Slack Alerts Notification', url: 'https://hooks.slack.com/services/T00/B00/XXX', event: 'prompt.updated', status: 'Active' },
    { id: '2', name: 'CRM Sync Webhook', url: 'https://api.mycompany.com/v1/prompts-sync', event: 'prompt.created', status: 'Active' }
  ]);

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    { id: '1', name: 'Production Server Key', key: 'pp_live_9f8374a29b10c83d7e', created: '2026-09-10' }
  ]);

  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) {
      showToast('נא להזין שם וכתובת URL ל-Webhook', 'error');
      return;
    }
    setWebhooks([...webhooks, {
      id: Date.now().toString(),
      name: newWebhookName.trim(),
      url: newWebhookUrl.trim(),
      event: 'prompt.updated',
      status: 'Active'
    }]);
    setNewWebhookName('');
    setNewWebhookUrl('');
    showToast('Webhook נוסף בהצלחה', 'success');
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      showToast('נא להזין שם למפתח ה-API', 'error');
      return;
    }
    const generated = 'pp_live_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    setApiKeys([...apiKeys, {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      key: generated,
      created: new Date().toISOString().split('T')[0]
    }]);
    setNewKeyName('');
    showToast('מפתח API נוצר בהצלחה', 'success');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    showToast('הטקסט הועתק ללוח', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <Webhook className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                  מרכז אינטגרציות ו-Webhooks (API Hub)
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">Cloud Webhooks</span>
                </h3>
                <p className="text-xs text-violet-150">ניהול מפתחות API וקישור מערכות חיצוניות באמצעות Webhooks בזמן אמת</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-100">
            {/* API Keys Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-violet-600" />
                  מפתחות API להפעלה חיצונית
                </h4>
              </div>

              <form onSubmit={handleGenerateKey} className="flex gap-2">
                <input
                  type="text"
                  placeholder="שם המפתח (לדוגמה: Production Server)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shrink-0 shadow-lg shadow-violet-600/20"
                >
                  <Plus className="w-4 h-4" />
                  צור מפתח חדש
                </button>
              </form>

              <div className="space-y-2">
                {apiKeys.map((k) => (
                  <div key={k.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{k.name}</span>
                        <span className="text-[10px] bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">נוצר: {k.created}</span>
                      </div>
                      <code className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 block">{k.key}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(k.key, k.id)}
                      className="p-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors text-slate-700 dark:text-slate-200"
                      title="העתק מפתח"
                    >
                      {copiedKey === k.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Webhooks Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Webhook className="w-4 h-4 text-violet-600" />
                יעדי Webhook מוגדרים
              </h4>

              <form onSubmit={handleAddWebhook} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="שם היעד (לדוגמה: Slack Alerts)"
                    value={newWebhookName}
                    onChange={(e) => setNewWebhookName(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <input
                    type="url"
                    placeholder="כתובת Endpoint URL"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף Webhook
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {webhooks.map((w) => (
                  <div key={w.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{w.name}</span>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">{w.event}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{w.url}</span>
                    </div>
                    <button
                      onClick={() => {
                        setWebhooks(webhooks.filter(item => item.id !== w.id));
                        showToast('ה-Webhook הוסר בהצלחה', 'info');
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="הסר Webhook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
