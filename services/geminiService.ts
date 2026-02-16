import { GoogleGenAI } from "@google/genai";
import { BRIEFING_CONTENT } from "../constants";

let aiClient: GoogleGenAI | null = null;

// Initialize client with environment variable safely
if (process.env.API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const analyzeBriefing = async (userQuestion: string): Promise<string> => {
  if (!aiClient) {
    return "API Key is missing. Please check your configuration.";
  }

  // Construct context from the current briefing content
  const context = `
    You are the 'Bitcoin Intrigue' AI Analyst. You help readers understand the daily newsletter.
    Here is the content of today's newsletter:
    
    INTRO: ${BRIEFING_CONTENT.intro.headline} - ${BRIEFING_CONTENT.intro.content}
    
    ${BRIEFING_CONTENT.stories.map(s => `
      CATEGORY: ${s.category}
      HEADLINE: ${s.headline}
      CONTENT: ${s.content.join(' ')}
    `).join('\n')}
    
    User Question: ${userQuestion}
    
    Answer the user concisely, using a professional but accessible tone (like a financial journalist). 
    Base your answer primarily on the provided newsletter content, but you can add general Bitcoin knowledge if needed for context.
  `;

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context,
    });
    
    return response.text || "I couldn't generate an analysis at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, the analyst is currently offline (API Error).";
  }
};