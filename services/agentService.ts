
import { GoogleGenAI } from "@google/genai";
import { BriefingData, AgentDefinition } from "../types";
import * as replicateService from "./replicateService";

export const agentService = {
  /**
   * Executes a specific agent step within a workflow pipeline.
   */
  runStep: async (agent: AgentDefinition, context: string): Promise<string> => {
    if (!agent.isActive) return context;

    // Handle image generation separately (doesn't need Gemini API)
    if (agent.role === 'image') {
      return await handleImageGeneration(context);
    }

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

/**
 * Handle image generation for stories
 * Parses the briefing JSON, generates images for each story, and returns updated JSON
 */
async function handleImageGeneration(context: string): Promise<string> {
  try {
    console.log('[ImageGenerationAgent] Starting image generation...');

    // Parse the incoming briefing data
    let briefing: BriefingData;
    try {
      // Remove markdown code blocks if present
      const cleanedContext = context
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      briefing = JSON.parse(cleanedContext);
    } catch (parseError) {
      console.error('[ImageGenerationAgent] Failed to parse briefing JSON:', parseError);
      return context; // Return original context if parsing fails
    }

    if (!briefing.stories || briefing.stories.length === 0) {
      console.warn('[ImageGenerationAgent] No stories found in briefing');
      return context;
    }

    // Generate images for stories that don't have them yet
    console.log(`[ImageGenerationAgent] Generating images for ${briefing.stories.length} stories with story-specific prompts...`);

    // Pass full Story objects to image generation service so it can read content
    const imageUrls = await replicateService.generateImages(briefing.stories);

    // Update stories with generated image URLs
    briefing.stories = briefing.stories.map((story, index) => {
      if (imageUrls[index]) {
        return {
          ...story,
          image: imageUrls[index],
        };
      }
      return story;
    });

    // Log summary
    const successCount = imageUrls.filter((url) => url !== null).length;
    console.log(
      `[ImageGenerationAgent] Successfully generated ${successCount}/${briefing.stories.length} images`
    );

    // Return updated briefing as JSON string
    return JSON.stringify(briefing, null, 2);
  } catch (error) {
    console.error('[ImageGenerationAgent] Error during image generation:', error);
    // Return original context on error to allow workflow to continue
    return context;
  }
}
