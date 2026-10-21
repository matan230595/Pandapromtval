const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '                  </motion.div>\n                ))}\n                  \n            {/* Detail View / Editor */}',
  '                  </motion.div>\n                ))}\n                  </AnimatePresence>\n                  </div>\n                )}\n              </div>\n            </div>\n            {/* Detail View / Editor */}'
);

fs.writeFileSync('src/App.tsx', code);
