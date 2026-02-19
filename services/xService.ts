/**
 * X/Twitter API Service
 * Handles posting tweets to X (Twitter) API v2
 *
 * NOTE: This service is called ONLY by cron handlers, not by agents
 * Agents (x_posting agent) generate tweet JSON with scheduled times
 * This service executes the actual posting at scheduled times
 */

export interface XCredentials {
  bearerToken: string;
  apiKey?: string;
  apiSecret?: string;
  refreshToken?: string;
}

export interface PostTweetRequest {
  text: string;
  mediaIds?: string[];
  replyTo?: string;
}

export interface PostTweetResponse {
  id: string;
  text: string;
  url: string;
}

const X_API_BASE = 'https://api.twitter.com/2';
const X_API_TWEET_ENDPOINT = `${X_API_BASE}/tweets`;

/**
 * Initialize X API client with credentials
 * Validates that credentials are properly formatted
 */
export const initializeXClient = (credentials: XCredentials): {valid: boolean; error?: string} => {
  if (!credentials.bearerToken) {
    return {valid: false, error: 'Bearer token is required'};
  }

  if (!credentials.bearerToken.startsWith('Bearer ') && !credentials.bearerToken.match(/^[a-zA-Z0-9\-_]+$/)) {
    return {valid: false, error: 'Invalid bearer token format'};
  }

  return {valid: true};
};

/**
 * Post a single tweet to X
 * @param text - Tweet content (max 280 characters)
 * @param bearerToken - X API Bearer token for authentication
 * @returns Posted tweet details or throws error
 */
export const postTweet = async (
  text: string,
  bearerToken: string
): Promise<PostTweetResponse> => {
  // Validate tweet length
  if (text.length > 280) {
    throw new Error(`Tweet exceeds 280 characters (${text.length} chars)`);
  }

  if (text.length === 0) {
    throw new Error('Tweet cannot be empty');
  }

  // Format bearer token if needed
  const token = bearerToken.startsWith('Bearer ') ? bearerToken : `Bearer ${bearerToken}`;

  try {
    const response = await fetch(X_API_TWEET_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    // Handle rate limiting
    if (response.status === 429) {
      const resetTime = response.headers.get('x-rate-limit-reset');
      throw new Error(`Rate limited. Reset at: ${resetTime}`);
    }

    // Handle auth errors
    if (response.status === 401) {
      throw new Error('Invalid X API credentials (401 Unauthorized)');
    }

    if (response.status === 403) {
      throw new Error('Access forbidden (403). Check API permissions');
    }

    // Handle server errors
    if (response.status >= 500) {
      throw new Error(`X API server error (${response.status})`);
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = errorData?.errors?.[0]?.message || errorData?.detail || 'Unknown error';
      throw new Error(`X API error (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();

    // Extract tweet ID and construct URL
    const tweetId = data.data?.id;
    if (!tweetId) {
      throw new Error('No tweet ID in response');
    }

    // Construct tweet URL (assuming @bitcoinintrigue account)
    // This can be customized based on actual account handle
    const tweetUrl = `https://twitter.com/i/web/status/${tweetId}`;

    return {
      id: tweetId,
      text: text,
      url: tweetUrl,
    };
  } catch (err: any) {
    // Re-throw with context
    console.error('Error posting tweet:', {
      error: err.message,
      text: text.substring(0, 50) + '...',
    });
    throw err;
  }
};

/**
 * Batch post tweets (for future use)
 * Posts multiple tweets with optional delays between them
 */
export const batchPostTweets = async (
  tweets: Array<{text: string; delayMs?: number}>,
  bearerToken: string
): Promise<PostTweetResponse[]> => {
  const results: PostTweetResponse[] = [];

  for (let i = 0; i < tweets.length; i++) {
    const tweet = tweets[i];

    // Apply delay between tweets if specified
    if (tweet.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, tweet.delayMs));
    }

    try {
      const result = await postTweet(tweet.text, bearerToken);
      results.push(result);
    } catch (err: any) {
      // Log error but continue with next tweet
      console.error(`Failed to post tweet ${i + 1}:`, err.message);
      // Could optionally break on rate limits
      if (err.message.includes('Rate limited')) {
        throw err; // Re-throw rate limit errors
      }
    }
  }

  return results;
};

/**
 * Verify X API credentials are valid
 * Makes a minimal request to check auth
 */
export const verifyCredentials = async (bearerToken: string): Promise<{valid: boolean; error?: string}> => {
  try {
    const token = bearerToken.startsWith('Bearer ') ? bearerToken : `Bearer ${bearerToken}`;

    const response = await fetch(`${X_API_BASE}/tweets/search/recent?max_results=10&query=bitcoin`, {
      headers: {
        'Authorization': token,
      },
    });

    if (response.status === 401) {
      return {valid: false, error: 'Unauthorized - Invalid credentials'};
    }

    if (response.status === 403) {
      return {valid: false, error: 'Forbidden - Check API permissions'};
    }

    if (!response.ok) {
      return {valid: false, error: `API error: ${response.statusText}`};
    }

    return {valid: true};
  } catch (err: any) {
    return {valid: false, error: err.message};
  }
};

/**
 * Get engagement metrics for a posted tweet
 * Returns likes, retweets, replies, impressions (for future analytics)
 */
export const getTweetMetrics = async (
  tweetId: string,
  bearerToken: string
): Promise<{likes: number; retweets: number; replies: number}> => {
  try {
    const token = bearerToken.startsWith('Bearer ') ? bearerToken : `Bearer ${bearerToken}`;

    const response = await fetch(
      `${X_API_BASE}/tweets/${tweetId}?tweet.fields=public_metrics`,
      {
        headers: {
          'Authorization': token,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }

    const data = await response.json();
    const metrics = data.data?.public_metrics || {};

    return {
      likes: metrics.like_count || 0,
      retweets: metrics.retweet_count || 0,
      replies: metrics.reply_count || 0,
    };
  } catch (err: any) {
    console.error('Error fetching tweet metrics:', err.message);
    return {likes: 0, retweets: 0, replies: 0};
  }
};
