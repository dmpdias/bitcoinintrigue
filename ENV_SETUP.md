# Environment Variables Setup Guide

## Local Development

### 1. Update `.env.local`

1. Open `.env.local` in your project root
2. Replace `your_gemini_api_key_here` with your actual Gemini API key:

```env
VITE_GEMINI_API_KEY=AIzaSy...your_actual_key...
```

3. Save the file

### 2. Security Note

- `.env.local` is automatically ignored by Git (protected by `.gitignore`)
- **Never commit this file** to version control
- **Never share your API key** publicly
- If you accidentally expose your key, revoke it immediately in Google Cloud Console

### 3. Using the API Key in Components

To access the API key in your React components, use:

```typescript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Example usage in a component
const callGeminiAPI = async (prompt: string) => {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    }),
    params: {
      key: apiKey
    }
  });

  return response.json();
};
```

### 4. Production Deployment (Vercel)

1. Go to your **Vercel Dashboard**
2. Select your **Bitcoin Intrigue project**
3. Navigate to **Settings → Environment Variables**
4. Add a new environment variable:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: Your Gemini API key
   - **Environments**: Select all (Development, Preview, Production)
5. Click **Save**
6. Redeploy your project for changes to take effect

### 5. Verify Setup

After updating `.env.local`, you can verify it's working:

```bash
# In your project root, run:
npm run dev

# Check browser console for any API-related errors
# Your API key should be available via import.meta.env.VITE_GEMINI_API_KEY
```

### 6. Available Gemini Models

- `gemini-pro` - Text-only generation
- `gemini-pro-vision` - Text and image understanding
- `gemini-1.5-flash` - Fast, efficient model
- `gemini-1.5-pro` - Advanced reasoning and coding

### 7. Troubleshooting

**Error: `VITE_GEMINI_API_KEY is undefined`**
- Make sure `.env.local` file exists
- Verify the key name is exactly `VITE_GEMINI_API_KEY`
- Restart your dev server after updating the file

**Error: `403 Forbidden` from API**
- Check that your API key is correct and not expired
- Verify the API is enabled in your Google Cloud project
- Ensure you have remaining quota in your API plan

**Error: `CORS error`**
- Gemini API requires requests from authenticated sources
- Make API calls from your backend/server, not directly from browser
- Or use a backend proxy route

---

For more information, visit:
- [Google Gemini API Docs](https://ai.google.dev/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
