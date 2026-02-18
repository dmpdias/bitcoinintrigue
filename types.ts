
export interface Story {
  id: string;
  category: string;
  headline: string;
  content: string[];
  image?: string;
  highlight?: boolean;
  intrigueTake?: string;
}

export interface BriefingData {
  id: string;
  date: string;
  issueNumber: number;
  intro: {
    headline: string;
    content: string;
  };
  stories: Story[];
  status: 'draft' | 'review' | 'published';
  lastUpdated: string;
}

export interface AgentLog {
  agent: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type AgentRole = 'scout' | 'journalist' | 'reviewer' | 'social';

export interface AgentDefinition {
  id: string;
  name: string;
  role: AgentRole;
  instructions: string;
  isActive: boolean;
  model: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: string[]; // Array of Agent IDs
  isActive: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  joinedDate: string;
  status: 'active' | 'unsubscribed';
  source: string;
}

export interface AnalyticsData {
  totalSubscribers: number;
  openRate: number;
  clickRate: number;
  webViews: number;
  dailyGrowth: number[];
}

export interface DistributionEvent {
  id: string;
  issueId: string;
  channel: 'email' | 'x';
  timestamp: string;
  status: 'sent' | 'failed' | 'scheduled';
  reach?: number;
}
