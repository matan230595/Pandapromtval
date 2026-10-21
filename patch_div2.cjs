const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '                  )}\n                  </div>\n                </div>\n            ) : (\n              <motion.div key="empty"',
  '                  )}\n                  </div>\n                </motion.div>\n            ) : (\n              <motion.div key="empty"'
);

fs.writeFileSync('src/App.tsx', code);
