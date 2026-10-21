const fs = require('fs');

// Fix App.tsx
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

appTsx = appTsx.replace(
  /updated\[index\]\.tags = newTags;\s*updated\[index\]\.updatedAt = new Date\(\)\.toISOString\(\);/g,
  'updated[index] = { ...updated[index], tags: newTags, updatedAt: new Date().toISOString() };'
);

appTsx = appTsx.replace(
  /updated\[index\]\.folder = folderId;\s*updated\[index\]\.updatedAt = new Date\(\)\.toISOString\(\);/g,
  'updated[index] = { ...updated[index], folder: folderId, updatedAt: new Date().toISOString() };'
);

appTsx = appTsx.replace(
  /updatedPrompts\[index\]\.title = newTitle;\s*updatedPrompts\[index\]\.updatedAt = new Date\(\)\.toISOString\(\);/g,
  'updatedPrompts[index] = { ...updatedPrompts[index], title: newTitle, updatedAt: new Date().toISOString() };'
);

fs.writeFileSync('src/App.tsx', appTsx);
console.log("App.tsx fixed");

// Fix PromptEditor.tsx
let editor = fs.readFileSync('src/components/PromptEditor.tsx', 'utf8');

editor = editor.replace(
  /newEx\[i\]\.isActive = e\.target\.checked;/g,
  'newEx[i] = { ...newEx[i], isActive: e.target.checked };'
);

editor = editor.replace(
  /newEx\[i\]\.input = e\.target\.value;/g,
  'newEx[i] = { ...newEx[i], input: e.target.value };'
);

editor = editor.replace(
  /newEx\[i\]\.output = e\.target\.value;/g,
  'newEx[i] = { ...newEx[i], output: e.target.value };'
);

fs.writeFileSync('src/components/PromptEditor.tsx', editor);
console.log("PromptEditor.tsx fixed");

// Fix EvaluationPanel.tsx
let evalPanel = fs.readFileSync('src/components/EvaluationPanel.tsx', 'utf8');

evalPanel = evalPanel.replace(
  /newCases\[i\]\.running = true;/g,
  'newCases[i] = { ...newCases[i], running: true };'
);

evalPanel = evalPanel.replace(
  /newCases\[i\]\.result = resultText;\s*newCases\[i\]\.score = score;\s*newCases\[i\]\.running = false;/g,
  'newCases[i] = { ...newCases[i], result: resultText, score, running: false };'
);

evalPanel = evalPanel.replace(
  /newCases\[i\]\.result = "Error running test";\s*newCases\[i\]\.running = false;\s*newCases\[i\]\.score = 0;/g,
  'newCases[i] = { ...newCases[i], result: "Error running test", score: 0, running: false };'
);

fs.writeFileSync('src/components/EvaluationPanel.tsx', evalPanel);
console.log("EvaluationPanel.tsx fixed");
