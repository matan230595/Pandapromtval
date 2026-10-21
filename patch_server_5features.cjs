const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const additionalApis = `
  // 1. ML-based Folder Suggestion
  app.post("/api/gemini/suggest-folder", async (req, res) => {
    try {
      const { content, folders, promptsContext } = req.body;
      const ai = getGeminiClient(req);
      
      const instruction = \`You are a classification AI. Suggest the most appropriate folder ID for the following new prompt based on its content and the context of existing folders/prompts.
Folders available: \${JSON.stringify(folders)}
Recent prompts context: \${JSON.stringify(promptsContext)}

Return ONLY a JSON object: {"folderId": "id_here", "reason": "short explanation in Hebrew"}. If none match, return {"folderId": null}.\`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: instruction },
          { text: \`New Prompt Content:\\n\${content}\` }
        ],
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Collection Chat Assistant
  app.post("/api/gemini/collection-chat", async (req, res) => {
    try {
      const { messages, collectionData } = req.body;
      const ai = getGeminiClient(req);
      
      const systemInstruction = \`You are "Vault Bot", an AI assistant managing the user's prompt collection.
Answer questions based ONLY on the following collection data. 
Be concise and reply in Hebrew.
Collection: \${JSON.stringify(collectionData)}\`;

      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: { systemInstruction }
      });
      res.json({ text: response.text || "" });
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Readability & Complexity Score
  app.post("/api/gemini/analyze-readability", async (req, res) => {
    try {
      const { content } = req.body;
      const ai = getGeminiClient(req);
      
      const instruction = \`Analyze the clarity, structure, and AI-comprehension complexity of this prompt.
Return ONLY a JSON object:
{
  "score": number (0-100, 100 being highly readable and perfectly structured),
  "issues": ["array of structural issues in Hebrew"],
  "suggestions": ["array of actionable suggestions to improve AI comprehension in Hebrew"]
}\`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: instruction },
          { text: \`Prompt:\\n\${content}\` }
        ],
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Smart Import (URL / Text Parsing)
  app.post("/api/gemini/smart-import", async (req, res) => {
    try {
      const { type, data } = req.body;
      const ai = getGeminiClient(req);
      
      let rawText = data;
      
      // Basic URL fetching logic if it's a URL
      if (type === 'url') {
         const fetchRes = await fetch(data);
         rawText = await fetchRes.text();
         // Basic cleanup: remove script/style tags
         rawText = rawText.replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '');
         rawText = rawText.replace(/<style\\b[^<]*(?:(?!<\\/style>)<[^<]*)*<\\/style>/gi, '');
         // Strip HTML tags roughly
         rawText = rawText.replace(/<[^>]+>/g, ' ');
         rawText = rawText.substring(0, 15000); // Limit size for API
      }

      const instruction = \`You are a data extraction tool. Extract prompt templates from the provided text or document content.
Return a JSON array of objects representing the extracted prompts. 
If none found, return an empty array [].
Each object format:
{
  "title": "Short title in Hebrew",
  "content": "The actual prompt text",
  "tags": ["tag1", "tag2"]
}\`;

      const parts: any[] = [{ text: instruction }];
      
      if (type === 'pdf') {
         // data is base64 string
         parts.push({
           inlineData: {
             data,
             mimeType: "application/pdf"
           }
         });
      } else {
         parts.push({ text: \`Content:\\n\${rawText}\` });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: parts,
        config: { responseMimeType: "application/json" }
      });
      res.json({ prompts: JSON.parse(response.text || "[]") });
    } catch(err) {
      res.status(500).json({ error: err.message });
    }
  });
`;

code = code.replace('  // Vite Integration', additionalApis + '\n  // Vite Integration');
fs.writeFileSync('server.ts', code);
