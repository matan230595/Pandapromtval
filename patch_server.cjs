const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
  // API Route: Magic Suggest
  app.post("/api/gemini/suggest", async (req, res) => {
    try {
      const { content, language = "he" } = req.body;
      const ai = getGeminiClient(req);
      const isHebrew = language === "he";
      
      const instruction = \`You are a prompt engineering assistant. Analyze the given prompt and return a JSON object with helpful suggestions.
      Format: 
      {
        "missingRole": "Suggested role if missing (or empty string)",
        "suggestedVariables": ["var1", "var2"],
        "improvements": ["tip1", "tip2"]
      }
      Write all suggestions in \${isHebrew ? "Hebrew" : "English"}.\`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: instruction },
          { text: \`Prompt:\\n\${content}\` }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch(err) {
      res.status(500).json({ error: err.message || "Failed to get suggestions" });
    }
  });

  // API Route: Semantic Search
  app.post("/api/gemini/semantic-search", async (req, res) => {
    try {
      const { query, prompts } = req.body; 
      const ai = getGeminiClient(req);
      
      const promptList = prompts.map((p) => \`ID: \${p.id} | Title: \${p.title} | Tags: \${p.tags.join(',')}\`).join('\\n');
      const instruction = \`You are a semantic search engine. The user is searching for: "\${query}".
      Here are the available prompts:
      \${promptList}
      
      Return ONLY a JSON array of string prompt IDs that best match the search intent, ordered by relevance. Max 10 results. Example: ["id1", "id2"]\`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: instruction,
        config: {
          responseMimeType: "application/json"
        }
      });
      const data = JSON.parse(response.text || "[]");
      res.json({ results: data });
    } catch(err) {
      res.status(500).json({ error: err.message || "Failed to search" });
    }
  });
`;

code = code.replace(
  '// API Route: Chat Playground',
  newRoutes + '\n  // API Route: Chat Playground'
);

fs.writeFileSync('server.ts', code);
