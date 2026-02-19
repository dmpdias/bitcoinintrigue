import Replicate from 'replicate';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

// Image prompt templates by article category - Optimized for FLUX.1 [schnell]
const promptTemplates: Record<string, string> = {
  'price-story': `Modern editorial illustration for business article about Bitcoin price movements. Show contemporary scene: person on laptop monitoring markets, or traders in action. Clean lines, contemporary aesthetic. Warm navy and orange accents on cream background. Professional, financial. NO charts, graphs, or Bitcoin logos visible.`,

  'world-story': `Contemporary editorial illustration for global Bitcoin story. Show real locations, people in authentic settings, cultural context relevant to the headline. Modern, clean visual style. Warm navy, orange, cream palette. Human-centered. NO maps, flags, or logos.`,

  'curiosity-story': `Modern editorial portrait for feature article. Real person, authentic moment, contemporary setting. Human interest. Clean, sophisticated aesthetic. Warm colors with good typography potential. Professional magazine quality. Contemporary context.`,

  'education-story': `Contemporary conceptual illustration for Bitcoin learning article. Show people learning - hands on devices, reading, thinking. Modern context. NO price charts or technical graphs. Warm, inviting, educational. Clean, contemporary visual style.`,

  'real-life-story': `Modern editorial scene for real-life user story. Authentic human moment, genuine emotion, contemporary setting. Warm navy, orange, cream. Professional editorial quality. Clean lines, contemporary aesthetic. Real-world context.`,

  'newsletter-hero': `Contemporary editorial illustration for Bitcoin newsletter header. Modern, professional, financial storytelling without clichés. Warm navy, orange, cream. Human elements or abstract financial concept. NO rockets, moons, coins, or lambos. Clean, sophisticated.`,
};

/**
 * Generate an editorial illustration image using Replicate's FLUX model
 * @param headline - Article headline
 * @param category - Article category (price-story, world-story, etc.)
 * @returns Image URL or null if generation fails
 */
export const generateImage = async (
  headline: string,
  category: string
): Promise<string | null> => {
  try {
    // Validate inputs
    if (!headline || !category) {
      console.error('Missing headline or category for image generation');
      return null;
    }

    // Get template prompt for this category
    const template = promptTemplates[category] || promptTemplates['price-story'];

    // Combine template with specific headline
    const prompt = `${template}\n\nArticle topic: "${headline}"`;

    console.log(`[ImageGenerator] Generating image for: ${category} - ${headline}`);

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
 * @param stories - Array of story headlines and categories
 * @returns Array of image URLs (null for failed generations)
 */
export const generateImages = async (
  stories: Array<{ headline: string; category: string }>
): Promise<(string | null)[]> => {
  try {
    console.log(`[ImageGenerator] Generating ${stories.length} images...`);

    // Generate all images in parallel
    const promises = stories.map((story) =>
      generateImage(story.headline, story.category)
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
