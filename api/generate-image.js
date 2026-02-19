/**
 * Vercel Serverless Function to generate images via Replicate
 * Endpoint: /api/generate-image
 * Method: POST
 *
 * This function runs on Vercel's server (not browser), avoiding CORS issues
 */

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { headline, category, prompt } = req.body;

    // Validate inputs
    if (!headline || !category || !prompt) {
      return res.status(400).json({
        error: 'Missing required fields: headline, category, prompt',
      });
    }

    // Get API token from environment variable
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_API_TOKEN) {
      console.error('[API] REPLICATE_API_TOKEN not configured');
      return res.status(500).json({
        error: 'REPLICATE_API_TOKEN not configured on server',
      });
    }

    console.log(`[API] Generating image for: ${category}`);

    // Step 1: Create prediction
    const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-schnell',
        input: {
          prompt: prompt,
          aspect_ratio: '16:9',
          num_outputs: 1,
        },
      }),
    });

    if (!predictionResponse.ok) {
      const errorData = await predictionResponse.json();
      console.error('[API] Prediction creation failed:', errorData);
      return res.status(predictionResponse.status).json({
        error: 'Failed to create prediction',
        details: errorData,
      });
    }

    const prediction = await predictionResponse.json();
    console.log(`[API] Prediction created: ${prediction.id}`);

    // Step 2: Poll for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes
    let finalPrediction = prediction;

    while (!completed && attempts < maxAttempts) {
      attempts++;

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          },
        }
      );

      if (!statusResponse.ok) {
        console.error(`[API] Status check failed (HTTP ${statusResponse.status})`);
        return res.status(statusResponse.status).json({
          error: 'Failed to check prediction status',
        });
      }

      finalPrediction = await statusResponse.json();

      if (finalPrediction.status === 'succeeded') {
        completed = true;
        console.log(
          `[API] Image generation succeeded after ${attempts} attempts`
        );
      } else if (finalPrediction.status === 'failed') {
        console.error('[API] Prediction failed:', finalPrediction.error);
        return res.status(400).json({
          error: 'Image generation failed',
          details: finalPrediction.error,
        });
      } else {
        // Wait 1 second before polling again
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!completed) {
      console.error(`[API] Prediction timed out after ${attempts} attempts`);
      return res.status(504).json({
        error: 'Image generation timed out',
      });
    }

    // Step 3: Extract image URL
    if (!finalPrediction.output || finalPrediction.output.length === 0) {
      console.error('[API] No output from Replicate');
      return res.status(400).json({
        error: 'No image output from Replicate',
      });
    }

    const imageUrl = finalPrediction.output[0];
    console.log(
      `[API] ✅ Image generated successfully: ${imageUrl.substring(0, 80)}...`
    );

    return res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      category: category,
      headline: headline,
    });

  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({
      error: error.message,
    });
  }
}
