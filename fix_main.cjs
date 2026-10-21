const fs = require('fs');
let path = 'src/main.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('ErrorBoundary')) {
code = `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nclass ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: '20px', color: 'red'}}><pre>{this.state.error?.toString()}</pre><pre>{this.state.error?.stack}</pre></div>;
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);`;
fs.writeFileSync(path, code);
}
