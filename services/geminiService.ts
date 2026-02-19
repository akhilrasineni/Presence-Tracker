import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, PageContent } from "../types";

export const analyzePage = async (content: PageContent): Promise<AnalysisResult> => {
  // Always initialize GoogleGenAI with a fresh instance inside the service call to ensure the latest process.env.API_KEY is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze the following web page content:
  Title: ${content.title}
  URL: ${content.url}
  Content: ${content.body.substring(0, 15000)}
  
  Provide a JSON response with:
  1. A concise summary (max 3 sentences).
  2. 5 key points.
  3. Overall sentiment (Positive/Neutral/Negative).
  4. Estimated reading time for the full content.
  5. Top 3 tags or topics.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          sentiment: { type: Type.STRING },
          readingTime: { type: Type.STRING },
          topics: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["summary", "keyPoints", "sentiment", "readingTime", "topics"]
      }
    }
  });

  // Access .text as a property, not a method.
  return JSON.parse(response.text || '{}') as AnalysisResult;
};

export const chatWithPage = async (history: { role: string, parts: { text: string }[] }[], userMessage: string, context: PageContent) => {
  // Always initialize GoogleGenAI with a fresh instance inside the service call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Create chat session with current conversation history and system instructions
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: history,
    config: {
      systemInstruction: `You are an AI browser extension assistant. You have access to the current page content. 
      Help the user understand the page, answer questions based on the content, and be concise.
      Current Page Title: ${context.title}
      Current Page Body: ${context.body.substring(0, 10000)}`,
    }
  });

  // chat.sendMessage only accepts the message parameter.
  const result = await chat.sendMessage({ message: userMessage });
  // Access .text as a property.
  return result.text;
};
