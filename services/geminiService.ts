import { GoogleGenAI } from "@google/genai";

// getAIAssistance provides clinical assistant capabilities using Gemini models.
export const getAIAssistance = async (prompt: string, context: string = "") => {
  try {
    // Always use a new GoogleGenAI instance right before the API call to ensure the latest API key is used.
    // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Use gemini-3-flash-preview for fast and efficient clinical assistance.
    // Following guidelines to use ai.models.generateContent with model name and prompt.
    // systemInstruction is set in the config object for better context handling.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `You are a medical assistant for Dhool Dental Clinic and Pharmacy in Mogadishu. ${context}\n\nNote: If the user asks in Somali, please respond in Somali. If they ask in English, respond in English. Keep it professional and concise.`,
        temperature: 0.7,
        topP: 0.9,
      }
    });

    // Directly access the .text property of the response object as per guidelines.
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Waan ka xumahay, nidaamka AI-ga hadda wuu mashquulsan yahay. Fadlan dib isku day waxyar ka dib.";
  }
};