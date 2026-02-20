
import { BriefingData, AgentDefinition, WorkflowDefinition, Subscriber, AnalyticsData, DistributionEvent } from '../types';
import { supabase, supabaseConfig } from './supabaseClient';

// Helper to map DB snake_case to CamelCase
const mapIssueFromDB = (i: any): BriefingData => {
  // ✅ Validate and fix missing fields
  const intro = i.intro || {};
  if (!intro.headline) {
    console.warn('[mapIssueFromDB] Issue missing headline:', i.id);
    intro.headline = 'Bitcoin Market Update';
  }
  if (!intro.content) {
    intro.content = '';
  }

  const stories = Array.isArray(i.stories) ? i.stories : [];

  return {
    id: i.id,
    issueNumber: i.issue_number,
    date: i.date,
    intro,
    stories,
    status: i.status,
    lastUpdated: i.last_updated,
    approvalStatus: i.approval_status,
    approvedAt: i.approved_at,
    approvedBy: i.approved_by,
    rejectionReason: i.rejection_reason,
    scheduledFor: i.scheduled_for
  };
};

export const storageService = {
  initialize: () => {
    // No-op for Supabase version
  },

  // --- ISSUES ---

  fetchPublishedIssue: async (): Promise<BriefingData | null> => {
    const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('status', 'published')
        .order('issue_number', { ascending: false })
        .limit(1)
        .single();
    
    if (error || !data) return null;
    return mapIssueFromDB(data);
  },

  getAllIssues: async (): Promise<BriefingData[]> => {
    const { data } = await supabase.from('issues').select('*').order('last_updated', { ascending: false });
    return (data || []).map(mapIssueFromDB);
  },
  
  saveIssue: async (issue: BriefingData) => {
    // ✅ Validate and fix issue structure before saving
    if (!issue.intro?.headline) {
      console.warn('[storageService] Issue missing headline, using default');
      issue.intro = {
        headline: issue.intro?.content?.split('\n')[0] || 'Bitcoin Market Update',
        content: issue.intro?.content || ''
      };
    }

    if (!Array.isArray(issue.stories)) {
      console.warn('[storageService] Issue has invalid stories array, resetting to empty');
      issue.stories = [];
    }

    const { error } = await supabase.from('issues').upsert({
      id: issue.id,
      issue_number: issue.issueNumber,
      date: issue.date,
      intro: issue.intro,
      stories: issue.stories,
      status: issue.status,
      approval_status: issue.approvalStatus || null,
      approved_at: issue.approvedAt || null,
      approved_by: issue.approvedBy || null,
      rejection_reason: issue.rejectionReason || null,
      last_updated: new Date().toISOString()
    });
    if (error) throw error;
  },

  deleteIssue: async (id: string) => {
    // 1. Delete related distributions first to satisfy Foreign Key constraints
    const { error: distError } = await supabase.from('distributions').delete().eq('issue_id', id);
    if (distError) {
        console.warn("Error cleaning up distributions:", distError);
    }

    // 2. Delete the issue
    const { error } = await supabase.from('issues').delete().eq('id', id);
    if (error) throw error;
  },

  // --- AGENTS ---

  getAgents: async (): Promise<AgentDefinition[]> => {
    const { data, error } = await supabase.from('agents').select('*').order('name');
    if (error) {
        console.error("Error fetching agents:", error);
        return [];
    }
    if (!data || data.length === 0) return [];
    return data.map((a: any) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      instructions: a.instructions,
      isActive: a.is_active,
      model: a.model
    }));
  },
  
  saveAgent: async (agent: AgentDefinition) => {
    const { error } = await supabase.from('agents').upsert({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      instructions: agent.instructions,
      is_active: agent.isActive,
      model: agent.model
    });
    if (error) throw error;
  },

  deleteAgent: async (id: string) => {
    const { error } = await supabase.from('agents').delete().eq('id', id);
    if (error) throw error;
  },

  // --- WORKFLOWS ---

  getWorkflows: async (): Promise<WorkflowDefinition[]> => {
    const { data, error } = await supabase.from('workflows').select('*');
    if (error) {
        console.error("Error fetching workflows:", error);
        return [];
    }
    if (!data) return [];
    return data.map((w: any) => ({
        id: w.id,
        name: w.name,
        description: w.description,
        steps: w.steps,
        isActive: w.is_active,
        requiresApproval: w.requires_approval ?? true,
        approvalMessage: w.approval_message
    }));
  },
  
  saveWorkflow: async (workflow: WorkflowDefinition) => {
    const { error } = await supabase.from('workflows').upsert({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      steps: workflow.steps,
      is_active: workflow.isActive,
      requires_approval: workflow.requiresApproval ?? true,
      approval_message: workflow.approvalMessage
    });
    if (error) throw error;
  },

  deleteWorkflow: async (id: string) => {
    const { error } = await supabase.from('workflows').delete().eq('id', id);
    if (error) throw error;
  },

  // --- SUBSCRIBERS ---

  getSubscribers: async (): Promise<Subscriber[]> => {
    const { data } = await supabase.from('subscribers').select('*').order('joined_date', { ascending: false });
    if (!data) return [];
    return data.map((s: any) => ({
        id: s.id,
        email: s.email,
        joinedDate: s.joined_date,
        status: s.status,
        source: s.source
    }));
  },
  
  saveSubscriber: async (sub: Omit<Subscriber, 'id' | 'joinedDate'> & { id?: string, joinedDate?: string }) => {
    // Generate UUID and Date client-side to ensure specific values are sent
    const newId = sub.id || crypto.randomUUID();
    const newDate = sub.joinedDate || new Date().toISOString();

    // STRICTLY USE INSERT. Do NOT use Upsert. Do NOT chain .select().
    // This prevents RLS "SELECT" policy violations for public users.
    const { error } = await supabase.from('subscribers').insert({
      id: newId,
      email: sub.email,
      status: sub.status,
      source: sub.source,
      joined_date: newDate
    });
    
    // Handle Errors
    if (error) {
       // '23505' is the Postgres error code for unique_violation (duplicate email)
       // We treat this as a success because the user effectively subscribed, even if they were already there.
       if (error.code === '23505') {
           return;
       }
       console.error("Supabase Insert Error:", error);
       throw error;
    }
  },
  
  deleteSubscriber: async (id: string) => {
    const { error } = await supabase.from('subscribers').delete().eq('id', id);
    if (error) throw error;
  },

  // --- DISTRIBUTION & ANALYTICS ---

  getDistributions: async (): Promise<DistributionEvent[]> => {
    const { data } = await supabase.from('distributions').select('*').order('timestamp', { ascending: false });
    if (!data) return [];
    return data.map((d: any) => ({
        id: d.id,
        issueId: d.issue_id,
        channel: d.channel,
        timestamp: d.timestamp,
        status: d.status,
        reach: d.reach
    }));
  },
  
  trackDistribution: async (event: DistributionEvent) => {
    const { error } = await supabase.from('distributions').insert({
      id: event.id,
      issue_id: event.issueId,
      channel: event.channel,
      status: event.status,
      reach: event.reach,
      timestamp: event.timestamp
    });
    if (error) throw error;
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    const { count } = await supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active');

    return {
      totalSubscribers: count || 0,
      openRate: 48.2,
      clickRate: 12.4,
      webViews: 12450,
      dailyGrowth: [4, 12, 8, 15, 22, 19, 31]
    };
  },

  // --- SCHEDULES (Automation & Scheduling System) ---

  getSchedules: async (): Promise<any[]> => {
    try {
      console.log('[storageService] getSchedules: Starting query...');
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('[storageService] getSchedules: Query complete');
      console.log('[storageService] getSchedules: data =', data);
      console.log('[storageService] getSchedules: error =', error);

      if (error) {
        console.error('[storageService] getSchedules: Supabase error:', error);
        throw error;
      }

      const schedules = (data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        workflowId: s.workflow_id,
        cronExpression: s.cron_expression,
        timezone: s.timezone,
        isActive: s.is_active,
        createdBy: s.created_by,
        createdAt: s.created_at,
        updatedAt: s.updated_at
      }));

      console.log('[storageService] getSchedules: Returning', schedules.length, 'schedules:', schedules);
      return schedules;
    } catch (err: any) {
      console.error('[storageService] getSchedules: Exception:', err);
      throw err;
    }
  },

  getSchedule: async (id: string): Promise<any | null> => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      workflowId: data.workflow_id,
      cronExpression: data.cron_expression,
      timezone: data.timezone,
      isActive: data.is_active,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  saveSchedule: async (schedule: any) => {
    const { error } = await supabase.from('schedules').upsert({
      id: schedule.id,
      name: schedule.name,
      description: schedule.description,
      workflow_id: schedule.workflowId,
      cron_expression: schedule.cronExpression,
      timezone: schedule.timezone,
      is_active: schedule.isActive,
      created_by: schedule.createdBy,
      created_at: schedule.createdAt,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;

    // Return the saved schedule in app format
    return {
      id: schedule.id,
      workflowId: schedule.workflowId,
      name: schedule.name,
      description: schedule.description,
      cronExpression: schedule.cronExpression,
      timezone: schedule.timezone,
      isActive: schedule.isActive,
      createdBy: schedule.createdBy,
      createdAt: schedule.createdAt
    };
  },

  deleteSchedule: async (id: string) => {
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) throw error;
  },

  // --- SCHEDULED DISTRIBUTIONS ---

  getScheduledDistributions: async (scheduleId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('scheduled_distributions')
      .select('*')
      .eq('schedule_id', scheduleId);

    if (error) {
      console.error('Error fetching scheduled distributions:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      scheduleId: d.schedule_id,
      channel: d.channel,
      recipientFilter: d.recipient_filter,
      postTemplate: d.post_template,
      isEnabled: d.is_enabled,
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }));
  },

  saveScheduledDistribution: async (distribution: any) => {
    const { error } = await supabase.from('scheduled_distributions').upsert({
      id: distribution.id,
      schedule_id: distribution.scheduleId,
      channel: distribution.channel,
      recipient_filter: distribution.recipientFilter,
      post_template: distribution.postTemplate,
      is_enabled: distribution.isEnabled,
      created_at: distribution.createdAt,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  },

  deleteScheduledDistribution: async (id: string) => {
    const { error } = await supabase.from('scheduled_distributions').delete().eq('id', id);
    if (error) throw error;
  },

  // --- X POSTING SCHEDULE ---

  getXPostingScheduleEntries: async (filters?: {status?: string; issueId?: string}): Promise<any[]> => {
    let query = supabase.from('x_posting_schedule').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.issueId) {
      query = query.eq('issue_id', filters.issueId);
    }

    const { data, error } = await query.order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Error fetching X posting schedule entries:', error);
      return [];
    }

    return (data || []).map((e: any) => ({
      id: e.id,
      distributionId: e.distribution_id,
      issueId: e.issue_id,
      storyIndex: e.story_index,
      postText: e.post_text,
      scheduledTime: e.scheduled_time,
      postedTime: e.posted_time,
      postUrl: e.post_url,
      status: e.status,
      errorMessage: e.error_message,
      createdAt: e.created_at
    }));
  },

  getXPostingScheduleEntriesDue: async (): Promise<any[]> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('x_posting_schedule')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_time', now)
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Error fetching due X posting entries:', error);
      return [];
    }

    return (data || []).map((e: any) => ({
      id: e.id,
      distributionId: e.distribution_id,
      issueId: e.issue_id,
      storyIndex: e.story_index,
      postText: e.post_text,
      scheduledTime: e.scheduled_time,
      postedTime: e.posted_time,
      postUrl: e.post_url,
      status: e.status,
      errorMessage: e.error_message,
      createdAt: e.created_at
    }));
  },

  saveXPostingScheduleEntry: async (entry: any) => {
    const { error } = await supabase.from('x_posting_schedule').insert({
      id: entry.id,
      distribution_id: entry.distributionId,
      issue_id: entry.issueId,
      story_index: entry.storyIndex,
      post_text: entry.postText,
      scheduled_time: entry.scheduledTime,
      status: entry.status || 'scheduled',
      created_at: new Date().toISOString()
    });
    if (error) throw error;
  },

  updateXPostingScheduleEntry: async (id: string, updates: any) => {
    const dbUpdates: any = {};
    if (updates.postedTime !== undefined) dbUpdates.posted_time = updates.postedTime;
    if (updates.postUrl !== undefined) dbUpdates.post_url = updates.postUrl;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.errorMessage !== undefined) dbUpdates.error_message = updates.errorMessage;

    const { error } = await supabase
      .from('x_posting_schedule')
      .update(dbUpdates)
      .eq('id', id);
    if (error) throw error;
  },

  // --- EXECUTION HISTORY ---

  getExecutionHistory: async (scheduleId: string, limit: number = 50): Promise<any[]> => {
    const { data, error } = await supabase
      .from('execution_history')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching execution history:', error);
      return [];
    }

    return (data || []).map((e: any) => ({
      id: e.id,
      scheduleId: e.schedule_id,
      issueId: e.issue_id,
      status: e.status,
      startedAt: e.started_at,
      completedAt: e.completed_at,
      errorMessage: e.error_message,
      executionLogs: e.execution_logs,
      createdAt: e.created_at
    }));
  },

  createExecutionRecord: async (scheduleId: string, issueId?: string): Promise<string> => {
    const { data, error } = await supabase
      .from('execution_history')
      .insert({
        schedule_id: scheduleId,
        issue_id: issueId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        execution_logs: [],
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  updateExecutionRecord: async (id: string, updates: any) => {
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.issueId !== undefined) dbUpdates.issue_id = updates.issueId;
    if (updates.errorMessage !== undefined) dbUpdates.error_message = updates.errorMessage;
    if (updates.executionLogs !== undefined) dbUpdates.execution_logs = updates.executionLogs;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;

    const { error } = await supabase
      .from('execution_history')
      .update(dbUpdates)
      .eq('id', id);
    if (error) throw error;
  },

  // --- AUTHOR AGENTS ---

  getAuthorAgent: async (agentId: string) => {
    const { data, error } = await supabase
      .from('author_agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      bio: data.bio,
      xHandle: data.x_handle,
      xCredentials: data.x_credentials,
      isActive: data.is_active,
      createdAt: data.created_at
    };
  },

  saveAuthorAgent: async (agent: any) => {
    const { data, error } = await supabase
      .from('author_agents')
      .upsert({
        id: agent.id,
        name: agent.name,
        bio: agent.bio || null,
        x_handle: agent.xHandle || null,
        x_credentials: agent.xCredentials || null,
        is_active: agent.isActive !== false,
        created_at: agent.createdAt || new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      bio: data.bio,
      xHandle: data.x_handle,
      xCredentials: data.x_credentials,
      isActive: data.is_active,
      createdAt: data.created_at
    };
  },

  // --- WORKFLOWS (Single) ---

  getWorkflow: async (workflowId: string) => {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      steps: data.steps,
      isActive: data.is_active,
      requiresApproval: data.requires_approval !== false,
      approvalMessage: data.approval_message
    } as WorkflowDefinition;
  }
};
