import { GoogleGenAI } from "@google/genai";

// getAIAssistance provides clinical assistant capabilities using Gemini models.
export const getAIAssistance = async (prompt: string, context: string = "") => {
  try {
    // Always use a new GoogleGenAI instance right before the API call to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Use gemini-3-pro-preview for complex clinical reasoning tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Context: You are a medical assistant for a Dental Clinic and Pharmacy. ${context}\n\nUser Question: ${prompt}`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    // Directly access the .text property of the response object.
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am currently unable to process that request. Please try again later.";
  }
};