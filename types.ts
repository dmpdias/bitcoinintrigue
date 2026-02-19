
export interface SEOData {
  title: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  urlSlug: string;
  imageAltText: string;
}

export interface Story {
  id: string;
  category: string;
  headline: string;
  content: string[];
  image?: string;
  highlight?: boolean;
  intrigueTake?: string;
  seo?: SEOData;
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
  approvalStatus?: 'pending_review' | 'approved' | 'rejected';
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  scheduledFor?: string;
}

export interface AgentLog {
  agent: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type AgentRole = 'scout' | 'journalist' | 'reviewer' | 'social' | 'researcher' | 'planner' | 'writer' | 'seo' | 'image' | 'content_review' | 'x_posting';

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
  requiresApproval?: boolean;
  approvalMessage?: string;
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
  clickRate: 12.4;
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
  scheduledTime?: string;
  authorAgentId?: string;
}

export interface Schedule {
  id: string;
  name: string;
  description?: string;
  workflowId: string;
  cronExpression: string;
  timezone: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface XPostingScheduleEntry {
  id: string;
  distributionId?: string;
  issueId: string;
  storyIndex: number;
  postText: string;
  scheduledTime: string;
  postedTime?: string;
  postUrl?: string;
  status: 'scheduled' | 'posted' | 'failed';
  errorMessage?: string;
  createdAt: string;
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
