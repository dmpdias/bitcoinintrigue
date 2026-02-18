
import { GoogleGenAI } from "@google/genai";
import { BriefingData, AgentDefinition } from "../types";

export const agentService = {
  /**
   * Executes a specific agent step within a workflow pipeline.
   */
  runStep: async (agent: AgentDefinition, context: string): Promise<string> => {
    if (!agent.isActive) return context;
    if (!process.env.API_KEY) throw new Error("API Key missing");

    // Initialize the SDK right before use
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const config: any = {};
    if (agent.role === 'scout') {
      // Configuration for Google Search grounding
      config.tools = [{ googleSearch: {} }];
    } else if (agent.role === 'journalist') {
      config.responseMimeType = "application/json";
    }

    try {
      const response = await ai.models.generateContent({
        model: agent.model,
        contents: `INSTRUCTIONS: ${agent.instructions}\n\nCONTEXT/DATA: ${context}`,
        config
      });

      // Extract generated text from response
      return response.text || "";
    } catch (error) {
      console.error(`Agent ${agent.name} failed during step execution:`, error);
      throw error;
    }
  }
};
