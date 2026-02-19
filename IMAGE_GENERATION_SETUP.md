# ImageGeneratorAgent Setup & Implementation Guide

## Overview

Bitcoin Intrigue now has automatic image generation integrated into the article pipeline. The **ImageGeneratorAgent** uses Replicate's FLUX model to generate editorial illustration images that match the FT Weekend magazine aesthetic.

The agent sits in the middle of the workflow pipeline:
```
ResearchAgent → PlannerAgent → WriterAgent → ImageGeneratorAgent → ReviewerAgent → Publish
```

---

## Setup Instructions

### Step 1: Get a Replicate API Key

1. Go to [replicate.com](https://replicate.com)
2. Sign up (free tier available)
3. Navigate to Account → API Tokens
4. Copy your API token

### Step 2: Add API Key to .env.local

Edit `.env.local` in your project root and replace the placeholder:

```env
# Gemini API Configuration
VITE_GEMINI_API_KEY=AIzaSyAzu85onshlIWHuXpBiJJCc12hkGL93Fbw

# Replicate API Configuration
VITE_REPLICATE_API_KEY=your_actual_replicate_key_here
```

Save the file. (This file is not committed to Git—it's local only.)

### Step 3: Verify Setup

Build the project to verify the API key is properly injected:

```bash
npm run build
```

If successful, you'll see:
```
✓ built in X.XXs
```

### Step 4: Test Image Generation (Optional)

To test the image generation without running the full pipeline, create a simple test file:

```typescript
// test-image-gen.ts
import * as replicateService from './services/replicateService';

(async () => {
  const imageUrl = await replicateService.generateImage(
    'Bitcoin Price Movements',
    'price-story'
  );
  console.log('Generated image URL:', imageUrl);
})();
```

---

## How It Works

### The Pipeline

When you run a workflow in the BackOffice:

1. **ResearchAgent** gathers live Bitcoin data
2. **PlannerAgent** plans 5 articles
3. **WriterAgent** writes full JSON with article content
4. **ImageGeneratorAgent** (NEW)
   - Reads the JSON briefing
   - Extracts each story's headline and category
   - Calls Replicate FLUX API for each story
   - Gets back image URL
   - Updates `story.image` field with URL
   - Returns updated JSON
5. **ReviewerAgent** polishes the content
6. **Save** to Supabase with status='review'

### What Gets Generated

Images are generated for **5 main article categories**:

| Category | Style | Example |
|----------|-------|---------|
| **Price Story** | Financial analysis, traders, data | Person analyzing charts on device |
| **World Story** | International adoption, real locations | Buildings, markets, people in context |
| **Curiosity** | Human interest, real people | Authentic human moments |
| **Education** | Learning concepts, hands-on | Books, devices, learning in action |
| **Real Life** | User stories, authentic scenes | Real people, genuine moments |

**NOT generated:** Newsletter hero (can be added manually later)

---

## Image Generation Rules

### Style Requirements (Enforced in Prompts)

✅ **ALWAYS Generate:**
- Editorial illustration style (FT Weekend magazine quality)
- Human stories (people, places, real objects)
- Warm navy (#0d1b2a) + orange (#f4611e) + cream palette
- Professional, sophisticated aesthetic
- Photography-style or illustrated, NOT generic stock

❌ **NEVER Generate:**
- Price charts or candlestick graphs
- Bitcoin logos or coin imagery
- Rockets, moons, or "to the moon" imagery
- Lamborghinis or luxury cars
- Generic stock photo vibes

### Quality Control

The prompts are carefully engineered to produce consistent, on-brand results. Each prompt includes:
- Style direction (FT Weekend magazine)
- Color specifications
- Prohibited elements
- Tone and aesthetic requirements
- Context from the article headline

---

## Monitoring & Logs

### BackOffice Logs

When a workflow runs, check the **System Logs** tab in BackOffice for ImageGeneratorAgent messages:

```
[ImageGeneratorAgent] Generating image for: price-story - Bitcoin Dips...
[ImageGenerator] Generating image for: price-story - Bitcoin Dips...
[ImageGenerator] Successfully generated image: https://replicate.delivery/...
[ImageGenerationAgent] Successfully generated 5/5 images
```

### Error Handling

If image generation fails:
- The workflow **continues** (images are optional)
- Stories remain without images
- You can manually add images later in BackOffice editor
- No workflow failures due to image generation

This graceful degradation ensures your articles always get published, with or without images.

---

## Cost Considerations

Replicate pricing (as of Feb 2026):

- **FLUX Pro**: ~$0.04 per image (5 images ≈ $0.20 per edition)
- **Free tier**: Limited tokens available
- **Paid tier**: Pay per API call

For production use, expect minimal costs (~$6-7/month for daily generation).

---

## Troubleshooting

### "API Key missing" Error

**Solution:** Ensure `.env.local` has `VITE_REPLICATE_API_KEY=<your_key>`

### Images Not Generating (But Workflow Completes)

**Possible causes:**
1. Replicate API key is invalid or revoked
2. Replicate API is down
3. Rate limit exceeded

**Check logs** in BackOffice System panel. If you see errors but workflow completed, images are optional.

### Build Fails After Adding Key

**Solution:**
```bash
npm run build
```

If still failing, verify:
- `.env.local` syntax is correct
- No trailing whitespace on API key
- vite.config.ts has REPLICATE_API_KEY in define object

### Generated Images Don't Match Brand

**Solution:** Adjust prompt templates in `services/replicateService.ts`

Edit the `promptTemplates` object to refine styles:
```typescript
const promptTemplates: Record<string, string> = {
  'price-story': `[Edit this prompt to adjust style]`,
  ...
}
```

Then rebuild and re-run workflow.

---

## Updating the Supabase Database

After implementing ImageGeneratorAgent code, you need to add the agent to Supabase:

### Option 1: Using Seeds (Recommended)

The `supabase_seeds.sql` file has been pre-updated with:
- ImageGeneratorAgent definition
- Updated workflow pipeline

Just run:
```bash
# If using Supabase CLI
supabase db push
```

### Option 2: Manual Database Update

If you prefer manual SQL:

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:

```sql
INSERT INTO public.agents (id, name, role, instructions, is_active, model)
VALUES (
  'agent-image',
  'ImageGeneratorAgent',
  'image',
  'Generate editorial illustrations for Bitcoin articles in FT Weekend style...',
  true,
  'replicate/flux'
) ON CONFLICT (id) DO UPDATE
SET is_active = true;

UPDATE public.workflows
SET steps = '["agent-research", "agent-planner", "agent-writer", "agent-image", "agent-reviewer"]'::jsonb
WHERE id = 'wf-v2-pipeline';
```

---

## Advanced: Customizing Image Prompts

Each article category has its own prompt template. To customize:

1. Open `services/replicateService.ts`
2. Find the `promptTemplates` object
3. Edit the prompt for your category
4. Rebuild: `npm run build`
5. Re-run workflow

Example customization:

```typescript
'price-story': `
  Editorial illustration for cryptocurrency market analysis.
  Show diverse traders monitoring Bitcoin price action.
  Style: Modern business magazine (The Economist style).
  Colors: Deep navy blue, gold accents, white space.
  NO: Charts, graphs, or technical indicators visible.
`
```

---

## Future Enhancements

Potential improvements for future versions:

- [ ] **Caching**: Avoid regenerating same prompts
- [ ] **Manual Override**: UI to regenerate or replace specific images
- [ ] **Batch Processing**: Parallel image generation for speed
- [ ] **Style Selection**: Dropdown to choose illustration style per article
- [ ] **A/B Testing**: Compare different image styles
- [ ] **Fallback Service**: Unsplash/Pexels integration as backup
- [ ] **Local Storage**: Download and store images instead of CDN links

---

## Technical Details

### Files Modified

| File | Purpose | Role |
|------|---------|------|
| `.env.local` | API key storage | Configuration |
| `vite.config.ts` | Inject API key | Build-time configuration |
| `services/replicateService.ts` | Image generation logic | Core service |
| `services/agentService.ts` | Agent handler | Workflow integration |
| `types.ts` | TypeScript types | Type definitions |
| `supabase_seeds.sql` | Database seeding | Schema setup |

### Architecture

```
Agent Pipeline:
┌─────────────────┐
│  WriterAgent    │ (outputs JSON with stories)
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ ImageGeneratorAgent     │
│ (Calls replicateService)│
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ replicateService             │
│ (Calls Replicate FLUX API)   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Replicate CDN                        │
│ (Returns image URLs)                 │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Updated JSON with image.urls     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────┐
│ ReviewerAgent    │ (polishes complete data)
└──────────────────┘
```

### API Response Flow

1. **Input**: Article headline + category
2. **Replicate Call**: POST to FLUX Pro model
3. **Processing**: ~10-30 seconds per image
4. **Output**: CDN-hosted image URL
5. **Storage**: URL saved to Supabase

### Data Structure

Stories with images:

```json
{
  "id": "price-story",
  "category": "PRICE STORY",
  "headline": "Bitcoin Dips 0.78%...",
  "content": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "image": "https://replicate.delivery/xxxx.jpg",
  "intrigueTake": "To me...",
  "seo": { ... }
}
```

---

## Support & Debugging

### Check Image Generation Status

In BackOffice:
1. Go to **System** tab
2. Look for `[ImageGenerator]` messages in logs
3. Should show:
   - Number of images generated
   - Success/failure count
   - Image URLs (first 50 chars)

### Test Individual Image Generation

```typescript
// In browser console (BackOffice)
import * as replicateService from './services/replicateService';

await replicateService.generateImage(
  'Bitcoin and global adoption',
  'world-story'
);
```

### Validate JSON Output

If ReviewerAgent receives images correctly, you should see:
```json
{
  "stories": [
    {
      "id": "price-story",
      "image": "https://replicate.delivery/..."
    },
    ...
  ]
}
```

---

## Summary

You now have a fully integrated image generation system that:

✅ Generates editorial illustrations automatically
✅ Maintains consistent brand aesthetic
✅ Handles failures gracefully
✅ Integrates seamlessly into the article pipeline
✅ Stores images in CDN for instant delivery
✅ Requires minimal setup (just an API key)

**Next steps:**
1. Add your Replicate API key to `.env.local`
2. Run `npm run build`
3. Test by running a workflow in BackOffice
4. Check System logs for `[ImageGenerator]` messages
5. View generated articles with embedded images

Happy image generation! 🎨
