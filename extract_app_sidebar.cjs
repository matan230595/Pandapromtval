const fs = require('fs');

const appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const overlayStart = appTsx.indexOf('{/* Sidebar Mobile Overlay */}');
const mobileHeaderStart = appTsx.indexOf('{/* Mobile Header */}');

if (overlayStart !== -1 && mobileHeaderStart !== -1) {
  const sidebarJSX = appTsx.substring(overlayStart, mobileHeaderStart);
  fs.writeFileSync('sidebar_temp.jsx', sidebarJSX);
  console.log("Sidebar extracted to sidebar_temp.jsx");
} else {
  console.log("Could not find boundaries");
}
