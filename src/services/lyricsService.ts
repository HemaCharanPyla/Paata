import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const fetchLyrics = async (title: string, artist: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find or generate the lyrics for the song "${title}" by "${artist}". If the song is a real song, provide the actual lyrics. If it's a generic title, create some cool lyrics that fit a high-energy music app vibe. Return ONLY the lyrics text, no other commentary.`,
    });

    return response.text || "Lyrics not found for this track.";
  } catch (error) {
    console.error("Error fetching lyrics:", error);
    return "Could not load lyrics at this time.";
  }
};
