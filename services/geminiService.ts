
import { GoogleGenAI, Type } from "@google/genai";
import { TraceEntry, AIRecommendation } from "../types";

export const analyzePerformanceWithAI = async (
  traceData: TraceEntry[],
  vitals: any
): Promise<AIRecommendation[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze the following performance trace data and web vitals.
    Web Vitals: ${JSON.stringify(vitals)}
    Trace Data (Sample): ${JSON.stringify(traceData.slice(0, 50))}
    
    Identify potential bottlenecks, memory leaks, or inefficient rendering patterns.
    Provide structured recommendations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING },
              priority: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              suggestedFix: { type: Type.STRING }
            },
            required: ["id", "category", "priority", "title", "description"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return [{
      id: "error",
      category: "infrastructure",
      priority: "critical",
      title: "Analysis Failed",
      description: "Could not generate AI recommendations. Please check your API configuration."
    }];
  }
};
