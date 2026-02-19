import { supabase } from './supabaseClient';

export interface ScheduleParams {
  workflowId: string;
  name: string;
  description?: string;
  cronExpression: string;
  timezone: string;
  isActive: boolean;
}

export interface Schedule extends ScheduleParams {
  id: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionRecord {
  id: string;
  scheduleId: string;
  issueId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  executionLogs?: Array<{agent: string; status: string; error?: string}>;
  createdAt: string;
}

/**
 * Scheduler Service
 * Handles cron-based workflow scheduling and execution tracking
 */

/**
 * Parse a cron expression and return next execution time
 * Uses cron-parser library (must be installed: npm install cron-parser)
 */
export const parseSchedule = async (
  cronExpr: string,
  timezone: string
): Promise<{isValid: boolean; error?: string}> => {
  try {
    // Dynamic import to avoid requiring the library at startup
    const cronstrue = await import('cronstrue');
    // Basic validation - cron format is "minute hour day month dayOfWeek"
    const parts = cronExpr.trim().split(/\s+/);
    if (parts.length !== 5) {
      return {isValid: false, error: 'Cron expression must have 5 parts (minute hour day month dayOfWeek)'};
    }
    return {isValid: true};
  } catch (err) {
    return {isValid: false, error: 'Invalid cron expression'};
  }
};

/**
 * Get next execution time for a schedule
 * Example: cronExpr = "0 6 * * *" (6 AM daily)
 */
export const getNextExecutionTime = (
  cronExpr: string,
  timezone: string
): {time: Date; error?: string} | null => {
  try {
    // Dynamic import
    const CronParser = require('cron-parser');
    const interval = CronParser.parseExpression(cronExpr, {tz: timezone});
    const nextTime = interval.next().toDate();
    return {time: nextTime};
  } catch (err: any) {
    console.error('Cron parse error:', err);
    return {time: new Date(), error: err.message};
  }
};

/**
 * List all schedules
 */
export const listSchedules = async (): Promise<Schedule[]> => {
  const {data, error} = await supabase
    .from('schedules')
    .select('*')
    .order('created_at', {ascending: false});

  if (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }

  return (data || []).map(mapScheduleFromDb);
};

/**
 * Get a specific schedule
 */
export const getSchedule = async (id: string): Promise<Schedule | null> => {
  const {data, error} = await supabase
    .from('schedules')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return mapScheduleFromDb(data);
};

/**
 * Create a new schedule
 */
export const createSchedule = async (params: ScheduleParams, userId?: string): Promise<Schedule> => {
  // Validate cron expression first
  const validation = await parseSchedule(params.cronExpression, params.timezone);
  if (!validation.isValid) {
    throw new Error(`Invalid cron expression: ${validation.error}`);
  }

  const {data, error} = await supabase
    .from('schedules')
    .insert([
      {
        workflow_id: params.workflowId,
        name: params.name,
        description: params.description,
        cron_expression: params.cronExpression,
        timezone: params.timezone,
        is_active: params.isActive,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return mapScheduleFromDb(data);
};

/**
 * Update an existing schedule
 */
export const updateSchedule = async (
  id: string,
  params: Partial<ScheduleParams>
): Promise<Schedule> => {
  // Validate cron if provided
  if (params.cronExpression) {
    const validation = await parseSchedule(params.cronExpression, params.timezone || 'UTC');
    if (!validation.isValid) {
      throw new Error(`Invalid cron expression: ${validation.error}`);
    }
  }

  const updates: any = {
    updated_at: new Date().toISOString(),
  };

  if (params.name !== undefined) updates.name = params.name;
  if (params.description !== undefined) updates.description = params.description;
  if (params.workflowId !== undefined) updates.workflow_id = params.workflowId;
  if (params.cronExpression !== undefined) updates.cron_expression = params.cronExpression;
  if (params.timezone !== undefined) updates.timezone = params.timezone;
  if (params.isActive !== undefined) updates.is_active = params.isActive;

  const {data, error} = await supabase
    .from('schedules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapScheduleFromDb(data);
};

/**
 * Delete a schedule (cascades to distributions, execution history)
 */
export const deleteSchedule = async (id: string): Promise<void> => {
  const {error} = await supabase
    .from('schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Enable a schedule
 */
export const enableSchedule = async (id: string): Promise<Schedule> => {
  return updateSchedule(id, {isActive: true});
};

/**
 * Disable a schedule
 */
export const disableSchedule = async (id: string): Promise<Schedule> => {
  return updateSchedule(id, {isActive: false});
};

/**
 * Get execution history for a schedule
 */
export const getScheduleExecutionHistory = async (
  scheduleId: string,
  limit: number = 50
): Promise<ExecutionRecord[]> => {
  const {data, error} = await supabase
    .from('execution_history')
    .select('*')
    .eq('schedule_id', scheduleId)
    .order('created_at', {ascending: false})
    .limit(limit);

  if (error) {
    console.error('Error fetching execution history:', error);
    throw error;
  }

  return (data || []).map(mapExecutionRecordFromDb);
};

/**
 * Get all active schedules (used by cron handler)
 */
export const getActiveSchedules = async (): Promise<Schedule[]> => {
  const {data, error} = await supabase
    .from('schedules')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;
  return (data || []).map(mapScheduleFromDb);
};

/**
 * Create an execution history record (start)
 */
export const createExecutionRecord = async (
  scheduleId: string,
  issueId?: string
): Promise<ExecutionRecord> => {
  const {data, error} = await supabase
    .from('execution_history')
    .insert([
      {
        schedule_id: scheduleId,
        issue_id: issueId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        execution_logs: [],
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return mapExecutionRecordFromDb(data);
};

/**
 * Update execution history record (complete)
 */
export const updateExecutionRecord = async (
  id: string,
  updates: {
    status: 'completed' | 'failed';
    issueId?: string;
    errorMessage?: string;
    executionLogs?: any[];
  }
): Promise<ExecutionRecord> => {
  const {data, error} = await supabase
    .from('execution_history')
    .update({
      status: updates.status,
      issue_id: updates.issueId,
      error_message: updates.errorMessage,
      execution_logs: updates.executionLogs,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapExecutionRecordFromDb(data);
};

/**
 * Append log entry to execution history
 */
export const appendExecutionLog = async (
  executionId: string,
  agent: string,
  status: string,
  error?: string
): Promise<void> => {
  const {data, error: fetchError} = await supabase
    .from('execution_history')
    .select('execution_logs')
    .eq('id', executionId)
    .single();

  if (fetchError) throw fetchError;

  const logs = data?.execution_logs || [];
  logs.push({agent, status, error});

  const {error: updateError} = await supabase
    .from('execution_history')
    .update({execution_logs: logs})
    .eq('id', executionId);

  if (updateError) throw updateError;
};

// ============================================================================
// HELPERS
// ============================================================================

function mapScheduleFromDb(dbRecord: any): Schedule {
  return {
    id: dbRecord.id,
    name: dbRecord.name,
    description: dbRecord.description,
    workflowId: dbRecord.workflow_id,
    cronExpression: dbRecord.cron_expression,
    timezone: dbRecord.timezone,
    isActive: dbRecord.is_active,
    createdBy: dbRecord.created_by,
    createdAt: dbRecord.created_at,
    updatedAt: dbRecord.updated_at,
  };
}

function mapExecutionRecordFromDb(dbRecord: any): ExecutionRecord {
  return {
    id: dbRecord.id,
    scheduleId: dbRecord.schedule_id,
    issueId: dbRecord.issue_id,
    status: dbRecord.status,
    startedAt: dbRecord.started_at,
    completedAt: dbRecord.completed_at,
    errorMessage: dbRecord.error_message,
    executionLogs: dbRecord.execution_logs,
    createdAt: dbRecord.created_at,
  };
}
