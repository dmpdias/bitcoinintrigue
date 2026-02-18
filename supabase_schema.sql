
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
