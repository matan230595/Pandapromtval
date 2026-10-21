import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

admin.initializeApp({ projectId: firebaseConfig.projectId });
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large base64 uploads for images and audio
  app.use(express.json({ limit: "50mb" }));

  // Authentication Middleware
  const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        (req as any).user = decodedToken;
        return next();
      } catch (error) {
        console.error('Auth Error:', error);
        return res.status(403).json({ error: 'Unauthorized: Invalid token' });
      }
    }

    // Guest fallback: Allow unauthenticated requests if an API key (custom or server-side) exists
    const customKey = req.headers["x-gemini-api-key"] as string;
    const hasApiKey = !!customKey || !!process.env.GEMINI_API_KEY;
    if (hasApiKey) {
      return next();
    }

    return res.status(401).json({ error: 'Unauthorized: Please sign in or provide a valid API key' });
  };

  app.use('/api/gemini', authMiddleware);


  // Helper to safely get the GoogleGenAI client
  function getGeminiClient(req: express.Request) {
    const customKey = req.headers["x-gemini-api-key"] as string;
    const apiKey = customKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("מפתח ה-API של Gemini אינו מוגדר. אנא הזן מפתח API תקין בהגדרות האפליקציה או בשרת.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // Helper to safely clean and parse JSON from Gemini responses (stripping markdown codeblocks)
  function cleanAndParseJson<T>(rawText: string | undefined | null, fallback: T): T {
    if (!rawText) return fallback;
    try {
      let clean = rawText.trim();
      if (clean.startsWith("```json")) {
        clean = clean.slice(7);
      } else if (clean.startsWith("```")) {
        clean = clean.slice(3);
      }
      if (clean.endsWith("```")) {
        clean = clean.slice(0, -3);
      }
      return JSON.parse(clean.trim());
    } catch (e) {
      console.error("JSON parsing error, falling back:", e);
      return fallback;
    }
  }

  // Helper to retry Gemini operations with exponential backoff on model overload or rate-limits
  async function withGeminiRetry<T>(operation: () => Promise<T>, maxRetries = 3, initialDelayMs = 1000): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (err: any) {
        attempt++;
        const msg = String(err?.message || err || '');
        const isTransient = 
          msg.includes("overloaded") || 
          msg.includes("429") || 
          msg.includes("503") || 
          msg.includes("RESOURCE_EXHAUSTED") || 
          msg.includes("UNAVAILABLE") ||
          msg.includes("Rate limit");
        if (attempt >= maxRetries || !isTransient) {
          throw err;
        }
        const delay = initialDelayMs * Math.pow(1.8, attempt - 1);
        console.warn(`[Gemini Retry] Model API transient error/overloaded. Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error("Gemini operation failed after maximum retries.");
  }

  // API Route: Check API key status
  app.get("/api/health", (req, res) => {
    const customKey = req.headers["x-gemini-api-key"] as string;
    const hasKey = !!customKey || !!process.env.GEMINI_API_KEY;
    res.json({ status: "ok", hasApiKey: hasKey });
  });

  // API Route: Text-To-Speech (TTS)
  app.post("/api/gemini/tts", async (req, res) => {
    try {
      const { text, voice = "Kore" } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required for TTS" });
      }
      const ai = getGeminiClient(req);
      const prompt = `Say cheerfully: ${text}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio data returned from Gemini TTS model");
      }
      res.json({ audio: base64Audio });
    } catch (error: any) {
      console.error("TTS Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate speech" });
    }
  });

  // API Route: Transcribe audio
  app.post("/api/gemini/transcribe", async (req, res) => {
    try {
      const { audio, mimeType = "audio/webm" } = req.body;
      if (!audio) {
        return res.status(400).json({ error: "Audio data is required for transcription" });
      }
      const ai = getGeminiClient(req);
      const audioPart = {
        inlineData: {
          data: audio,
          mimeType,
        },
      };
      const response = await ai.models.generateContent({
        model: req.body.modelId || "gemini-3.5-flash",
        contents: [
          audioPart,
          { text: "Transcribe this audio recording exactly. It may be in Hebrew or English. Write down exactly what was said. Do not add any explanations, introductory text, or greetings. Return ONLY the direct transcription." }
        ],
      });
      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Transcription Error:", error);
      res.status(500).json({ error: error.message || "Failed to transcribe audio" });
    }
  });

  
  // API Route: Classify Prompt
  app.post("/api/gemini/classify", async (req, res) => {
    try {
      const { content } = req.body;
      const ai = getGeminiClient(req);
      
      const instruction = `You are an AI assistant that classifies prompt templates. Given the prompt content, return a JSON object with:
      - "title": A short, catchy title for the prompt in Hebrew.
      - "tags": An array of 3-5 relevant string tags in Hebrew.
      - "platform": One of the following: "ChatGPT", "Claude", "Midjourney", "Gemini", "Copy.ai", or "General". Pick the most likely target platform.`;

      const response = await withGeminiRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: instruction },
          { text: `Content:\n${content}` }
        ],
        config: {
          responseMimeType: "application/json"
        }
      }));
      
      const text = response.text || "{}";
      const data = cleanAndParseJson(text, {});
      res.json(data);
    } catch (error) {
      console.error("Classify Error:", error);
      res.status(500).json({ error: error.message || "Failed to classify prompt" });
    }
  });

  // API Route: Enhance Prompt or Create Prompt using Gemini with HIGH Thinking
  app.post("/api/gemini/enhance", async (req, res) => {
    try {
      const { promptText, mode = "enhance", description = "", language = "he" } = req.body;
      const ai = getGeminiClient(req);

      const isHebrew = language === "he";
      const formatStr = isHebrew ? "$(שם_המשתנה)" : "$(VARIABLE_NAME)";
      
      let systemInstruction = `You are an expert prompt engineer. You help users create high-performing, clean, and flexible AI prompts with variables formatted as ${formatStr}. IMPORTANT: Write the prompt entirely in ${isHebrew ? "Hebrew" : "English"}.`;
      
      let userPrompt = "";
      if (mode === "enhance") {
        userPrompt = `Please optimize and enhance the following prompt. Keep variables in the format ${formatStr} intact. Improve its clarity, structure, role definitions, and output expectations. Write the final prompt in ${isHebrew ? "Hebrew" : "English"}.
Prompt to enhance:
"""
${promptText}
"""
Return the enhanced prompt template directly. Do not wrap it in markdown block quotes or explanations.`;
      } else {
        userPrompt = `Write a high-quality prompt template based on the following description: "${description}".
Make sure to include placeholders/variables in the format of ${formatStr} (for example: ${isHebrew ? "$(נושא), $(שפה)" : "$(TOPIC), $(TONE)"}) so that the user can reuse it dynamically. 
Write the final prompt entirely in ${isHebrew ? "Hebrew" : "English"}.
Return ONLY the direct prompt content without any meta-talk or introductory greetings.`;
      }

      const response = await withGeminiRetry(() => ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: userPrompt,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH
          }
        }
      }));
      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Enhance Error:", error);
      res.status(500).json({ error: error.message || "Failed to process prompt with Gemini" });
    }
  });

  // API Route: Analyze Image to extract prompt
  app.post("/api/gemini/analyze-image", async (req, res) => {
    try {
      const { image, mimeType = "image/jpeg", language = "he" } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image data is required" });
      }
      
      const isHebrew = language === "he";
      const formatStr = isHebrew ? "$(שם_המשתנה)" : "$(VARIABLE_NAME)";
      
      const ai = getGeminiClient(req);
      const imagePart = {
        inlineData: {
          data: image,
          mimeType,
        },
      };

      const instruction = `Analyze this image and design a professional prompt template for an AI model (like ChatGPT, Claude, Midjourney, etc.) that can reconstruct, analyze, or generate similar contents/styles. Include placeholders/variables in the ${formatStr} format so the prompt is reusable. Write the prompt entirely in ${isHebrew ? "Hebrew" : "English"}. Return ONLY the final prompt template.`;

      const response = await withGeminiRetry(() => ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [
          imagePart,
          { text: instruction }
        ],
      }));
      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Image Analysis Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image" });
    }
  });

  
  // API Route: Magic Suggest
  app.post("/api/gemini/suggest", async (req, res) => {
    try {
      const { content, language = "he" } = req.body;
      const ai = getGeminiClient(req);
      const isHebrew = language === "he";
      
      const instruction = `You are a prompt engineering assistant. Analyze the given prompt and return a JSON object with helpful suggestions.
      Format: 
      {
        "missingRole": "Suggested role if missing (or empty string)",
        "suggestedVariables": ["var1", "var2"],
        "improvements": ["tip1", "tip2"]
      }
      Write all suggestions in ${isHebrew ? "Hebrew" : "English"}.`;
      
      const response = await withGeminiRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: instruction },
          { text: `Prompt:\n${content}` }
        ],
        config: {
          responseMimeType: "application/json"
        }
      }));
      const data = cleanAndParseJson(response.text, {});
      res.json(data);
    } catch(err: any) {
      res.status(500).json({ error: err.message || "Failed to get suggestions" });
    }
  });

  // API Route: Semantic Search
  app.post("/api/gemini/semantic-search", async (req, res) => {
    try {
      const { query, prompts } = req.body; 
      const ai = getGeminiClient(req);
      
      const promptList = prompts.map((p: any) => `ID: ${p.id} | Title: ${p.title} | Tags: ${(p.tags || []).join(',')}`).join('\n');
      const instruction = `You are a semantic search engine. The user is searching for: "${query}".
      Here are the available prompts:
      ${promptList}
      
      Return ONLY a JSON array of string prompt IDs that best match the search intent, ordered by relevance. Max 10 results. Example: ["id1", "id2"]`;
      
      const response = await withGeminiRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: instruction,
        config: {
          responseMimeType: "application/json"
        }
      }));
      const data = cleanAndParseJson(response.text, []);
      res.json({ results: data });
    } catch(err: any) {
      res.status(500).json({ error: err.message || "Failed to search" });
    }
  });

  // API Route: Chat Playground for testing prompts (Multi-turn chat)
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, systemInstruction, temperature, modelId } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }
      const ai = getGeminiClient(req);
      
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      
      const response = await withGeminiRetry(() => ai.models.generateContent({
        model: modelId || "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: systemInstruction || "You are a helpful AI assistant testing a custom prompt.",
          temperature: typeof temperature === 'number' ? Math.max(0, Math.min(2, temperature)) : undefined,
        }
      }));
      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to chat with Gemini" });
    }
  });


  // 1. ML-based Folder Suggestion
  app.post("/api/gemini/suggest-folder", async (req, res) => {
    try {
      const { content, folders, promptsContext } = req.body;
      const ai = getGeminiClient(req);
      
      const instruction = `You are a classification AI. Suggest the most appropriate folder ID for the following new prompt based on its content and the context of existing folders/prompts.
Folders available: ${JSON.stringify(folders)}
Recent prompts context: ${JSON.stringify(promptsContext)}

Return ONLY a JSON object: {"folderId": "id_here", "reason": "short explanation in Hebrew"}. If none match, return {"folderId": null}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          { text: instruction },
          { text: `New Prompt Content:\n${content}` }
        ],
        config: { responseMimeType: "application/json" }
      });
      res.json(cleanAndParseJson(response.text, { folderId: null }));
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 1b. AI Suggest Folder and Tags (Unified Metadata Suggestion)
  app.post("/api/gemini/suggest-metadata", async (req, res) => {
    try {
      const { content, folders = [], existingTags = [] } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ error: "Content is required" });
      }
      const ai = getGeminiClient(req);
      const folderList = folders.map((f: any) => ({ id: f.id, name: f.name }));
      
      const instruction = `You are an expert AI prompt librarian and organizer. 
Analyze the prompt content and suggest:
1. The most appropriate folder from the existing folders list (or null if none fit well).
2. A short Hebrew reason why this folder fits (max 10 words).
3. 3-5 relevant concise tags in Hebrew (prioritize relevant tags from existing tags list if applicable, or provide new high-quality tags).
4. A suggested short, catchy title in Hebrew.

Existing Folders: ${JSON.stringify(folderList)}
Existing Known Tags: ${JSON.stringify(existingTags)}

Return ONLY valid JSON:
{
  "suggestedFolderId": string or null,
  "suggestedFolderName": string or null,
  "folderReason": string,
  "suggestedTags": string[],
  "suggestedTitle": string
}`;

      const response = await withGeminiRetry(() => ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          { text: instruction },
          { text: `Prompt Content:\n${content}` }
        ],
        config: { responseMimeType: "application/json" }
      }));
      res.json(cleanAndParseJson(response.text, {}));
    } catch(err: any) {
      console.error("Suggest Metadata Error:", err);
      res.status(500).json({ error: err.message || "Failed to suggest metadata" });
    }
  });

  // 2. Collection Chat Assistant
  app.post("/api/gemini/collection-chat", async (req, res) => {
    try {
      const { messages, collectionData } = req.body;
      const ai = getGeminiClient(req);
      
      const systemInstruction = `You are "Vault Bot", an AI assistant managing the user's prompt collection.
Answer questions based ONLY on the following collection data. 
Be concise and reply in Hebrew.
Collection: ${JSON.stringify(collectionData)}`;

      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const response = await withGeminiRetry(() => ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: { systemInstruction }
      }));
      res.json({ text: response.text || "" });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Readability & Complexity Score for AI Model Processing
  app.post("/api/gemini/analyze-readability", async (req, res) => {
    try {
      const { content } = req.body;
      const ai = getGeminiClient(req);
      
      const instruction = `You are an expert in Large Language Models (LLM) prompt engineering and AI processing efficiency.
Analyze the clarity, structure, token readability, and AI-comprehension complexity of the given prompt text.

Return ONLY a JSON object:
{
  "score": number (0-100, 100 being perfectly structured and crystal-clear for AI models),
  "clarityScore": number (0-100, how unambiguous and specific the instructions are),
  "complexityLevel": "אופטימלית" | "פשוטה" | "בינונית" | "מורכבת מידי",
  "roleDefined": boolean (true if prompt clearly assigns a persona/role like "אתה מומחה...", "Act as..."),
  "hasOutputConstraints": boolean (true if prompt specifies output format like JSON, Markdown, table, tone),
  "hasVariables": boolean (true if prompt contains template variables like $(VAR) or {VAR}),
  "strengths": ["array of 2-3 positive aspects in Hebrew"],
  "issues": ["array of structural issues or ambiguities in Hebrew"],
  "suggestions": ["array of 2-3 concrete actionable suggestions in Hebrew to improve AI model comprehension and output accuracy"]
}`;

      const response = await withGeminiRetry(() => ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          { text: instruction },
          { text: `Prompt:\n${content}` }
        ],
        config: { responseMimeType: "application/json" }
      }));
      res.json(cleanAndParseJson(response.text, {}));
    } catch(err: any) {
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
         rawText = rawText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
         rawText = rawText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
         // Strip HTML tags roughly
         rawText = rawText.replace(/<[^>]+>/g, ' ');
         rawText = rawText.substring(0, 15000); // Limit size for API
      }

      const instruction = `You are a data extraction tool. Extract prompt templates from the provided text or document content.
Return a JSON array of objects representing the extracted prompts. 
If none found, return an empty array [].
Each object format:
{
  "title": "Short title in Hebrew",
  "content": "The actual prompt text",
  "tags": ["tag1", "tag2"]
}`;

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
         parts.push({ text: `Content:\n${rawText}` });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: parts,
        config: { responseMimeType: "application/json" }
      });
      res.json({ prompts: cleanAndParseJson(response.text, []) });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Bulk AI Organizer Endpoint
  app.post("/api/gemini/bulk-organize", async (req, res) => {
    try {
      const { prompts, folders, language = "he" } = req.body;
      if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
        return res.status(400).json({ error: "Prompts array is required" });
      }
      const ai = getGeminiClient(req);

      const instruction = `You are an elite AI Prompt Librarian & Taxonomy Specialist.
Your task is to analyze the following batch of prompt templates, assign each one to the best existing folder, generate 3-5 high-precision tags, and suggest a cleaner/more descriptive title if needed.

Available Folders:
${JSON.stringify(folders || [])}

Prompts to organize:
${JSON.stringify(prompts.map((p: any) => ({
  id: p.id,
  title: p.title,
  content: (p.content || "").substring(0, 500),
  currentFolder: p.folder,
  currentTags: p.tags
})))}

Output Format: Return ONLY a JSON object:
{
  "results": [
    {
      "id": "prompt_id",
      "suggestedFolderId": "matching folder id or keep current if best",
      "suggestedFolderName": "name of folder in Hebrew",
      "suggestedTags": ["tag1", "tag2", "tag3"],
      "improvedTitle": "Clean professional title in Hebrew",
      "reason": "Brief reason in Hebrew"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: instruction,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const parsed = cleanAndParseJson(response.text, { results: [] });
      res.json(parsed);
    } catch (err: any) {
      console.error("Bulk Organize Error:", err);
      res.status(500).json({ error: err.message || "Failed to bulk organize prompts" });
    }
  });

  // 7. Meta-Prompting / Everyday Language Generator Endpoint
  app.post("/api/gemini/meta-prompt", async (req, res) => {
    try {
      const { userIdea, targetPlatform = "General", tone = "Professional", language = "he" } = req.body;
      if (!userIdea || typeof userIdea !== "string" || !userIdea.trim()) {
        return res.status(400).json({ error: "userIdea is required" });
      }
      const ai = getGeminiClient(req);
      const isHebrew = language === "he";

      const instruction = `You are a world-class Meta-Prompt Architect.
The user will give you a raw, casual idea or request in everyday language.
Transform it into a production-grade, highly effective, reusable prompt template for LLMs (${targetPlatform}).

Requirements for the generated prompt:
1. Role Definition: Clear persona and expertise for the AI.
2. Context & Objective: What the model must achieve.
3. Detailed Step-by-Step Instructions: Concrete directives.
4. Dynamic Variables: Insert placeholders in $(VARIABLE_NAME) format (e.g. $(TOPIC), $(TARGET_AUDIENCE), $(CONTEXT)) so the prompt is reusable.
5. Constraints & Output Formatting: Specify formatting, length, exclusions, and tone (${tone}).
6. Few-Shot Example or Output Structure: Outline the expected output layout.

Language: Generate everything in ${isHebrew ? "Hebrew" : "English"}.

Output Format: Return ONLY a valid JSON object matching this schema:
{
  "title": "Short descriptive title (3-6 words)",
  "platform": "${targetPlatform}",
  "content": "The complete, formatted prompt template with $(VARIABLE) placeholders",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "folderSuggestion": "work" | "writing" | "personal",
  "variables": [
    {
      "name": "VARIABLE_NAME",
      "description": "What the user should enter here in Hebrew",
      "sample": "A realistic sample value"
    }
  ],
  "explanation": "Brief overview (2-3 sentences) of the prompt engineering techniques applied in Hebrew"
}`;

      const response = await withGeminiRetry(() => ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [
          { text: instruction },
          { text: `User Idea:\n"${userIdea.trim()}"` }
        ],
        config: {
          responseMimeType: "application/json",
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH
          }
        }
      }));

      const parsed = cleanAndParseJson(response.text, {});
      res.json(parsed);
    } catch (err: any) {
      console.error("Meta-Prompt Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate meta-prompt" });
    }
  });

  // 8. Summarize Prompt Endpoint
  app.post("/api/gemini/summarize", async (req, res) => {
    try {
      const { content, title } = req.body;
      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "content is required" });
      }
      const ai = getGeminiClient(req);
      const instruction = `Summarize the following prompt content in 1-2 concise, engaging sentences in Hebrew. Capture its core purpose, target, and what it achieves. Return ONLY the summary text, without markdown codeblocks or extra pleasantries.`;

      const response = await withGeminiRetry(() => ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: instruction },
          { text: `Title: ${title || ''}\n\nContent:\n${content}` }
        ]
      }));

      res.json({ summary: response.text?.trim() || "" });
    } catch (err: any) {
      console.error("Summarize Error:", err);
      res.status(500).json({ error: err.message || "Failed to summarize prompt" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
