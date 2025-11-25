import { GoogleGenAI, Type } from "@google/genai";
import { GeminiMixMetadata } from "../types";

// Initialize Gemini
// Note: In a production app, never expose API keys on the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Prompt helper
const getSystemInstruction = (theme: string) => `
  You are a viral TikTok content strategist.
  The visual theme is: "${theme}".
  Create metadata for 15-second video mashups.
  Titles should be punchy, short (under 5 words), and use trending style.
  Descriptions should be short hashtags and engaging text.
`;

export const generateMixMetadata = async (theme: string): Promise<GeminiMixMetadata> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate 1 title and description.",
      config: {
        systemInstruction: getSystemInstruction(theme),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["title", "description"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned");
    const json = JSON.parse(text);
    return {
      title: json.title || "Awesome Mashup",
      description: json.description || "#viral #fyp",
    };
  } catch (error) {
    console.error("Gemini Single Error:", error);
    return { title: "Remix " + Math.floor(Math.random() * 100), description: "#remix" };
  }
};

export const generateBatchMixMetadata = async (theme: string, count: number): Promise<GeminiMixMetadata[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} unique titles and descriptions for ${count} different videos.`,
      config: {
        systemInstruction: getSystemInstruction(theme),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["title", "description"],
          }
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned");
    
    const json = JSON.parse(text);
    return Array.isArray(json) ? json : [json];

  } catch (error) {
    console.error("Gemini Batch Error:", error);
    // Fallback array
    return Array(count).fill(null).map((_, i) => ({
      title: `Batch Remix ${i + 1}`,
      description: "#viral #tiktok #mashup"
    }));
  }
};