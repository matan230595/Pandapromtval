const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /                      <\/div>\n                      \n                    <\/div>\n                <\/div>\n              <\/div>\n            \) : \(/g;

if (regex.test(code)) {
    code = code.replace(regex, `                      </div>
                      
                    </div>
                  )}
                </div>
            ) : (`);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched successfully!");
} else {
    console.log("Not found.");
}
