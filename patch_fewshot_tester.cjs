const fs = require('fs');
let code = fs.readFileSync('src/components/PromptTester.tsx', 'utf8');

const replacement = `
    let sysInst = 'You are an AI model fulfilling a user prompt. Follow constraints.';
    
    // Add Few-Shot Examples if any
    const activeExamples = (prompt.fewShotExamples || []).filter(ex => ex.isActive && ex.input && ex.output);
    if (activeExamples.length > 0) {
      sysInst += '\\n\\nHere are some examples of the desired input and output:\\n';
      activeExamples.forEach((ex, i) => {
        sysInst += \`\\n--- Example \${i+1} ---\\nInput:\\n\${ex.input}\\nOutput:\\n\${ex.output}\\n\`;
      });
      sysInst += '\\n--- End of Examples ---\\nUse these examples as a strict guide for the format, tone, and logic of your response.';
    }

    try {
      const pA = fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [initialMsg],
          systemInstruction: sysInst,
          temperature: 0.2
        })
      });
      
      let pB = null;
      if (isABMode) {
        pB = fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [initialMsg],
            systemInstruction: sysInst + '\\nBe highly creative.',
            temperature: 0.9
          })
        });
      }
`;

// regex replace to catch the fetch portion
code = code.replace(
  /try \{\s*const pA = fetch\('\/api\/gemini\/chat'.*?\}\s*\}\s*const \[resA, resB\]/s,
  replacement.trim() + '\n      const [resA, resB]'
);

fs.writeFileSync('src/components/PromptTester.tsx', code);
