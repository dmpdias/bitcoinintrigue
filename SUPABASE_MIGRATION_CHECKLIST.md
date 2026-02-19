# 🚀 Supabase Migration Quick-Start Checklist

## Pre-Migration
- [ ] You have Supabase project open: https://app.supabase.com
- [ ] You've selected your Bitcoin Intrigue project
- [ ] You can see the SQL Editor in the left sidebar

---

## Migration Steps (Copy & Paste Each Section)

### ✅ Section A: Author Agents Table + Default Agent
**Location:** `/MIGRATION_GUIDE.md` - Section A

```
1. Go to SQL Editor → New Query
2. Copy SQL from Section A of MIGRATION_GUIDE.md
3. Paste into query editor
4. Click "RUN" button (bottom right)
5. You should see "Query completed successfully"
6. Move to Section B
```

**Status:** [ ] Complete

---

### ✅ Section B: Schedules Table + Indexes
**Location:** `/MIGRATION_GUIDE.md` - Section B

```
1. Click "New Query" button
2. Copy SQL from Section B
3. Paste and Run
4. Confirm success message
5. Move to Section C
```

**Status:** [ ] Complete

---

### ✅ Section C: Scheduled Distributions Table + Index
**Location:** `/MIGRATION_GUIDE.md` - Section C

```
1. New Query
2. Copy Section C SQL
3. Paste and Run
4. Move to Section D
```

**Status:** [ ] Complete

---

### ✅ Section D: X Posting Schedule Table + Indexes
**Location:** `/MIGRATION_GUIDE.md` - Section D

```
1. New Query
2. Copy Section D SQL
3. Paste and Run
4. Move to Section E
```

**Status:** [ ] Complete

---

### ✅ Section E: Execution History Table + Indexes
**Location:** `/MIGRATION_GUIDE.md` - Section E

```
1. New Query
2. Copy Section E SQL
3. Paste and Run
4. Move to Section F
```

**Status:** [ ] Complete

---

### ✅ Section F: Update Workflows Table
**Location:** `/MIGRATION_GUIDE.md` - Section F

```
1. New Query
2. Copy Section F SQL (adds requires_approval, approval_message)
3. Paste and Run
4. Move to Section G
```

**Status:** [ ] Complete

---

### ✅ Section G: Update Issues Table
**Location:** `/MIGRATION_GUIDE.md` - Section G

```
1. New Query
2. Copy Section G SQL (adds approval_status, approved_at, approved_by, rejection_reason, scheduled_for)
3. Paste and Run
4. Move to Section H
```

**Status:** [ ] Complete

---

### ✅ Section H: Update Distributions Table
**Location:** `/MIGRATION_GUIDE.md` - Section H

```
1. New Query
2. Copy Section H SQL (adds scheduled_time, author_agent_id)
3. Paste and Run
4. Move to Section I
```

**Status:** [ ] Complete

---

### ✅ Section I: Insert New Agents
**Location:** `/MIGRATION_GUIDE.md` - Section I

```
1. New Query
2. Copy Section I SQL (inserts agent-content-reviewer and agent-x-posting)
3. Paste and Run
4. Move to Section J
```

**Status:** [ ] Complete

---

### ✅ Section J: Enable RLS + Create Policies
**Location:** `/MIGRATION_GUIDE.md` - Section J

```
1. New Query
2. Copy Section J SQL
3. Paste and Run
4. Move to Section K
```

**Status:** [ ] Complete

---

### ✅ Section K: Grant Permissions
**Location:** `/MIGRATION_GUIDE.md` - Section K

```
1. New Query
2. Copy Section K SQL
3. Paste and Run
4. ALL MIGRATIONS COMPLETE! 🎉
```

**Status:** [ ] Complete

---

## Verification (Run These Queries)

### Query 1: Verify All 5 New Tables Exist
```sql
-- Copy this entire block into a NEW QUERY in Supabase
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

**Status:** [ ] Verified ✓

---

### Query 2: Verify New Columns on Existing Tables
```sql
-- Workflows columns
SELECT column_name FROM information_schema.columns
WHERE table_name='workflows' AND column_name IN ('requires_approval', 'approval_message')
ORDER BY column_name;

-- Issues columns
SELECT column_name FROM information_schema.columns
WHERE table_name='issues' AND column_name IN ('approval_status', 'approved_at', 'approved_by', 'rejection_reason', 'scheduled_for')
ORDER BY column_name;

-- Distributions columns
SELECT column_name FROM information_schema.columns
WHERE table_name='distributions' AND column_name IN ('scheduled_time', 'author_agent_id')
ORDER BY column_name;
```

**Expected Result:**
- workflows: `requires_approval`, `approval_message`
- issues: `approval_status`, `approved_at`, `approved_by`, `rejection_reason`, `scheduled_for`
- distributions: `scheduled_time`, `author_agent_id`

**Status:** [ ] Verified ✓

---

### Query 3: Verify New Agents Inserted
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

**Status:** [ ] Verified ✓

---

### Query 4: Verify Author Agent Exists
```sql
SELECT id, name, bio, x_handle, is_active FROM public.author_agents;
```

**Expected Result:**
```
id                      | name              | bio                                                  | x_handle         | is_active
------------------------|--------------------|------------------------------------------------------|------------------|--------
agent-bitcoinintrigue   | Bitcoin Intrigue   | Daily Bitcoin newsletter explaining crypto...        | @bitcoinintrigue | true
```

**Status:** [ ] Verified ✓

---

## ✅ All Done!

Once you've completed all sections A-K and verified queries 1-4 above, **copy/paste this message into chat:**

> ✅ All Phase 1 database migrations complete and verified!

Then I'll immediately proceed with:
1. Enhancing Workflows Tab with approval controls
2. Updating Pipeline Tab with approval workflow
3. Integrating services with real database
4. Setting up Vercel cron jobs
5. Running end-to-end tests

---

## ⚠️ Troubleshooting

### Error: "relation 'public.workflows' does not exist"
**Solution:** The workflows table hasn't been created yet. Make sure you ran all existing schema migrations first (before these Phase 1 additions).

### Error: "duplicate key value violates unique constraint"
**Solution:** This is expected - the `on conflict` clause handles it. The migration will skip insertion and continue. This is NOT an error.

### Error on columns: "constraint does not exist"
**Solution:** The error message may be misleading. The columns were likely created successfully. Run verification Query 2 to confirm.

### Query shows 0 rows affected
**Solution:** This usually means the `if not exists` check found the object already exists. This is expected and idempotent. Verify with the verification queries above.

---

## 📖 Reference Links

- **MIGRATION_GUIDE.md** - Full step-by-step guide with all SQL code
- **PHASE_4_COMPLETION_SUMMARY.md** - Overview of what was built
- **Supabase SQL Editor** - Where to paste all these commands: https://app.supabase.com/project/YOUR_PROJECT/sql

---

**Let's go! 🚀**
