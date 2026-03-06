import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface MeditationScript {
  title: string;
  content: string;
  imagePrompt: string;
}

export async function generateMeditationScript(theme: string, durationMinutes: number): Promise<MeditationScript> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Create a guided meditation script for a ${durationMinutes}-minute session focused on "${theme}". 
    The output should be a JSON object with:
    - title: A calming title.
    - content: The full meditation script (around ${durationMinutes * 100} words).
    - imagePrompt: A detailed prompt for an AI image generator to create a peaceful, atmospheric background visual matching the theme.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
        },
        required: ["title", "content", "imagePrompt"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateMeditationImage(prompt: string, size: "1K" | "2K" | "4K"): Promise<string> {
  // Using gemini-3-pro-image-preview as requested
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: size,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image");
}

export async function generateMeditationVoice(text: string): Promise<string> {
  // Using gemini-2.5-flash-preview-tts as requested
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this meditation script in a very slow, calm, and soothing voice: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Kore" }, // Kore is often a good calm voice
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    return `data:audio/wav;base64,${base64Audio}`;
  }
  throw new Error("Failed to generate audio");
}

export async function chatWithGemini(message: string, history: { role: string; parts: { text: string }[] }[]) {
  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: "You are ZenBot, a compassionate and knowledgeable meditation and mindfulness guide. Help users with questions about meditation techniques, stress relief, and mindfulness practices.",
    },
    history: history,
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
