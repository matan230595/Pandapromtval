const fs = require('fs');
let path = 'src/main.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'class ErrorBoundary extends React.Component<any, any> {',
  'class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {'
);
fs.writeFileSync(path, code);
