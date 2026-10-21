const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const additionalStyles = `
@layer base {
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--bg-light);
    color: #0f172a;
    background-image: radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .dark body {
    background-color: var(--bg-dark);
    color: #f8fafc;
    background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  }
  
  ::selection {
    background: rgba(59, 130, 246, 0.2);
    color: inherit;
  }
}

.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.dark .glass-panel {
  background: rgba(17, 17, 17, 0.7);
}
`;

if(!code.includes('.glass-panel')) {
  fs.writeFileSync('src/index.css', code + additionalStyles);
}
