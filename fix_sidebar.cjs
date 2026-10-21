const fs = require('fs');

let sidebar = fs.readFileSync('src/components/layout/AppSidebar.tsx', 'utf8');

// Fix imports
sidebar = sidebar.replace("LayoutTemplate,", "LayoutTemplate, User as UserIcon, FolderOpen, Command, Settings,");
sidebar = sidebar.replace("handleDragLeave: () => void;", "handleDragLeave: (e: any) => void;");

fs.writeFileSync('src/components/layout/AppSidebar.tsx', sidebar);

// App.tsx uses handleDragLeave={handleDragLeave}, so it will match the new signature automatically once AppSidebar is updated.

