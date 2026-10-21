import React, { useState } from 'react';
import { Database, Upload, FileText, Trash2, Shield, Search } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  status: 'indexed' | 'processing' | 'error';
}

export const KnowledgeBase: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>([
    { id: '1', name: 'company_guidelines_2024.pdf', size: '2.4 MB', uploadDate: new Date().toISOString(), status: 'indexed' },
    { id: '2', name: 'customer_service_scripts.docx', size: '1.1 MB', uploadDate: new Date().toISOString(), status: 'indexed' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0a0a0a] max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            מאגר ידע (RAG)
          </h2>
          <p className="text-sm text-slate-500 mt-2">העלה מסמכים וקובצי PDF כדי שה-AI יוכל לשאוב מהם מידע לפרומפטים שלך.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-colors">
          <Upload className="w-4 h-4" /> העלה מסמך
        </button>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="חפש מסמכים..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-xl ps-10 pe-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4">שם הקובץ</th>
                <th className="px-6 py-4 text-center">גודל</th>
                <th className="px-6 py-4 text-center">סטטוס</th>
                <th className="px-6 py-4 text-center">תאריך העלאה</th>
                <th className="px-6 py-4 text-center">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {docs.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-slate-900 dark:text-white">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500">{doc.size}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Shield className="w-3.5 h-3.5" /> אינדקס
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500">{new Date(doc.uploadDate).toLocaleDateString('he-IL')}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {docs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    לא נמצאו קבצים.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
