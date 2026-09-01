import React from 'react';
import { Search, FolderOpen, Inbox } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  type: 'search' | 'folder' | 'all';
  searchQuery?: string;
  folderName?: string;
}

export const EmptyState: React.FC<Props> = ({ type, searchQuery, folderName }) => {
  const content = {
    search: {
      icon: <Search className="w-12 h-12 text-blue-500" />,
      title: 'לא נמצאו תוצאות',
      description: `לא מצאנו פרומפטים שמתאימים לחיפוש "${searchQuery}"`,
      bg: 'bg-blue-50 dark:bg-blue-900/10'
    },
    folder: {
      icon: <FolderOpen className="w-12 h-12 text-indigo-500" />,
      title: 'התיקייה ריקה',
      description: `אין עדיין פרומפטים בתיקייה "${folderName}". תוכל ליצור פרומפט חדש או להעביר לכאן פרומפטים קיימים.`,
      bg: 'bg-indigo-50 dark:bg-indigo-900/10'
    },
    all: {
      icon: <Inbox className="w-12 h-12 text-slate-500" />,
      title: 'הספרייה שלך ריקה',
      description: 'הגיע הזמן ליצור את הפרומפט הראשון שלך ולהתחיל לארגן את הספרייה!',
      bg: 'bg-slate-100 dark:bg-white/5'
    }
  }[type];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px]">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className={`w-24 h-24 rounded-full ${content.bg} flex items-center justify-center mb-6`}
      >
        <motion.div
          animate={{ 
            y: [0, -8, 0],
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {content.icon}
        </motion.div>
      </motion.div>
      <motion.h3 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-bold text-slate-900 dark:text-white mb-2"
      >
        {content.title}
      </motion.h3>
      <motion.p 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed"
      >
        {content.description}
      </motion.p>
    </div>
  );
};
