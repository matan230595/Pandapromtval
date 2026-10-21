const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '                  </div>\n                </div>\n              </div>\n            ) : selectedPrompt ? (',
  '                  </div>\n                </div>\n              </motion.div>\n            ) : selectedPrompt ? ('
);

code = code.replace(
  '                      </div>\n                                          </div>\n                  )}\n                  </div>\n                </div>\n            ) : (',
  '                      </div>\n                                          </div>\n                  )}\n                  </div>\n                </motion.div>\n            ) : ('
);

fs.writeFileSync('src/App.tsx', code);
