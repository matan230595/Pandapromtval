const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix Joyride import
code = code.replace(
  'import Joyride, { CallBackProps, STATUS } from "react-joyride";',
  'import { Joyride, STATUS } from "react-joyride";'
);

// Fix handleJoyrideCallback signature
code = code.replace(
  'const handleJoyrideCallback = (data: CallBackProps) => {',
  'const handleJoyrideCallback = (data: any) => {'
);

fs.writeFileSync('src/App.tsx', code);
