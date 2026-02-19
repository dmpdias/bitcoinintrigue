import Replicate from 'replicate';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

// Image prompt templates by article category
const promptTemplates: Record<string, string> = {
  'price-story': `Editorial illustration for business article about Bitcoin price movements. Show a person analyzing financial data on a real device, stock market scene, or traders in focus. Style: FT Weekend magazine. Warm navy (#0d1b2a), orange accents (#f4611e), cream background. Professional, sophisticated. NO charts, graphs, or Bitcoin logos.`,

  'world-story': `Editorial illustration for international news article about Bitcoin adoption and regulation. Show real locations, buildings, people, or cultural elements relevant to the story. NO maps, flags, or logos. Style: FT Weekend. Warm navy and orange palette. Human-centered. Sophisticated magazine aesthetic.`,

  'curiosity-story': `Editorial illustration for feature article about people in Bitcoin. Show genuine human moments, real people, interesting characters. Human interest style. Warm navy and orange accents. Style: sophisticated magazine feature illustration. Real, authentic, not stock photo vibes.`,

  'education-story': `Conceptual illustration for Bitcoin education article. Show learning in action - hands interacting with devices, open books, people thinking, learning moments. NO price charts or graphs. Warm palette with navy and orange. Educational, inviting. FT Weekend style.`,

  'real-life-story': `Editorial portrait or scene for real-life user story. Show genuine human moment, real people, authentic interaction. Warm, welcoming tone. Editorial photography style. Warm colors (navy, orange, cream). Real-world context. Magazine-quality.`,

  'newsletter-hero': `Beautiful editorial illustration for Bitcoin newsletter header. Modern, professional, financial storytelling without clichés. NO rockets, moons, lambos, or crypto symbols. Warm colors (navy #0d1b2a, orange #f4611e, cream). Human elements optional. FT Weekend aesthetic.`,
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

    // Call Replicate FLUX model
    const output = await replicate.run(
      'black-forest-labs/flux-pro',
      {
        input: {
          prompt: prompt,
          aspect_ratio: '16:9',
          output_quality: 85,
          safety_tolerance: 6,
        },
      }
    ) as string[];

    if (!output || output.length === 0) {
      console.error(`[ImageGenerator] No output from Replicate for ${category}`);
      return null;
    }

    const imageUrl = output[0];
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
