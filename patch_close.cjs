const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /                  <\/motion\.div>\n                \}\)\}\n                              \{\/\* Detail View \/ Editor \*\/\}/;
const replacement = `                  </motion.div>
                ))}
                  </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
            {/* Detail View / Editor */}`;
code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
