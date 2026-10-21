const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const anchor = `if (user) {
      await setDoc(doc(db, "users", user.uid, "prompts", newPrompt.id), newPrompt);`;

const logic = `
    // Apply automation rules
    for (const rule of automationRules) {
      if (!rule.isActive) continue;
      const lowerKeyword = rule.keyword.toLowerCase();
      let match = false;
      const tagsString = (newPrompt.tags || []).join(' ').toLowerCase();
      const contentString = newPrompt.content.toLowerCase();
      const titleString = (newPrompt.title || '').toLowerCase();
      
      if (rule.matchIn === 'tags') {
        match = tagsString.includes(lowerKeyword);
      } else if (rule.matchIn === 'content') {
        match = contentString.includes(lowerKeyword) || titleString.includes(lowerKeyword);
      } else if (rule.matchIn === 'both') {
        match = tagsString.includes(lowerKeyword) || contentString.includes(lowerKeyword) || titleString.includes(lowerKeyword);
      }
      
      if (match) {
        newPrompt.folder = rule.targetFolderId;
        break; // First matching rule wins
      }
    }
`;

code = code.replace(`if (user) {\n      await setDoc`, logic + `\n    if (user) {\n      await setDoc`);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched handleSave");
