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
import { schedulerService } from '../../services/schedulerService';
import { agentService } from '../../services/agentService';
import { storageService } from '../../services/storageService';

export const config = {
  maxDuration: 60,
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
    // Get all active schedules from storage
    const schedules = await storageService.getSchedules();
    const activeSchedules = schedules.filter(s => s.isActive);

    for (const schedule of activeSchedules) {
      try {
        const now = new Date();

        // Get next execution time using scheduler service
        const nextExecution = schedulerService.getNextExecutionTime(
          schedule.cronExpression,
          schedule.timezone
        );

        // Check if schedule is due (within 5 minute window)
        const timeDiff = Math.abs(nextExecution.getTime() - now.getTime());
        if (timeDiff > 5 * 60 * 1000) {
          // Not due yet
          continue;
        }

        processed++;

        // Get workflow definition to check requiresApproval flag
        const workflow = await storageService.getWorkflow(schedule.workflowId);
        if (!workflow) {
          failed++;
          errors.push(`Schedule ${schedule.id}: Workflow not found`);
          continue;
        }

        // Create execution record to track this run
        const executionRecord = {
          id: `exec-${Date.now()}`,
          scheduleId: schedule.id,
          status: 'in_progress' as const,
          startedAt: new Date().toISOString(),
          executionLogs: []
        };

        try {
          // Get all agents for this workflow
          const allAgents = await storageService.getAgents();
          const agentsMap = new Map(allAgents.map(a => [a.id, a]));

          // Run workflow with approval gate
          const result = await agentService.runWorkflow(
            schedule.workflowId,
            workflow.steps,
            agentsMap,
            workflow.requiresApproval ?? true  // Default to requiring approval
          );

          if (result.success && result.issue) {
            // Update execution record with success
            executionRecord.status = 'completed';
            executionRecord.executionLogs = result.executionLogs || [];

            // Save execution record
            await storageService.createExecutionRecord({
              ...executionRecord,
              issueId: result.issue.id,
              completedAt: new Date().toISOString()
            });

            succeeded++;
          } else {
            failed++;
            errors.push(`Schedule ${schedule.id}: Workflow execution failed`);
          }
        } catch (workflowErr: any) {
          // Update execution record with error
          await storageService.createExecutionRecord({
            ...executionRecord,
            status: 'failed',
            completedAt: new Date().toISOString(),
            errorMessage: workflowErr.message
          });

          failed++;
          errors.push(`Schedule ${schedule.id}: ${workflowErr.message}`);
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
