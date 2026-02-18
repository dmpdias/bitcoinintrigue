
import { BriefingData, AgentDefinition, WorkflowDefinition, Subscriber, AnalyticsData, DistributionEvent } from '../types';
import { supabase, supabaseConfig } from './supabaseClient';

// Helper to map DB snake_case to CamelCase
const mapIssueFromDB = (i: any): BriefingData => ({
  id: i.id,
  issueNumber: i.issue_number,
  date: i.date,
  intro: i.intro,
  stories: i.stories,
  status: i.status,
  lastUpdated: i.last_updated
});

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
    const { error } = await supabase.from('issues').upsert({
      id: issue.id,
      issue_number: issue.issueNumber,
      date: issue.date,
      intro: issue.intro,
      stories: issue.stories,
      status: issue.status,
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
        isActive: w.is_active
    }));
  },
  
  saveWorkflow: async (workflow: WorkflowDefinition) => {
    const { error } = await supabase.from('workflows').upsert({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      steps: workflow.steps,
      is_active: workflow.isActive
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
  }
};
