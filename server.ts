import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large base64 uploads for images and audio
  app.use(express.json({ limit: "50mb" }));

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
        model: "gemini-3.5-flash",
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

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: instruction },
          { text: `Content:\n${content}` }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const text = response.text || "{}";
      const data = JSON.parse(text);
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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: userPrompt,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH
          }
        }
      });
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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [
          imagePart,
          { text: instruction }
        ],
      });
      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Image Analysis Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image" });
    }
  });

  // API Route: Chat Playground for testing prompts (Multi-turn chat)
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }
      const ai = getGeminiClient(req);
      
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: systemInstruction || "You are a helpful AI assistant testing a custom prompt.",
        }
      });
      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to chat with Gemini" });
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
