import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
const REPLICATE_API_URL = "https://api.replicate.com/v1";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { headline, category, prompt } = await req.json();

    if (!headline || !category || !prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: headline, category, prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!REPLICATE_API_TOKEN) {
      return new Response(
        JSON.stringify({ error: "REPLICATE_API_TOKEN not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Edge Function] Generating image for: ${category}`);

    // Step 1: Create prediction
    const predictionResponse = await fetch(`${REPLICATE_API_URL}/predictions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-schnell",
        input: {
          prompt: prompt,
          aspect_ratio: "16:9",
          num_outputs: 1,
        },
      }),
    });

    if (!predictionResponse.ok) {
      const errorData = await predictionResponse.json();
      console.error(`[Edge Function] Prediction creation failed:`, errorData);
      return new Response(
        JSON.stringify({ error: "Failed to create prediction", details: errorData }),
        { status: predictionResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prediction = await predictionResponse.json();
    console.log(`[Edge Function] Prediction created: ${prediction.id}`);

    // Step 2: Poll for completion
    let completed = false;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes
    let finalPrediction = prediction;

    while (!completed && attempts < maxAttempts) {
      attempts++;

      const statusResponse = await fetch(`${REPLICATE_API_URL}/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        },
      });

      if (!statusResponse.ok) {
        console.error(`[Edge Function] Status check failed (HTTP ${statusResponse.status})`);
        return new Response(
          JSON.stringify({ error: "Failed to check prediction status" }),
          { status: statusResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      finalPrediction = await statusResponse.json();

      if (finalPrediction.status === "succeeded") {
        completed = true;
        console.log(`[Edge Function] Image generation succeeded after ${attempts} attempts`);
      } else if (finalPrediction.status === "failed") {
        console.error(`[Edge Function] Prediction failed:`, finalPrediction.error);
        return new Response(
          JSON.stringify({ error: "Image generation failed", details: finalPrediction.error }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Wait 1 second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!completed) {
      console.error(`[Edge Function] Prediction timed out after ${attempts} attempts`);
      return new Response(
        JSON.stringify({ error: "Image generation timed out" }),
        { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Extract image URL
    if (!finalPrediction.output || finalPrediction.output.length === 0) {
      console.error(`[Edge Function] No output from Replicate`);
      return new Response(
        JSON.stringify({ error: "No image output from Replicate" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageUrl = finalPrediction.output[0];
    console.log(`[Edge Function] ✅ Image generated successfully: ${imageUrl.substring(0, 80)}...`);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        category: category,
        headline: headline,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Edge Function] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
