const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldState = 'const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);';
const newState = 'const [toast, setToast] = useState<{message: string, type: ToastType, action?: {label: string, onClick: () => void}} | null>(null);';
code = code.replace(oldState, newState);

const showToastFnOld = `const showToast = (message: string, type: ToastType = 'success') => {
    setToast({message, type});
  };`;
const showToastFnNew = `const showToast = (message: string, type: ToastType = 'success', action?: {label: string, onClick: () => void}) => {
    setToast({message, type, action});
  };`;
code = code.replace(showToastFnOld, showToastFnNew);

const renderToastOld = `<Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />`;
const renderToastNew = `<Toast 
            message={toast.message} 
            type={toast.type} 
            action={toast.action}
            onClose={() => setToast(null)} 
          />`;
code = code.replace(renderToastOld, renderToastNew);

fs.writeFileSync('src/App.tsx', code);
