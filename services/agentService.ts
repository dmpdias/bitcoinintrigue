
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
    
    // 1. RESEARCHER CONFIGURATION: Uses Google Search
    if (agent.role === 'researcher') {
      config.tools = [{ googleSearch: {} }];
    } 
    // 2. WRITER / REVIEWER / SEO CONFIGURATION: Must output JSON
    else if (['writer', 'reviewer', 'seo', 'journalist'].includes(agent.role)) {
      config.responseMimeType = "application/json";
    }

    try {
      // Build the prompt dynamically based on the role and previous context
      let contents = "";

      if (agent.role === 'researcher') {
        contents = `
          SYSTEM ROLE: You are a ResearchAgent.
          TASK: ${agent.instructions}
          
          OUTPUT: Provide a detailed summary of the findings. Do NOT output JSON. Just plain text summaries.
        `;
      } else if (agent.role === 'planner') {
        contents = `
          SYSTEM ROLE: StoryPlannerAgent.
          INSTRUCTIONS: ${agent.instructions}
          
          --- RESEARCH DATA ---
          ${context}
          ---------------------
        `;
      } else if (agent.role === 'writer') {
        contents = `
          SYSTEM ROLE: WriterAgent.
          INSTRUCTIONS: ${agent.instructions}
          
          --- STORY PLAN & RESEARCH ---
          ${context}
          -----------------------------
          
          REMINDER: Output a JSON object with 'intro' and 'stories' array.
        `;
      } else if (agent.role === 'reviewer') {
        contents = `
          SYSTEM ROLE: NormieReviewerAgent.
          INSTRUCTIONS: ${agent.instructions}
          
          --- DRAFT JSON ---
          ${context}
          ------------------
          
          OUTPUT: Return the polished/fixed JSON.
        `;
      } else if (agent.role === 'seo') {
         contents = `
          SYSTEM ROLE: SEOAgent.
          INSTRUCTIONS: ${agent.instructions}
          
          --- APPROVED DRAFT JSON ---
          ${context}
          ---------------------------
          
          OUTPUT: Return the same JSON, but add an 'seo' object to each story in the 'stories' array.
        `;
      } else {
        // Fallback for generic agents
        contents = `
          SYSTEM ROLE: ${agent.role}
          INSTRUCTIONS: ${agent.instructions}
          
          --- CONTEXT ---
          ${context}
          ----------------
        `;
      }

      const response = await ai.models.generateContent({
        model: agent.model || 'gemini-3-flash-preview', 
        contents: contents,
        config
      });

      // Extract generated text
      const text = response.text || "";
      
      return text;
    } catch (error) {
      console.error(`Agent ${agent.name} failed during step execution:`, error);
      throw error;
    }
  }
};
