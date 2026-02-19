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
import { storageService } from '../../services/storageService';
import { xService } from '../../services/xService';

export const config = {
  maxDuration: 30,
};

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
    // Get all posts due to be posted (scheduled_time <= now, status='scheduled')
    const duePostings = await storageService.getXPostingScheduleEntriesDue();

    if (duePostings.length === 0) {
      return NextResponse.json({
        success: true,
        posted: 0,
        failed: 0,
        skipped: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Get author credentials (Bitcoin Intrigue agent)
    const authorId = 'agent-bitcoinintrigue';
    const author = await storageService.getAuthorAgent(authorId);

    if (!author || !author.xCredentials?.bearerToken) {
      return NextResponse.json({
        success: false,
        error: 'X API credentials not configured for author agent',
        posted: 0,
        failed: 0,
        skipped: duePostings.length,
        timestamp: new Date().toISOString(),
      });
    }

    for (const posting of duePostings) {
      try {
        // Post tweet to X API
        try {
          const result = await xService.postTweet(posting.postText, author.xCredentials.bearerToken);

          if (result && result.id && result.url) {
            // Update posting record with success
            await storageService.updateXPostingScheduleEntry(posting.id, {
              postedTime: new Date().toISOString(),
              postUrl: result.url,
              status: 'posted',
            });

            posted++;
          } else {
            // Unexpected response format
            errors.push(`Posting ${posting.id}: Invalid X API response`);
            await storageService.updateXPostingScheduleEntry(posting.id, {
              status: 'failed',
              errorMessage: 'Invalid X API response',
            });
            failed++;
          }
        } catch (postError: any) {
          // Handle specific error cases
          if (postError.message.includes('429') || postError.message.includes('Rate limited')) {
            // Rate limited - stop processing and resume next cycle
            console.warn('Rate limited by X API - resuming next cycle');
            break;
          }

          if (postError.message.includes('401') || postError.message.includes('Unauthorized')) {
            // Credentials invalid - mark all as failed and stop
            errors.push(`X API authentication failed: ${postError.message}`);
            await storageService.updateXPostingScheduleEntry(posting.id, {
              status: 'failed',
              errorMessage: 'Invalid X API credentials',
            });
            failed++;
            break;
          } else {
            // Other errors - mark as failed but continue
            errors.push(`Posting ${posting.id}: ${postError.message}`);
            await storageService.updateXPostingScheduleEntry(posting.id, {
              status: 'failed',
              errorMessage: postError.message,
            });
            failed++;
          }
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
