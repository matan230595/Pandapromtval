const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const historyLogic = `    } else {
      const existing = prompts.find(p => p.id === promptData.id);
      let newHistory = existing?.history || [];
      
      // If content changed significantly, save to history (max 10 items)
      if (existing && existing.content !== promptData.content && existing.content.trim().length > 0) {
        newHistory = [{ content: existing.content, updatedAt: now }, ...newHistory].slice(0, 10);
      }
      
      newPrompt = {
        ...(existing as Prompt),
        ...promptData,
        history: newHistory,
        updatedAt: now,
      };
    }`;

code = code.replace(/    \} else \{\n\s*const existing = prompts\.find\(p => p\.id === promptData\.id\);\n\s*newPrompt = \{\n\s*\.\.\.\(existing as Prompt\),\n\s*\.\.\.promptData,\n\s*updatedAt: now,\n\s*\};\n\s*\}/g, historyLogic);

fs.writeFileSync('src/App.tsx', code);
