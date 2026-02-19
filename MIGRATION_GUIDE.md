# Phase 1: Database Schema Migration Guide

## ⚠️ CRITICAL: Apply Migrations to Supabase FIRST

This guide walks you through applying the Phase 1 database schema (automation & scheduling system) to your Supabase PostgreSQL database.

---

## Step 1: Access Supabase Dashboard

1. Go to **https://app.supabase.com**
2. Login with your account
3. Select your Bitcoin Intrigue project
4. Navigate to **SQL Editor** (left sidebar)
5. Click **"New Query"**

---

## Step 2: Copy Phase 1 Schema SQL

The schema is split into sections. Copy and run the following SQL commands in order:

### Section A: Author Agents Table + Default Agent
```sql
-- 6. Author Agents Table (Self-representing agents with X credentials)
create table if not exists public.author_agents (
  id text primary key,
  name text not null unique,
  bio text,
  x_handle text,
  x_credentials jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Insert default author agent
insert into public.author_agents (id, name, bio, x_handle)
values ('agent-bitcoinintrigue', 'Bitcoin Intrigue', 'Daily Bitcoin newsletter explaining crypto like you''re human', '@bitcoinintrigue')
on conflict (id) do nothing;
```

**Action:** Copy above, paste into new query in Supabase, click **Run**, verify success message

---

### Section B: Schedules Table + Indexes
```sql
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
```

**Action:** Copy above, paste into **new query**, click **Run**

---

### Section C: Scheduled Distributions Table + Index
```sql
-- 8. Scheduled Distributions Table
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
```

**Action:** Copy above, paste into **new query**, click **Run**

---

### Section D: X Posting Schedule Table + Indexes
```sql
-- 9. X Posting Schedule Table
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
```

**Action:** Copy above, paste into **new query**, click **Run**

---

### Section E: Execution History Table + Indexes
```sql
-- 10. Execution History Table
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
```

**Action:** Copy above, paste into **new query**, click **Run**

---

### Section F: Update Existing Tables (Workflows)
```sql
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
```

**Action:** Copy above, paste into **new query**, click **Run**

---

### Section G: Update Existing Tables (Issues)
```sql
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
```

**Action:** Copy above, paste into **new query**, click **Run**

---

### Section H: Update Existing Tables (Distributions)
```sql
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
```

**Action:** Copy above, paste into **new query**, click **Run**

---

### Section I: Insert New Agents (Content Reviewer + X Posting)
```sql
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
```

**Action:** Copy above, paste into **new query**, click **Run**

---

### Section J: Enable RLS + Create Policies
```sql
-- Enable RLS on new tables
alter table public.author_agents enable row level security;
alter table public.schedules enable row level security;
alter table public.scheduled_distributions enable row level security;
alter table public.x_posting_schedule enable row level security;
alter table public.execution_history enable row level security;

-- Create permissive policies (allow all access)
create policy "Enable all access for author_agents" on public.author_agents for all using (true) with check (true);
create policy "Enable all access for schedules" on public.schedules for all using (true) with check (true);
create policy "Enable all access for scheduled_distributions" on public.scheduled_distributions for all using (true) with check (true);
create policy "Enable all access for x_posting_schedule" on public.x_posting_schedule for all using (true) with check (true);
create policy "Enable all access for execution_history" on public.execution_history for all using (true) with check (true);
```

**Action:** Copy above, paste into **new query**, click **Run**

---

### Section K: Grant Permissions
```sql
-- Grant permissions on new tables
grant all on public.author_agents to anon, authenticated;
grant all on public.schedules to anon, authenticated;
grant all on public.scheduled_distributions to anon, authenticated;
grant all on public.x_posting_schedule to anon, authenticated;
grant all on public.execution_history to anon, authenticated;
```

**Action:** Copy above, paste into **new query**, click **Run**

---

## Step 3: Verify Migrations Applied Successfully

In Supabase SQL Editor, run this verification query:

```sql
-- Verify Phase 1 tables exist
SELECT
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name=t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema='public' AND table_name IN (
  'author_agents', 'schedules', 'scheduled_distributions', 'x_posting_schedule', 'execution_history'
)
ORDER BY table_name;
```

**Expected Result:**
```
table_name                      | column_count
--------------------------------|-------------
author_agents                   | 7
execution_history               | 9
schedules                        | 9
scheduled_distributions         | 7
x_posting_schedule              | 10
```

---

## Step 4: Verify New Columns Added to Existing Tables

Run this verification query:

```sql
-- Verify new columns on workflows
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name='workflows' AND column_name IN ('requires_approval', 'approval_message')
ORDER BY column_name;

-- Verify new columns on issues
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name='issues' AND column_name IN ('approval_status', 'approved_at', 'approved_by', 'rejection_reason', 'scheduled_for')
ORDER BY column_name;

-- Verify new columns on distributions
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name='distributions' AND column_name IN ('scheduled_time', 'author_agent_id')
ORDER BY column_name;
```

**Expected Result:**
- workflows: requires_approval (boolean), approval_message (text)
- issues: approval_status (text), approved_at (timestamp), approved_by (text), rejection_reason (text), scheduled_for (text)
- distributions: scheduled_time (timestamp), author_agent_id (text)

---

## Step 5: Verify New Agents Inserted

Run this query:

```sql
SELECT id, name, role, model FROM public.agents
WHERE id IN ('agent-content-reviewer', 'agent-x-posting')
ORDER BY id;
```

**Expected Result:**
```
id                          | name                    | role              | model
-----------------------------|--------------------------|------------------|------------------------
agent-content-reviewer      | Content Reviewer (You)   | content_review   | manual
agent-x-posting             | X Posting Agent          | x_posting        | gemini-3-flash-preview
```

---

## Step 6: Verify Author Agent Exists

Run this query:

```sql
SELECT id, name, bio, x_handle, is_active FROM public.author_agents;
```

**Expected Result:**
```
id                      | name              | bio                                                  | x_handle         | is_active
------------------------|--------------------|------------------------------------------------------|------------------|--------
agent-bitcoinintrigue   | Bitcoin Intrigue   | Daily Bitcoin newsletter explaining crypto...        | @bitcoinintrigue | true
```

---

## ✅ All Migrations Applied Successfully!

Once all verification queries pass, your database is ready for Phase 2-3 integration.

---

## Next Steps (After Database Ready)

1. ✅ Database schema applied (you are here)
2. Next: Integrate cron handlers with real services (backend)
3. Then: Update `vercel.json` with cron job definitions
4. Then: Build and deploy to production
5. Finally: Test scheduling + X posting workflows

---

## Troubleshooting

### Error: "relation 'public.workflows' does not exist"
- The workflows table hasn't been created yet
- Make sure you ran the entire schema file first
- Run all existing table creation commands before Phase 1 additions

### Error: "duplicate key value violates unique constraint 'author_agents_name_key'"
- The author agent was already inserted
- This is OK - the `on conflict` clause handles it
- The migration will skip insertion and continue

### Error: "constraint 'x_credentials' does not exist"
- This is expected - the column type is JSONB (no constraint)
- The error message may be misleading
- Check if the column was created: `SELECT column_name FROM information_schema.columns WHERE table_name='author_agents'`

### Rows Affected Shows 0
- This typically means the `if not exists` check found the object already exists
- This is expected for idempotent migrations
- Verify the table/column exists using SELECT commands above

---

## Questions or Issues?

If migrations fail:
1. Check Supabase error message (usually descriptive)
2. Verify prerequisites (workflows table, agents table must exist)
3. Try running sections one at a time to isolate the issue
4. Contact support with the error message

