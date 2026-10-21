const fs = require('fs');
let path = 'src/main.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /class ErrorBoundary extends.*?\}\s*\}/s,
  `class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: '20px', color: 'red'}}><pre>{this.state.error?.toString()}</pre><pre>{this.state.error?.stack}</pre></div>;
    }
    return this.props.children;
  }
}`
);

fs.writeFileSync(path, code);
