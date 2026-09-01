const fs = require('fs');
let code = fs.readFileSync('src/components/Toast.tsx', 'utf8');

const newProps = `interface Props {
  message: string;
  type: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}`;

code = code.replace(/interface Props \{\n\s*message: string;\n\s*type: ToastType;\n\s*onClose: \(\) => void;\n\}/, newProps);

const newSig = `export const Toast: React.FC<Props> = ({ message, type, action, onClose }) => {
  useEffect(() => {
    const duration = action ? 5000 : 3000;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, action]);`;

code = code.replace(/export const Toast: React\.FC<Props> = \(\{ message, type, onClose \}\) => \{\n\s*useEffect\(\(\) => \{\n\s*const timer = setTimeout\(\(\) => \{\n\s*onClose\(\);\n\s*\}, 3000\);\n\s*return \(\) => clearTimeout\(timer\);\n\s*\}, \[onClose\]\);/, newSig);

const newRender = `    >
      {icons[type]}
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{message}</span>
      {action && (
        <button 
          onClick={() => { action.onClick(); onClose(); }}
          className="ml-2 px-3 py-1 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-white/10"
        >
          {action.label}
        </button>
      )}
    </motion.div>`;

code = code.replace(/>\n\s*\{icons\[type\]\}\n\s*<span className="text-sm font-semibold text-slate-800 dark:text-slate-200">\{message\}<\/span>\n\s*<\/motion\.div>/, newRender);

fs.writeFileSync('src/components/Toast.tsx', code);
