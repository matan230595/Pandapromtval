const fs = require('fs');
let code = fs.readFileSync('src/components/NewFolderModal.tsx', 'utf8');

code = code.replace(
  'onConfirm: (folderName: string) => void;',
  'onConfirm: (folderName: string, color?: string) => void;'
);

code = code.replace(
  'const [name, setName] = useState(\'\');',
  'const [name, setName] = useState(\'\');\n  const [color, setColor] = useState(\'#4f46e5\'); // default indigo-600'
);

const colorsHTML = `
          <div className="p-4 pt-0">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">צבע</label>
            <div className="flex gap-2 flex-wrap">
              {['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#64748b'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={\`w-6 h-6 rounded-full \${color === c ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-[#111]' : ''}\`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
`;

code = code.replace(
  '</label>',
  '</label>'
);
code = code.replace(
  '</div>          <div className="p-4 border-t',
  '</div>' + colorsHTML + '<div className="p-4 border-t'
);

code = code.replace(/onConfirm\(name\.trim\(\)\);/g, 'onConfirm(name.trim(), color);');

fs.writeFileSync('src/components/NewFolderModal.tsx', code);
