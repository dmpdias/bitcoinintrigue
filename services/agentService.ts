
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

        // ✅ FIX 2: Halt workflow at approval gate if required
        // Don't execute content_review or x_posting agents yet - they run after user approval
        if (requiresApproval && (agent.role === 'content_review' || agent.role === 'x_posting')) {
          console.log(`[Workflow] Halting at approval gate before agent: ${agent.name}`);
          break; // Stop execution here - wait for user approval
        }

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
  },

  /**
   * Resume workflow after user approval
   * Runs X Posting Agent to generate tweets and save them with staggered times
   */
  resumeWorkflowAfterApproval: async (
    issue: BriefingData,
    agentsMap: Map<string, AgentDefinition>
  ): Promise<{
    success: boolean;
    tweets?: Array<{text: string; scheduledTime: string}>;
    executionLogs: Array<{agent: string; status: string; error?: string}>;
  }> => {
    const executionLogs: Array<{agent: string; status: string; error?: string}> = [];
    let tweets: Array<{text: string; scheduledTime: string}> = [];

    try {
      // Find X Posting Agent
      const xPostingAgent = Array.from(agentsMap.values()).find(a => a.role === 'x_posting');

      if (!xPostingAgent) {
        console.warn('[Workflow] X Posting Agent not found');
        return {
          success: false,
          tweets: [],
          executionLogs: [{agent: 'System', status: 'error', error: 'X Posting Agent not found'}]
        };
      }

      console.log(`[Workflow] Resuming after approval - Running: ${xPostingAgent.name}`);

      try {
        // Run X Posting Agent with approved briefing as context
        const response = await agentService.runStep(xPostingAgent, JSON.stringify(issue));

        // Parse tweets from response
        try {
          const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleaned);

          if (parsed.posts && Array.isArray(parsed.posts)) {
            // Generate staggered posting times (2-hour intervals starting from now)
            const now = new Date();
            const baseTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Start 2 hours from now

            tweets = parsed.posts.map((post: string, index: number) => {
              const scheduledTime = new Date(baseTime.getTime() + (index * 2 * 60 * 60 * 1000)); // 2-hour gaps
              return {
                text: post,
                scheduledTime: scheduledTime.toISOString()
              };
            });

            console.log(`[Workflow] X Posting Agent generated ${tweets.length} tweets with staggered times`);
            executionLogs.push({
              agent: xPostingAgent.name,
              status: 'success'
            });

            return {
              success: true,
              tweets,
              executionLogs
            };
          } else {
            console.warn('[Workflow] No posts array found in X Posting Agent response');
            executionLogs.push({
              agent: xPostingAgent.name,
              status: 'warning',
              error: 'No posts array in response'
            });
            return {
              success: false,
              tweets: [],
              executionLogs
            };
          }
        } catch (parseError: any) {
          console.error('[Workflow] Failed to parse X Posting Agent response:', parseError);
          executionLogs.push({
            agent: xPostingAgent.name,
            status: 'error',
            error: `Failed to parse response: ${parseError.message}`
          });
          return {
            success: false,
            tweets: [],
            executionLogs
          };
        }
      } catch (agentError: any) {
        console.error(`[Workflow] X Posting Agent execution failed:`, agentError);
        executionLogs.push({
          agent: xPostingAgent.name,
          status: 'error',
          error: agentError.message
        });
        return {
          success: false,
          tweets: [],
          executionLogs
        };
      }
    } catch (error: any) {
      console.error('[Workflow] Resume after approval failed:', error);
      return {
        success: false,
        tweets: [],
        executionLogs: [{
          agent: 'System',
          status: 'error',
          error: error.message
        }]
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
