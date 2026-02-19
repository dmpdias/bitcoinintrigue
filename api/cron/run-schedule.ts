/**
 * Vercel Cron Handler: Run Scheduled Workflows
 *
 * This function executes workflows that are scheduled via cron expressions.
 * It checks all active schedules and executes those whose cron time matches current time.
 *
 * Vercel Configuration (in vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/run-schedule",
 *     "schedule": "*/5 * * * *"  // Every 5 minutes
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';

export const config = {
  maxDuration: 60,
};

// Mock implementations for demo (replace with actual service imports)
const mockSchedulerService = {
  getActiveSchedules: async () => [],
  getNextExecutionTime: () => ({time: new Date()}),
  createExecutionRecord: async () => 'exec-123',
  updateExecutionRecord: async () => {},
  appendExecutionLog: async () => {},
};

const mockAgentService = {
  runWorkflow: async () => ({success: true, issue: {id: 'issue-123'}}),
};

const mockStorageService = {
  getSchedule: async () => null,
  createExecutionRecord: async () => 'exec-123',
  updateExecutionRecord: async () => {},
};

export default async function handler(req: NextRequest) {
  // Verify this is called by Vercel cron (in production, use X-Vercel-Cron header)
  if (req.headers.get('x-vercel-cron-secret') !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    // Get all active schedules
    // NOTE: In production, import and use actual schedulerService
    const schedules = await mockSchedulerService.getActiveSchedules();

    for (const schedule of schedules) {
      try {
        const now = new Date();
        const next = mockSchedulerService.getNextExecutionTime(schedule.cronExpression, schedule.timezone);

        // Check if schedule is due (within 5 minute window)
        const timeDiff = Math.abs(next.time.getTime() - now.getTime());
        if (timeDiff > 5 * 60 * 1000) {
          // Not due yet
          continue;
        }

        processed++;

        // Create execution record
        const executionId = await mockStorageService.createExecutionRecord(schedule.id);

        try {
          // Get workflow and run it
          // NOTE: In production, import and use actual agentService
          const result = await mockAgentService.runWorkflow(schedule.workflowId);

          // Check if workflow requires approval
          // TODO: Implement approval gate logic here
          // If schedule.workflow.requiresApproval:
          //   - Save issue with approvalStatus='pending_review'
          //   - Return success
          // Else:
          //   - Continue to remaining agents (x_posting, etc.)
          //   - Save issue with approvalStatus='approved'

          // Update execution record with success
          await mockStorageService.updateExecutionRecord(executionId, {
            status: 'completed',
            issueId: result.issue?.id,
          });

          succeeded++;
        } catch (err: any) {
          // Update execution record with error
          await mockStorageService.updateExecutionRecord(executionId, {
            status: 'failed',
            errorMessage: err.message,
          });

          failed++;
          errors.push(`Schedule ${schedule.id}: ${err.message}`);
        }
      } catch (scheduleError: any) {
        failed++;
        errors.push(`Error processing schedule: ${scheduleError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      succeeded,
      failed,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Cron handler error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString(),
    }, {status: 500});
  }
}
