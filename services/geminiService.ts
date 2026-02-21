
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, PageContent, Transaction } from "../types";

export const analyzePage = async (content: PageContent): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
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
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
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

export const analyzeFinance = async (transactions: any[]): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const currency = localStorage.getItem('rpt_currency') || 'USD';
  
  const prompt = `Analyze the following financial transactions and provide a comprehensive intelligence report.
  Current Currency: ${currency}
  Transactions: ${JSON.stringify(transactions.slice(0, 100))}
  
  Provide a JSON response with:
  1. "summary": A markdown executive summary.
  2. "data": Key metrics like totalSpend, savingsRate, etc.
  3. "chartData": Array of objects for a summary chart.
  4. "categorization": Array of objects with transactionId, predictedCategory, and confidence.
  5. "recurring": Array of objects with description, frequency, nextExpectedDate, and type.
  6. "forecast": Object with nextMonthTotal, categoryForecast (map), and confidenceInterval.
  7. "anomalies": Array of objects with transactionId, score (0-1), riskLevel, and reason.
  8. "health": Object with stabilityScore (0-100), defaultProbability (0-1), predictedSavings, emergencyFundMonths, and readiness.
  9. "behavior": Object with impulseProbability (0-1), triggerExplanation, subscriptionGrowthRate, and totalRecurringBurdenPercent.
  10. "investments": Object with predicted3MonthGrowth and contributionConsistencyScore (0-100).
  
  Use the currency symbol for ${currency} in all text-based financial values.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          categorization: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                transactionId: { type: Type.STRING },
                predictedCategory: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["transactionId", "predictedCategory", "confidence"]
            }
          },
          recurring: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                frequency: { type: Type.STRING },
                nextExpectedDate: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["description", "frequency", "nextExpectedDate", "type"]
            }
          },
          forecast: {
            type: Type.OBJECT,
            properties: {
              nextMonthTotal: { type: Type.NUMBER },
              categoryForecast: { type: Type.OBJECT, additionalProperties: { type: Type.NUMBER } },
              confidenceInterval: { type: Type.ARRAY, items: { type: Type.NUMBER } }
            },
            required: ["nextMonthTotal", "categoryForecast", "confidenceInterval"]
          },
          anomalies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                transactionId: { type: Type.STRING },
                score: { type: Type.NUMBER },
                riskLevel: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["transactionId", "score", "riskLevel", "reason"]
            }
          },
          health: {
            type: Type.OBJECT,
            properties: {
              stabilityScore: { type: Type.NUMBER },
              defaultProbability: { type: Type.NUMBER },
              predictedSavings: { type: Type.NUMBER },
              emergencyFundMonths: { type: Type.NUMBER },
              readiness: { type: Type.STRING }
            },
            required: ["stabilityScore", "defaultProbability", "predictedSavings", "emergencyFundMonths", "readiness"]
          },
          behavior: {
            type: Type.OBJECT,
            properties: {
              impulseProbability: { type: Type.NUMBER },
              triggerExplanation: { type: Type.STRING },
              subscriptionGrowthRate: { type: Type.NUMBER },
              totalRecurringBurdenPercent: { type: Type.NUMBER }
            },
            required: ["impulseProbability", "triggerExplanation", "subscriptionGrowthRate", "totalRecurringBurdenPercent"]
          },
          investments: {
            type: Type.OBJECT,
            properties: {
              predicted3MonthGrowth: { type: Type.NUMBER },
              contributionConsistencyScore: { type: Type.NUMBER }
            },
            required: ["predicted3MonthGrowth", "contributionConsistencyScore"]
          }
        },
        required: ["categorization", "recurring", "forecast", "anomalies", "health", "behavior", "investments"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const parseBankStatement = async (fileData: { text?: string, base64?: string, mimeType?: string }): Promise<Transaction[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemInstruction = `You are a professional financial data extractor. 
  Extract every single transaction and return them in a standardized JSON format.
  Return a JSON object with a "transactions" array. Each transaction must have:
  - "date": YYYY-MM-DD format
  - "description": clear text description
  - "amount": positive number
  - "type": "credit" (money in) or "debit" (money out)
  - "merchant": merchant name if identifiable`;

  const parts: any[] = [];
  if (fileData.text) {
    parts.push({ text: `Extract transactions from this text:\n${fileData.text.substring(0, 30000)}` });
  } else if (fileData.base64 && fileData.mimeType) {
    parts.push({
      inlineData: {
        data: fileData.base64,
        mimeType: fileData.mimeType
      }
    });
    parts.push({ text: "Extract all transactions from this document/image." });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  description: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ['credit', 'debit'] },
                  merchant: { type: Type.STRING }
                },
                required: ["date", "description", "amount", "type"]
              }
            }
          },
          required: ["transactions"]
        }
      }
    });

    const text = response.text?.trim() || '{"transactions": []}';
    const data = JSON.parse(text);
    
    if (!data.transactions || !Array.isArray(data.transactions)) {
      return [];
    }

    return data.transactions.map((t: any, i: number) => ({
      ...t,
      amount: Number(t.amount) || 0,
      type: (t.type === 'credit' || t.type === 'debit') ? t.type : 'debit',
      id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${i}`,
      date: t.date && t.date.match(/^\d{4}-\d{2}-\d{2}$/) ? t.date : new Date().toISOString().split('T')[0]
    }));
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw new Error("The AI model failed to parse the statement. Please try a different file or format.");
  }
};

export const runFinancialModel = async (task: string, transactions: Transaction[]): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const currency = localStorage.getItem('rpt_currency') || 'USD';
  
  const prompt = `You are a specialized financial intelligence model. Task: ${task}
  Current Currency: ${currency}
  
  Analyze these transactions:
  ${JSON.stringify(transactions.slice(0, 100))}
  
  Provide a detailed analysis in JSON format specific to the task. 
  Include:
  1. "summary": A concise executive summary (markdown supported).
  2. "data": A key-value object of primary metrics.
  3. "chartData": (Optional) An array of objects for visualization (e.g., [{ name: "Category", value: 100 }]).
  4. "recommendations": (Optional) An array of strings for improvement.
  
  Use the currency symbol for ${currency} in your summary and text values. 
  Ensure the JSON is valid and strictly follows the schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || '{}');
};
