const fs = require('fs');
let code = fs.readFileSync('src/components/Toast.tsx', 'utf8');

if (!code.includes("'community'")) {
  code = code.replace(
    "export type ToastType = 'success' | 'error' | 'info' | 'sync';",
    "export type ToastType = 'success' | 'error' | 'info' | 'sync' | 'community' | 'version';"
  );

  code = code.replace(
    "import { CheckCircle2, XCircle, Info, Cloud } from 'lucide-react';",
    "import { CheckCircle2, XCircle, Info, Cloud, Users, GitMerge } from 'lucide-react';"
  );

  code = code.replace(
    "sync: <Cloud className=\"w-5 h-5 text-indigo-500\" />\n  };",
    "sync: <Cloud className=\"w-5 h-5 text-indigo-500\" />,\n    community: <Users className=\"w-5 h-5 text-purple-500\" />,\n    version: <GitMerge className=\"w-5 h-5 text-amber-500\" />\n  };"
  );

  code = code.replace(
    "sync: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30'\n  };",
    "sync: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/30',\n    community: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30',\n    version: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30'\n  };"
  );
}

fs.writeFileSync('src/components/Toast.tsx', code);
