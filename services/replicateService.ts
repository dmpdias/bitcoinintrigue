import { Story } from '../types';

// Vercel API endpoint - handles Replicate API calls server-side to avoid CORS
const API_ENDPOINT = '/api/generate-image';

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

    // Call Vercel API (server-side) to avoid CORS issues
    console.log(`[ImageGenerator] 📡 Calling Vercel API...`);
    console.log(`[ImageGenerator]    URL: ${API_ENDPOINT}`);

    let apiResponse;
    try {
      apiResponse = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          headline: headline,
          category: category,
          prompt: prompt,
        }),
      });
    } catch (fetchError: any) {
      console.error(`[ImageGenerator] ❌ Network error calling API: ${fetchError.message}`);
      return null;
    }

    if (!apiResponse.ok) {
      try {
        const errorData = await apiResponse.json();
        console.error(`[ImageGenerator] ❌ API failed (HTTP ${apiResponse.status}):`, errorData);
      } catch (e) {
        console.error(`[ImageGenerator] ❌ API failed (HTTP ${apiResponse.status})`);
      }
      return null;
    }

    let result;
    try {
      result = await apiResponse.json();
    } catch (parseError) {
      console.error(`[ImageGenerator] ❌ Failed to parse API response:`, parseError);
      return null;
    }

    if (!result.success || !result.imageUrl) {
      console.error(`[ImageGenerator] ❌ API returned invalid response:`, result);
      return null;
    }

    const imageUrl = result.imageUrl;
    console.log(`[ImageGenerator] ✅ Image generated via API: ${imageUrl.substring(0, 80)}...`);

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
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[ImageGenerator] 🎨 BATCH IMAGE GENERATION START`);
    console.log(`[ImageGenerator] Total stories to process: ${stories.length}`);
    stories.forEach((s, i) => {
      console.log(`[ImageGenerator]    ${i + 1}. ${s.category}: "${s.headline.substring(0, 50)}..."`);
    });
    console.log(`${'='.repeat(60)}\n`);

    // Generate all images in parallel
    const promises = stories.map((story, index) => {
      console.log(`[ImageGenerator] Starting image generation for story ${index + 1}/${stories.length}...`);
      return generateImage(story);
    });

    console.log(`[ImageGenerator] ⏳ Waiting for all images to complete...`);
    const results = await Promise.all(promises);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`[ImageGenerator] 🎨 BATCH IMAGE GENERATION COMPLETE`);
    const successCount = results.filter(url => url !== null).length;
    console.log(`[ImageGenerator] ✅ Success: ${successCount}/${stories.length} images`);
    console.log(`${'='.repeat(60)}\n`);

    return results;
  } catch (error) {
    console.error('[ImageGenerator] ❌ Error generating batch images:', error);
    return stories.map(() => null);
  }
};

export default {
  generateImage,
  generateImages,
};
