
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, PageContent } from "../types";

export const analyzePage = async (content: PageContent): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze the following web page content:
  Title: ${content.title}
  URL: ${content.url}
  Content: ${content.body.substring(0, 15000)}
  
  Provide a JSON response with:
  1. A concise summary (max 3 sentences).
  2. 5 key points.
  3. Overall sentiment (Positive/Neutral/Negative).
  4. Estimated reading time.
  5. Top 3 tags.
  6. A list of "suggestedTasks" (max 3) found in the text that the user might need to do next. Each task has a "description" and "priority".`;

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
          suggestedTasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
              },
              required: ["description", "priority"]
            }
          }
        },
        required: ["summary", "keyPoints", "sentiment", "readingTime", "topics", "suggestedTasks"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as AnalysisResult;
};

export const chatWithPage = async (
  history: { role: string, parts: { text: string }[] }[], 
  userMessage: string, 
  context: PageContent,
  useSearch: boolean = false
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
        { role: 'user', parts: [{ text: `Current Page Context: ${context.body.substring(0, 10000)}` }] },
        ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
        { role: 'user', parts: [{ text: userMessage }] }
    ],
    config: {
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
      systemInstruction: `You are an AI browser extension assistant. Answer based on the page context provided. 
      If Search is enabled, use it to find up-to-date info related to the user's query or the page.`,
    }
  });

  return {
    text: response.text,
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean) as string[] || []
  };
};
