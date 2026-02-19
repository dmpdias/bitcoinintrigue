import Replicate from 'replicate';
import { Story } from '../types';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

/**
 * Generate a custom prompt based on story content
 * Reads the story headline and content to create a specific, editorial prompt
 */
function generateCustomPrompt(story: Story): string {
  const { headline, content, category } = story;

  // Extract key themes from content (first 2 paragraphs)
  const contentPreview = content.slice(0, 2).join(' ').substring(0, 200);

  // Build editorial prompt that captures the specific story
  let prompt = 'Editorial illustration for Bitcoin article. ';

  // Category-specific nuance
  if (category.toUpperCase().includes('PRICE')) {
    prompt += `Story: "${headline}". Show a single human moment in the moment of market tension - someone reacting to news, checking a device, moment of decision. `;
    prompt += `Setting: contemporary office or home, real object (laptop, phone, notebook). `;
    prompt += `Mood: contemplative, focused, realistic. `;
  } else if (category.toUpperCase().includes('GLOBAL') || category.toUpperCase().includes('WORLD')) {
    prompt += `Story: "${headline}". Show a real place and real people in authentic global context. `;
    prompt += `Focus on the human element - a genuine moment of adoption, exchange, or cultural intersection. `;
    prompt += `Setting: recognizable location, local detail, real object. `;
    prompt += `Mood: hopeful, authentic, grounded. `;
  } else if (category.toUpperCase().includes('WHALE')) {
    prompt += `Story: "${headline}". Show the metaphorical weight of large-scale action - a human figure observing something significant. `;
    prompt += `Setting: surveillance room, trading floor, computer screen perspective, real objects. `;
    prompt += `Mood: watchful, analytical, calm focus. `;
    prompt += `Suggest scale and importance without showing charts or data. `;
  } else if (category.toUpperCase().includes('LESSON') || category.toUpperCase().includes('EDUCATION')) {
    prompt += `Story: "${headline}". Show the moment of learning - a person discovering something. `;
    prompt += `Setting: everyday setting with a book, device, or teaching moment. `;
    prompt += `Mood: clarity, discovery, understanding, welcoming. `;
    prompt += `Contemporary, approachable, non-intimidating visual. `;
  } else if (category.toUpperCase().includes('SPOTLIGHT') || category.toUpperCase().includes('PROJECT')) {
    prompt += `Story: "${headline}". Show real people using or interacting with technology. `;
    prompt += `Setting: authentic everyday context - home, cafe, workspace. `;
    prompt += `Mood: practical, human-centered, hopeful about technology. `;
    prompt += `Focus on the relationship between person and tool. `;
  } else {
    prompt += `Story: "${headline}". Show a real human moment connected to the narrative. `;
    prompt += `Authentic setting, genuine emotion, contemporary context. `;
    prompt += `Mood: editorial, sophisticated, human-focused. `;
  }

  // Visual rules always applied
  prompt += `Visual style: editorial illustration (New Yorker, FT Weekend, Economist). `;
  prompt += `Warm palette: cream, terracotta, navy, amber only. `;
  prompt += `Clean lines, sophisticated, contemporary aesthetic. `;
  prompt += `Lighting: natural, warm, editorial quality. `;
  prompt += `No text, no charts, no logos, no coins, no rockets, no clichés. No Bitcoin symbols visible.`;

  return prompt;
}

/**
 * Generate an editorial illustration image using Replicate's FLUX model
 * @param story - Story object with headline, content, and category
 * @returns Image URL or null if generation fails
 */
export const generateImage = async (
  story: Story
): Promise<string | null> => {
  const headline = story.headline;
  const category = story.category;
  try {
    // Validate inputs
    if (!headline || !category) {
      console.error('Missing headline or category for image generation');
      return null;
    }

    // Generate custom prompt based on story content
    const prompt = generateCustomPrompt(story);

    console.log(`[ImageGenerator] Generating image for: ${category} - ${headline}`);
    console.log(`[ImageGenerator] Custom prompt: ${prompt.substring(0, 150)}...`);

    // Call Replicate FLUX.1 [schnell] model - optimized for speed and cost
    const output = await replicate.run(
      'black-forest-labs/flux-schnell',
      {
        input: {
          prompt: prompt,
          aspect_ratio: '16:9',
        },
      }
    ) as any[];

    if (!output || output.length === 0) {
      console.error(`[ImageGenerator] No output from Replicate for ${category}`);
      return null;
    }

    // Handle Replicate SDK response - output contains FileOutput objects
    let imageUrl: string | null = null;
    const firstOutput = output[0];

    // FileOutput objects have a .url() method to get the HTTP URL
    if (firstOutput && typeof firstOutput.url === 'function') {
      try {
        imageUrl = firstOutput.url();
        console.log(`[ImageGenerator] Extracted URL from FileOutput for ${category}`);
      } catch (urlError) {
        console.error(`[ImageGenerator] Failed to get URL from FileOutput: ${urlError}`);
        return null;
      }
    }
    // Check if it's already a string URL
    else if (typeof firstOutput === 'string') {
      imageUrl = firstOutput;
      console.log(`[ImageGenerator] Got direct URL string for ${category}`);
    }
    // Fallback: try toString()
    else if (firstOutput && typeof firstOutput === 'object') {
      try {
        const urlStr = firstOutput.toString();
        if (urlStr && urlStr.includes('http')) {
          imageUrl = urlStr;
          console.log(`[ImageGenerator] Extracted URL via toString() for ${category}`);
        }
      } catch (e) {
        console.error(`[ImageGenerator] Could not extract URL for ${category}`);
      }
    }

    if (!imageUrl) {
      console.error(`[ImageGenerator] Could not extract URL from output for ${category}`);
      return null;
    }

    console.log(`[ImageGenerator] Successfully generated image: ${imageUrl}`);

    return imageUrl;
  } catch (error) {
    console.error(
      `[ImageGenerator] Error generating image for ${category}:`,
      error
    );
    // Return null instead of throwing to allow workflow to continue
    return null;
  }
};

/**
 * Generate multiple images in parallel for stories
 * @param stories - Array of Story objects with full content
 * @returns Array of image URLs (null for failed generations)
 */
export const generateImages = async (
  stories: Story[]
): Promise<(string | null)[]> => {
  try {
    console.log(`[ImageGenerator] Generating ${stories.length} images with story-specific prompts...`);

    // Generate all images in parallel
    const promises = stories.map((story) =>
      generateImage(story)
    );

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('[ImageGenerator] Error generating batch images:', error);
    return stories.map(() => null);
  }
};

export default {
  generateImage,
  generateImages,
};
