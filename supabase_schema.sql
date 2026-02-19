
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Issues Table
create table if not exists public.issues (
  id text primary key,
  issue_number int,
  date text,
  intro jsonb,
  stories jsonb,
  status text check (status in ('draft', 'review', 'published')),
  last_updated timestamptz default now()
);

-- 2. Agents Table
create table if not exists public.agents (
  id text primary key,
  name text,
  role text,
  instructions text,
  is_active boolean,
  model text
);

-- ENSURE COLUMNS EXIST (If table was created previously without them)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='agents' and column_name='model') then
    alter table public.agents add column model text;
  end if;
end $$;

-- 3. Workflows Table
create table if not exists public.workflows (
  id text primary key,
  name text,
  description text,
  steps jsonb, -- Array of agent IDs
  is_active boolean
);

-- ENSURE COLUMNS EXIST
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='workflows' and column_name='description') then
    alter table public.workflows add column description text;
  end if;
end $$;

-- 4. Subscribers Table
create table if not exists public.subscribers (
  id text primary key default uuid_generate_v4(),
  email text unique not null,
  joined_date timestamptz default now(),
  status text check (status in ('active', 'unsubscribed')),
  source text
);

-- 5. Distributions Table
create table if not exists public.distributions (
  id text primary key,
  issue_id text references public.issues(id),
  channel text,
  timestamp timestamptz default now(),
  status text,
  reach int
);

-- Enable RLS on all tables
alter table public.issues enable row level security;
alter table public.agents enable row level security;
alter table public.workflows enable row level security;
alter table public.subscribers enable row level security;
alter table public.distributions enable row level security;

-- GRANT PERMISSIONS (Critical for anon/public access)
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;

-- CLEANUP OLD POLICIES (To prevent conflicts)
drop policy if exists "Public issues are viewable by everyone" on public.issues;
drop policy if exists "Admins can do everything with issues" on public.issues;
drop policy if exists "Enable all access for issues" on public.issues;

drop policy if exists "Admins can do everything with agents" on public.agents;
drop policy if exists "Enable all access for agents" on public.agents;

drop policy if exists "Admins can do everything with workflows" on public.workflows;
drop policy if exists "Enable all access for workflows" on public.workflows;

drop policy if exists "Admins can view subscribers" on public.subscribers;
drop policy if exists "Public can subscribe" on public.subscribers;
drop policy if exists "Enable all access for subscribers" on public.subscribers;

drop policy if exists "Admins can view distributions" on public.distributions;
drop policy if exists "Enable all access for distributions" on public.distributions;

-- RE-CREATE PERMISSIVE POLICIES (Explicitly covers DELETE via 'for all')

-- Issues
create policy "Enable all access for issues" on public.issues
  for all using (true) with check (true);

-- Agents
create policy "Enable all access for agents" on public.agents
  for all using (true) with check (true);

-- Workflows
create policy "Enable all access for workflows" on public.workflows
  for all using (true) with check (true);

-- Subscribers
create policy "Enable all access for subscribers" on public.subscribers
  for all using (true) with check (true);

-- Distributions
create policy "Enable all access for distributions" on public.distributions
  for all using (true) with check (true);

-- ============================================================================
-- PHASE 1: AUTOMATION & SCHEDULING SYSTEM TABLES
-- ============================================================================

-- 6. Author Agents Table (Self-representing agents with X credentials)
create table if not exists public.author_agents (
  id text primary key,
  name text not null unique,
  bio text,
  x_handle text,
  x_credentials jsonb, -- {bearer_token, api_key, refresh_token}
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Insert default author agent
insert into public.author_agents (id, name, bio, x_handle)
values ('agent-bitcoinintrigue', 'Bitcoin Intrigue', 'Daily Bitcoin newsletter explaining crypto like you''re human', '@bitcoinintrigue')
on conflict (id) do nothing;

-- 7. Schedules Table (Cron-scheduled workflows)
create table if not exists public.schedules (
  id text primary key default gen_random_uuid()::text,
  workflow_id text not null references public.workflows(id) on delete cascade,
  name text not null,
  description text,
  cron_expression text not null,
  timezone text default 'UTC',
  is_active boolean default true,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_schedules_workflow on public.schedules(workflow_id);
create index if not exists idx_schedules_active on public.schedules(is_active);

-- 8. Scheduled Distributions Table (Distribution config per schedule)
create table if not exists public.scheduled_distributions (
  id text primary key default gen_random_uuid()::text,
  schedule_id text not null references public.schedules(id) on delete cascade,
  channel text not null check (channel in ('email', 'x', 'x_staggered')),
  recipient_filter jsonb,
  post_template jsonb,
  is_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_scheduled_distributions_schedule on public.scheduled_distributions(schedule_id);

-- 9. X Posting Schedule Table (Individual posts queued for staggered posting)
create table if not exists public.x_posting_schedule (
  id text primary key default gen_random_uuid()::text,
  distribution_id text references public.scheduled_distributions(id) on delete cascade,
  issue_id text not null references public.issues(id) on delete cascade,
  story_index int check (story_index >= 0 and story_index <= 4),
  post_text text not null,
  scheduled_time timestamptz not null,
  posted_time timestamptz,
  post_url text,
  status text check (status in ('scheduled', 'posted', 'failed')) default 'scheduled',
  error_message text,
  created_at timestamptz default now()
);

create index if not exists idx_x_posting_schedule_issue on public.x_posting_schedule(issue_id);
create index if not exists idx_x_posting_schedule_status_time on public.x_posting_schedule(status, scheduled_time);

-- 10. Execution History Table (Logs of scheduled workflow runs)
create table if not exists public.execution_history (
  id text primary key default gen_random_uuid()::text,
  schedule_id text not null references public.schedules(id) on delete cascade,
  issue_id text references public.issues(id) on delete set null,
  status text check (status in ('pending', 'in_progress', 'completed', 'failed')) default 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  execution_logs jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_execution_history_schedule on public.execution_history(schedule_id);
create index if not exists idx_execution_history_status on public.execution_history(status);

-- ============================================================================
-- TABLE MODIFICATIONS (Add new columns to existing tables)
-- ============================================================================

-- Update workflows table: Add approval configuration
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='workflows' and column_name='requires_approval') then
    alter table public.workflows add column requires_approval boolean default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='workflows' and column_name='approval_message') then
    alter table public.workflows add column approval_message text;
  end if;
end $$;

-- Update issues table: Add approval tracking
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='issues' and column_name='approval_status') then
    alter table public.issues add column approval_status text check (approval_status in ('pending_review', 'approved', 'rejected')) default 'pending_review';
  end if;
  if not exists (select 1 from information_schema.columns where table_name='issues' and column_name='approved_at') then
    alter table public.issues add column approved_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='issues' and column_name='approved_by') then
    alter table public.issues add column approved_by text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='issues' and column_name='rejection_reason') then
    alter table public.issues add column rejection_reason text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='issues' and column_name='scheduled_for') then
    alter table public.issues add column scheduled_for text;
  end if;
end $$;

-- Update distributions table: Add scheduling & author tracking
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='distributions' and column_name='scheduled_time') then
    alter table public.distributions add column scheduled_time timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='distributions' and column_name='author_agent_id') then
    alter table public.distributions add column author_agent_id text references public.author_agents(id);
  end if;
end $$;

-- ============================================================================
-- NEW AGENTS: Content Reviewer and X Posting
-- ============================================================================

-- Content Reviewer Agent (Represents user approval - MANUAL)
insert into public.agents (id, name, role, instructions, is_active, model)
values (
  'agent-content-reviewer',
  'Content Reviewer (You)',
  'content_review',
  'You review the briefing articles for quality, accuracy, and readiness for publication on the website and X. Check: Are headlines compelling? Is content clear? Any jargon to remove? Does it meet Bitcoin Intrigue standards? Output your approval decision as JSON: {approved: boolean, for_web_ready: boolean, for_x_ready: boolean, notes: string}',
  true,
  'manual'
) on conflict (id) do nothing;

-- X Posting Agent (Generates tweets without posting)
insert into public.agents (id, name, role, instructions, is_active, model)
values (
  'agent-x-posting',
  'X Posting Agent',
  'x_posting',
  'Transform the approved Bitcoin briefing articles into 5 engaging X (Twitter) posts, one per story. Each post should be under 280 characters, include relevant emoji, story-specific framing, and compelling hooks. DO NOT post to X immediately. Generate scheduled posting times (2-hour gaps starting at 8 AM UTC). Format: JSON with posts array containing {text: string, scheduledTime: ISO8601, storyIndex: 0-4}',
  true,
  'gemini-3-flash-preview'
) on conflict (id) do nothing;

-- ============================================================================
-- RLS POLICIES for new tables
-- ============================================================================

alter table public.author_agents enable row level security;
alter table public.schedules enable row level security;
alter table public.scheduled_distributions enable row level security;
alter table public.x_posting_schedule enable row level security;
alter table public.execution_history enable row level security;

-- Permissive policies (allow all access)
create policy "Enable all access for author_agents" on public.author_agents for all using (true) with check (true);
create policy "Enable all access for schedules" on public.schedules for all using (true) with check (true);
create policy "Enable all access for scheduled_distributions" on public.scheduled_distributions for all using (true) with check (true);
create policy "Enable all access for x_posting_schedule" on public.x_posting_schedule for all using (true) with check (true);
create policy "Enable all access for execution_history" on public.execution_history for all using (true) with check (true);

-- ============================================================================
-- GRANTS for new tables
-- ============================================================================

grant all on public.author_agents to anon, authenticated;
grant all on public.schedules to anon, authenticated;
grant all on public.scheduled_distributions to anon, authenticated;
grant all on public.x_posting_schedule to anon, authenticated;
grant all on public.execution_history to anon, authenticated;
