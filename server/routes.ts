import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTranslationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Translation API route
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, from, to } = req.body;
      
      if (!text || !to) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Use translation service
      const translatedText = await translateText(text, from || 'auto', to);
      
      console.log(`Translation result: "${text}" (${from || 'auto'}) -> "${translatedText}" (${to})`);
      
      // Store translation in memory
      const translation = await storage.createTranslation({
        sourceText: text,
        translatedText,
        sourceLanguage: from || 'auto',
        targetLanguage: to
      });

      res.json({
        translatedText,
        sourceLanguage: from || 'auto',
        targetLanguage: to
      });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Translation failed" });
    }
  });

  // Detect language route
  app.post("/api/detect-language", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const detectedLanguage = await detectLanguage(text);
      res.json({ language: detectedLanguage });
    } catch (error) {
      console.error("Language detection error:", error);
      res.status(500).json({ error: "Language detection failed" });
    }
  });

  // Get recent translations
  app.get("/api/translations", async (req, res) => {
    try {
      const translations = await storage.getRecentTranslations(10);
      res.json(translations);
    } catch (error) {
      console.error("Error fetching translations:", error);
      res.status(500).json({ error: "Failed to fetch translations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Translation service using MyMemory API (free)
async function translateText(text: string, from: string, to: string): Promise<string> {
  const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
  
  // If Google API key is available, use Google Translate
  if (API_KEY && API_KEY !== "demo_key") {
    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: from === 'auto' ? undefined : from,
          target: to,
          format: 'text'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.translations[0].translatedText;
      }
    } catch (error) {
      console.error("Google Translate API error:", error);
    }
  }

  // Try Microsoft Translator (free tier, more reliable)
  try {
    const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${to}${from !== 'auto' ? `&from=${from}` : ''}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATOR_KEY || 'none'
      },
      body: JSON.stringify([{ text }])
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0].translations && data[0].translations[0]) {
        return data[0].translations[0].text;
      }
    }
  } catch (error) {
    console.error("Microsoft Translator API error:", error);
  }

  // Try Lingva Translate (free Google Translate alternative)
  try {
    const sourceCode = from === 'auto' ? 'auto' : from;
    const response = await fetch(`https://lingva.ml/api/v1/${sourceCode}/${to}/${encodeURIComponent(text)}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.translation) {
        return data.translation;
      }
    }
  } catch (error) {
    console.error("Lingva Translate API error:", error);
  }

  // Fallback to a different MyMemory endpoint with better quality
  try {
    const langPair = `${from === 'auto' ? 'en' : from}|${to}`;
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}&de=example@email.com`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UniversalTranslator/1.0)'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        // Check if translation quality is reasonable (not just returning original text)
        const translated = data.responseData.translatedText;
        if (translated.toLowerCase() !== text.toLowerCase()) {
          return translated;
        }
      }
    }
  } catch (error) {
    console.error("MyMemory API error:", error);
  }

  throw new Error("All translation services failed");
}

// Language detection service
async function detectLanguage(text: string): Promise<string> {
  const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
  
  // If Google API key is available, use Google Translate
  if (API_KEY && API_KEY !== "demo_key") {
    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.detections[0][0].language;
      }
    } catch (error) {
      console.error("Google Translate detection error:", error);
    }
  }

  // Fallback: Use MyMemory detection or simple heuristics
  try {
    // Use a simple language detection based on character patterns
    const hasLatin = /[a-zA-Z]/.test(text);
    const hasCyrillic = /[\u0400-\u04FF]/.test(text);
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    const hasChinese = /[\u4e00-\u9fff]/.test(text);
    const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff]/.test(text);
    const hasKorean = /[\uac00-\ud7af]/.test(text);
    
    if (hasChinese) return 'zh';
    if (hasJapanese) return 'ja';
    if (hasKorean) return 'ko';
    if (hasCyrillic) return 'ru';
    if (hasArabic) return 'ar';
    if (hasLatin) return 'en';
    
    return 'en'; // default fallback
  } catch (error) {
    console.error("Language detection error:", error);
    return 'en';
  }
}
