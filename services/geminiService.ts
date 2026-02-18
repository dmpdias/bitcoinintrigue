
import { GoogleGenAI } from "@google/genai";
import { BRIEFING_CONTENT } from "../constants";

/**
 * Service to analyze the current briefing content using Gemini.
 * Uses gemini-3-flash-preview for efficient text summarization and reasoning.
 */
export const analyzeBriefing = async (userQuestion: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please check your configuration.";
  }

  // Create a new instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context,
    });
    
    // Use .text property directly (it's a getter)
    return response.text || "I couldn't generate an analysis at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, the analyst is currently offline (API Error).";
  }
};
