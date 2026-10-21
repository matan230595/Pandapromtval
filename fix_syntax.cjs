const fs = require('fs');
let path = 'src/App.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '}{isReadingMode && <button',
  '<>{isReadingMode && <button'
);

// find where to close the fragment
// wait, the fragment doesn't need to be closed? Yes it does.
// it's `) : ( <> ... </div> )`
// Currently the div is closed later. I need to close the fragment right before the `)`.
// The end of this block is probably around the end of the `) : (` block. 
