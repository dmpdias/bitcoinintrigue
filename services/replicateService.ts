import { Story } from '../types';

// Replicate API configuration
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_KEY;
const REPLICATE_API_URL = 'https://api.replicate.com/v1';

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

    // Validate API token
    if (!REPLICATE_API_TOKEN) {
      console.error(`[ImageGenerator] Replicate API token not configured`);
      return null;
    }

    // Step 1: Create prediction
    console.log(`[ImageGenerator] Creating prediction with Replicate API...`);

    const predictionResponse = await fetch(`${REPLICATE_API_URL}/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-schnell', // FLUX.1 [schnell] model identifier
        input: {
          prompt: prompt,
          aspect_ratio: '16:9',
          num_outputs: 1,
        },
      }),
    });

    if (!predictionResponse.ok) {
      const errorData = await predictionResponse.json();
      console.error(`[ImageGenerator] Prediction creation failed for ${category}:`, errorData);
      return null;
    }

    const prediction = await predictionResponse.json();
    console.log(`[ImageGenerator] Prediction created: ${prediction.id}`);

    // Step 2: Poll for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes with 1-second polls
    let finalPrediction = prediction;

    while (!completed && attempts < maxAttempts) {
      attempts++;

      const statusResponse = await fetch(`${REPLICATE_API_URL}/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        },
      });

      if (!statusResponse.ok) {
        console.error(`[ImageGenerator] Failed to check prediction status for ${category}`);
        return null;
      }

      finalPrediction = await statusResponse.json();

      if (finalPrediction.status === 'succeeded') {
        completed = true;
        console.log(`[ImageGenerator] Prediction succeeded after ${attempts} checks for ${category}`);
      } else if (finalPrediction.status === 'failed') {
        console.error(`[ImageGenerator] Prediction failed for ${category}:`, finalPrediction.error);
        return null;
      } else {
        // Wait 1 second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!completed) {
      console.error(`[ImageGenerator] Prediction timed out for ${category}`);
      return null;
    }

    // Step 3: Extract image URL from output
    if (!finalPrediction.output || finalPrediction.output.length === 0) {
      console.error(`[ImageGenerator] No output from Replicate for ${category}`);
      return null;
    }

    const imageUrl = finalPrediction.output[0];
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
