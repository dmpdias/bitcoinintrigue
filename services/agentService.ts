
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
  },

  /**
   * Execute a complete workflow with optional approval gate
   * Returns an ExecutionRecord with the generated issue and execution logs
   */
  runWorkflow: async (
    workflowId: string,
    steps: string[],
    agentsMap: Map<string, AgentDefinition>,
    requiresApproval: boolean = true
  ): Promise<{
    success: boolean;
    issue: BriefingData | null;
    executionLogs: Array<{agent: string; status: string; error?: string}>;
    halted?: boolean;
  }> => {
    const executionLogs: Array<{agent: string; status: string; error?: string}> = [];
    let context = "";
    let currentDraft: BriefingData | null = null;

    try {
      // Execute each agent in sequence
      for (const agentId of steps) {
        const agent = agentsMap.get(agentId);
        if (!agent || !agent.isActive) continue;

        try {
          console.log(`[Workflow] Executing agent: ${agent.name} (${agent.role})`);

          // Run the agent step
          const response = await agentService.runStep(agent, context);

          // Handle context piping based on role
          if (agent.role === 'researcher' || agent.role === 'planner') {
            context = response;
            executionLogs.push({agent: agent.name, status: 'success'});
          }
          else if (agent.role === 'writer') {
            context = response;
            try {
              const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
              currentDraft = parsed;
              executionLogs.push({agent: agent.name, status: 'success'});
            } catch (parseError) {
              executionLogs.push({agent: agent.name, status: 'warning', error: 'Failed to parse JSON'});
            }
          }
          else if (agent.role === 'reviewer') {
            context = response;
            try {
              const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
              currentDraft = parsed;
              executionLogs.push({agent: agent.name, status: 'success'});
            } catch (parseError) {
              executionLogs.push({agent: agent.name, status: 'warning', error: 'Failed to parse JSON'});
            }
          }
          else if (agent.role === 'seo') {
            context = response;
            try {
              const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
              currentDraft = parsed;
              executionLogs.push({agent: agent.name, status: 'success'});
            } catch (parseError) {
              executionLogs.push({agent: agent.name, status: 'warning', error: 'Failed to parse JSON'});
            }
          }
          else if (agent.role === 'image') {
            context = response;
            try {
              const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
              currentDraft = parsed;
              executionLogs.push({agent: agent.name, status: 'success'});
            } catch (parseError) {
              executionLogs.push({agent: agent.name, status: 'success'}); // Image generation is allowed to fail
            }
          }
          else if (agent.role === 'content_review') {
            context = response;
            executionLogs.push({agent: agent.name, status: 'success'});
          }
          else if (agent.role === 'x_posting') {
            context = response;
            try {
              const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
              if (parsed.posts) {
                executionLogs.push({agent: agent.name, status: 'success'});
              }
            } catch (parseError) {
              executionLogs.push({agent: agent.name, status: 'warning', error: 'Failed to parse tweets JSON'});
            }
          }
        } catch (stepError: any) {
          executionLogs.push({
            agent: agent.name,
            status: 'error',
            error: stepError.message
          });
          // Continue with next agent instead of failing entire workflow
        }
      }

      // Check approval gate
      if (requiresApproval && currentDraft) {
        // Save issue with pending_review status and halt
        const issue: BriefingData = {
          ...currentDraft,
          id: `issue-${Date.now()}`,
          approvalStatus: 'pending_review',
          status: 'review',
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          lastUpdated: new Date().toISOString()
        };

        return {
          success: true,
          issue,
          executionLogs,
          halted: true // Workflow halted at approval gate
        };
      }

      // No approval required or already approved - return issue with approved status
      if (currentDraft) {
        const issue: BriefingData = {
          ...currentDraft,
          id: `issue-${Date.now()}`,
          approvalStatus: 'approved',
          status: 'review',
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          lastUpdated: new Date().toISOString()
        };

        return {
          success: true,
          issue,
          executionLogs,
          halted: false
        };
      }

      // No draft generated
      return {
        success: false,
        issue: null,
        executionLogs,
        halted: false
      };

    } catch (error: any) {
      console.error(`[Workflow] Execution failed:`, error);
      return {
        success: false,
        issue: null,
        executionLogs: [...executionLogs, {
          agent: 'System',
          status: 'error',
          error: error.message
        }],
        halted: false
      };
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
      console.warn('[ImageGenerationAgent] ⚠️  No stories found in briefing');
      return context;
    }

    // Generate images for stories that don't have them yet
    console.log(`[ImageGenerationAgent] 📸 Generating images for ${briefing.stories.length} stories with story-specific prompts...`);
    console.log(`[ImageGenerationAgent]    Story categories: ${briefing.stories.map(s => s.category).join(', ')}`);

    // Pass full Story objects to image generation service so it can read content
    console.log(`[ImageGenerationAgent] 🚀 Starting image generation service...`);
    const imageUrls = await replicateService.generateImages(briefing.stories);

    console.log(`[ImageGenerationAgent] 📊 Image generation results:`, imageUrls.map((url, i) => ({
      story: briefing.stories[i].category,
      url: url ? `${url.substring(0, 60)}...` : 'null'
    })));

    // Update stories with generated image URLs
    briefing.stories = briefing.stories.map((story, index) => {
      if (imageUrls[index]) {
        console.log(`[ImageGenerationAgent] ✅ Story "${story.category}" now has image URL`);
        return {
          ...story,
          image: imageUrls[index],
        };
      }
      console.log(`[ImageGenerationAgent] ⚠️  Story "${story.category}" has NO image URL`);
      return story;
    });

    // Log summary
    const successCount = imageUrls.filter((url) => url !== null).length;
    console.log(
      `[ImageGenerationAgent] ✅ Successfully generated ${successCount}/${briefing.stories.length} images`
    );

    // Return updated briefing as JSON string
    return JSON.stringify(briefing, null, 2);
  } catch (error) {
    console.error('[ImageGenerationAgent] Error during image generation:', error);
    // Return original context on error to allow workflow to continue
    return context;
  }
}
