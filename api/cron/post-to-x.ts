/**
 * Vercel Cron Handler: Post Scheduled Tweets to X
 *
 * This function posts tweets that are queued in x_posting_schedule table.
 * It runs frequently (every minute) to check for posts due to be posted.
 *
 * Vercel Configuration (in vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/post-to-x",
 *     "schedule": "* * * * *"  // Every minute
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';

export const config = {
  maxDuration: 30,
};

// Mock implementations for demo (replace with actual service imports)
const mockStorageService = {
  getXPostingScheduleEntriesDue: async () => [],
  updateXPostingScheduleEntry: async () => {},
  trackDistribution: async () => {},
};

const mockXService = {
  postTweet: async (text: string, token: string) => ({
    id: 'tweet-123',
    url: 'https://twitter.com/i/web/status/123',
    text,
  }),
};

// Mock author agents (replace with actual DB query)
const getAuthorCredentials = async (authorId: string) => ({
  bearerToken: process.env.X_BEARER_TOKEN,
});

export default async function handler(req: NextRequest) {
  // Verify this is called by Vercel cron
  if (req.headers.get('x-vercel-cron-secret') !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  let posted = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    // Get all due posts
    // NOTE: In production, import and use actual storageService
    const duePostings = await mockStorageService.getXPostingScheduleEntriesDue();

    if (duePostings.length === 0) {
      return NextResponse.json({
        success: true,
        posted: 0,
        failed: 0,
        skipped: 0,
        timestamp: new Date().toISOString(),
      });
    }

    for (const posting of duePostings) {
      try {
        // Get X credentials from author_agents table
        // TODO: In production, fetch from DB based on posting distribution config
        const authorId = 'agent-bitcoinintrigue';
        const credentials = await getAuthorCredentials(authorId);

        if (!credentials || !credentials.bearerToken) {
          errors.push(`Posting ${posting.id}: X credentials not found`);
          skipped++;
          continue;
        }

        // Post tweet to X
        try {
          // NOTE: In production, use actual xService.postTweet
          const result = await mockXService.postTweet(posting.postText, credentials.bearerToken);

          // Update posting record with success
          await mockStorageService.updateXPostingScheduleEntry(posting.id, {
            postedTime: new Date().toISOString(),
            postUrl: result.url,
            status: 'posted',
          });

          // Track distribution event
          await mockStorageService.trackDistribution({
            id: `dist-${posting.id}`,
            issueId: posting.issueId,
            channel: 'x',
            timestamp: new Date().toISOString(),
            status: 'sent',
            scheduledTime: posting.scheduledTime,
            authorAgentId: authorId,
          });

          posted++;
        } catch (postError: any) {
          // Handle specific error cases
          if (postError.message.includes('Rate limited')) {
            // Stop processing on rate limit - resume next cycle
            console.warn('Rate limited by X API - resuming next cycle');
            break;
          }

          if (postError.message.includes('401') || postError.message.includes('Unauthorized')) {
            // Credentials invalid - skip this posting
            errors.push(`Posting ${posting.id}: Invalid credentials`);
            await mockStorageService.updateXPostingScheduleEntry(posting.id, {
              status: 'failed',
              errorMessage: 'Invalid X API credentials',
            });
          } else {
            // Other errors - mark as failed but continue
            errors.push(`Posting ${posting.id}: ${postError.message}`);
            await mockStorageService.updateXPostingScheduleEntry(posting.id, {
              status: 'failed',
              errorMessage: postError.message,
            });
          }

          failed++;
        }
      } catch (err: any) {
        failed++;
        errors.push(`Error processing posting ${posting.id}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      posted,
      failed,
      skipped,
      totalProcessed: posted + failed,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('X posting cron handler error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    }, {status: 500});
  }
}
