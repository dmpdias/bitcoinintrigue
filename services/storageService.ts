
import { BriefingData, AgentDefinition, WorkflowDefinition, Subscriber, AnalyticsData, DistributionEvent } from '../types';
import { BRIEFING_CONTENT } from '../constants';
import { supabase, supabaseConfig } from './supabaseClient';

const ISSUES_KEY = 'bitcoin_intrigue_issues';
const AGENTS_KEY = 'bitcoin_intrigue_agents';
const WORKFLOWS_KEY = 'bitcoin_intrigue_workflows';
const SUBSCRIBERS_KEY = 'bitcoin_intrigue_subscribers';
const DISTRIBUTION_KEY = 'bitcoin_intrigue_distribution';

const DEFAULT_AGENTS: AgentDefinition[] = [
  {
    id: 'agent-scout',
    name: 'The Scout',
    role: 'scout',
    model: 'gemini-3-pro-preview',
    isActive: true,
    instructions: "Find today's Bitcoin price in USD and EUR, 24h % change. Also find the top 3 global news stories about Bitcoin, any major whale movements or ETF inflows, and a common Bitcoin technical concept for beginners to learn today."
  },
  {
    id: 'agent-journalist',
    name: 'The Journalist',
    role: 'journalist',
    model: 'gemini-3-flash-preview',
    isActive: true,
    instructions: "You are a professional financial journalist. Draft a newsletter issue based on the provided data. Structure it with an Intro, Price Story, Global Drama, and Whale Watch. Output valid JSON matching the BriefingData structure."
  },
  {
    id: 'agent-uncle',
    name: 'The Friendly Uncle',
    role: 'reviewer',
    model: 'gemini-3-flash-preview',
    isActive: true,
    instructions: "You are the 'Friendly Bitcoin Uncle'. Review the text. Simplify jargon by defining terms in parentheses. Ensure the tone is warm and non-technical. Do not change the JSON structure."
  },
  {
    id: 'agent-social',
    name: 'The X Threader',
    role: 'social',
    model: 'gemini-3-flash-preview',
    isActive: true,
    instructions: "Take the newsletter briefing and turn it into a high-engagement 5-7 post X (Twitter) thread. Use emojis, bold hooks, and end with a call to subscribe."
  }
];

const DEFAULT_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf-daily',
    name: 'Full Pipeline',
    description: 'Scout data, Draft JSON, Review tone, and Prepare X Thread.',
    steps: ['agent-scout', 'agent-journalist', 'agent-uncle', 'agent-social'],
    isActive: true
  }
];

export const storageService = {
  initialize: async () => {
    // Initial local setup
    if (!localStorage.getItem(ISSUES_KEY)) localStorage.setItem(ISSUES_KEY, JSON.stringify([BRIEFING_CONTENT]));
    if (!localStorage.getItem(AGENTS_KEY)) localStorage.setItem(AGENTS_KEY, JSON.stringify(DEFAULT_AGENTS));
    if (!localStorage.getItem(WORKFLOWS_KEY)) localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(DEFAULT_WORKFLOWS));
    if (!localStorage.getItem(SUBSCRIBERS_KEY)) localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify([]));

    // Phase 1: Cloud Sync (Pull latest from DB)
    if (supabaseConfig.isConnected) {
      try {
        const { data: issues } = await supabase.from('issues').select('*');
        if (issues && issues.length > 0) localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));

        const { data: agents } = await supabase.from('agents').select('*');
        if (agents && agents.length > 0) localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));

        const { data: workflows } = await supabase.from('workflows').select('*');
        if (workflows && workflows.length > 0) localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));

        const { data: subs } = await supabase.from('subscribers').select('*');
        if (subs && subs.length > 0) localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subs));
        
        console.log("🚀 Storage Service: Live Cloud Sync Complete.");
      } catch (e) {
        console.error("Cloud Sync Error:", e);
      }
    }
  },

  // Issues
  getAllIssues: (): BriefingData[] => JSON.parse(localStorage.getItem(ISSUES_KEY) || '[]'),
  getPublishedIssue: (): BriefingData | null => {
    const issues = storageService.getAllIssues();
    return issues.find(i => i.status === 'published') || issues[0] || null;
  },
  saveIssue: async (issue: BriefingData) => {
    const issues = storageService.getAllIssues();
    const idx = issues.findIndex(i => i.id === issue.id);
    const updatedIssue = { ...issue, lastUpdated: new Date().toISOString() };
    
    if (idx >= 0) issues[idx] = updatedIssue;
    else issues.push(updatedIssue);
    
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));

    if (supabaseConfig.isConnected) {
      await supabase.from('issues').upsert({
        id: updatedIssue.id,
        issue_number: updatedIssue.issueNumber,
        date: updatedIssue.date,
        intro: updatedIssue.intro,
        stories: updatedIssue.stories,
        status: updatedIssue.status,
        last_updated: updatedIssue.lastUpdated
      });
    }
  },
  deleteIssue: async (id: string) => {
    localStorage.setItem(ISSUES_KEY, JSON.stringify(storageService.getAllIssues().filter(i => i.id !== id)));
    if (supabaseConfig.isConnected) {
      await supabase.from('issues').delete().eq('id', id);
    }
  },

  // Agents
  getAgents: (): AgentDefinition[] => JSON.parse(localStorage.getItem(AGENTS_KEY) || '[]'),
  saveAgent: async (agent: AgentDefinition) => {
    const agents = storageService.getAgents();
    const idx = agents.findIndex(a => a.id === agent.id);
    if (idx >= 0) agents[idx] = agent;
    else agents.push(agent);
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));

    if (supabaseConfig.isConnected) {
      await supabase.from('agents').upsert({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        instructions: agent.instructions,
        is_active: agent.isActive,
        model: agent.model
      });
    }
  },

  // Workflows
  getWorkflows: (): WorkflowDefinition[] => JSON.parse(localStorage.getItem(WORKFLOWS_KEY) || '[]'),
  saveWorkflow: async (workflow: WorkflowDefinition) => {
    const workflows = storageService.getWorkflows();
    const idx = workflows.findIndex(w => w.id === workflow.id);
    if (idx >= 0) workflows[idx] = workflow;
    else workflows.push(workflow);
    localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));

    if (supabaseConfig.isConnected) {
      await supabase.from('workflows').upsert({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        steps: workflow.steps,
        is_active: workflow.isActive
      });
    }
  },

  // Subscribers
  getSubscribers: (): Subscriber[] => JSON.parse(localStorage.getItem(SUBSCRIBERS_KEY) || '[]'),
  saveSubscriber: async (sub: Subscriber) => {
    const subs = storageService.getSubscribers();
    const idx = subs.findIndex(s => s.id === sub.id);
    if (idx >= 0) subs[idx] = sub;
    else subs.push(sub);
    localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subs));

    if (supabaseConfig.isConnected) {
      await supabase.from('subscribers').upsert({
        email: sub.email,
        status: sub.status,
        source: sub.source
      });
    }
  },
  deleteSubscriber: async (id: string) => {
    const sub = storageService.getSubscribers().find(s => s.id === id);
    localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(storageService.getSubscribers().filter(s => s.id !== id)));
    if (supabaseConfig.isConnected && sub) {
      await supabase.from('subscribers').delete().eq('email', sub.email);
    }
  },

  // Distribution
  getDistributions: (): DistributionEvent[] => JSON.parse(localStorage.getItem(DISTRIBUTION_KEY) || '[]'),
  trackDistribution: async (event: DistributionEvent) => {
    const events = storageService.getDistributions();
    events.push(event);
    localStorage.setItem(DISTRIBUTION_KEY, JSON.stringify(events));

    if (supabaseConfig.isConnected) {
      await supabase.from('distributions').insert({
        id: event.id,
        issue_id: event.issueId,
        channel: event.channel,
        status: event.status,
        reach: event.reach
      });
    }
  },

  // Analytics
  getAnalytics: (): AnalyticsData => {
    const subs = storageService.getSubscribers();
    const activeSubs = subs.filter(s => s.status === 'active').length;
    return {
      totalSubscribers: activeSubs,
      openRate: 48.2,
      clickRate: 12.4,
      webViews: 12450,
      dailyGrowth: [4, 12, 8, 15, 22, 19, 31]
    };
  }
};
