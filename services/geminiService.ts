import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message } from '../types';

export const geminiService = {
  getChatResponse: async (history: Message[], newMessage: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API Key not found in environment variables");
      return "I apologize, but I am unable to connect to my brain right now (API Key missing).";
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      // Convert internal Message format to Gemini Content format
      // Note: We filter out messages that might have errors or empty text if necessary
      const historyContents: Content[] = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text } as Part]
      }));

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: historyContents,
        config: {
          systemInstruction: "You are EduChat Pro, a sophisticated and helpful AI educational assistant. never deviate from educational content and always remind students to stay focused on studies, never answer anything that has nothing to do with education. You assist students with coursework, general knowledge, study tips, and university-related queries. Your tone is professional, encouraging, and clear. Keep responses concise unless asked for detailed explanations.",
        }
      });

      const result = await chat.sendMessage({ message: newMessage });
      return result.text || "I didn't get a response.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "I'm having trouble connecting to the server right now. Please try again later.";
    }
  },

  generateAnswer: async (question: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "API Key missing.";
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: question,
        config: {
          systemInstruction: "You are an educational assistant. Provide a clear, concise, and helpful answer to the user's question, suitable for adding to a FAQ or Knowledge Base.",
        }
      });
      return response.text || "No response generated.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Error generating answer.";
    }
  }
};