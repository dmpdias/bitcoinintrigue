# SQL Testing Reference - Approval Workflow & X Posting

Quick SQL queries for verifying the approval workflow and X posting system during testing.

---

## 1. Create a Test Schedule (if not via UI)

```sql
INSERT INTO public.schedules (
  workflow_id,
  name,
  description,
  cron_expression,
  timezone,
  is_active,
  created_at,
  updated_at
) VALUES (
  '[your-workflow-id]',
  'Test Approval Workflow',
  'Testing approval gate and X posting',
  '*/5 * * * *',
  'UTC',
  true,
  NOW(),
  NOW()
)
RETURNING id, name, cron_expression, is_active;
```

---

## 2. Enable Approval Gate on Workflow

```sql
UPDATE public.workflows
SET
  requires_approval = true,
  approval_message = 'Please review and approve this briefing before publishing to X.'
WHERE id = '[your-workflow-id]'
RETURNING id, name, requires_approval, approval_message;
```

---

## 3. Check Workflow Configuration

```sql
SELECT
  id,
  name,
  requires_approval,
  approval_message,
  steps
FROM public.workflows
WHERE id = '[your-workflow-id]';
```

**Verify:**
- requires_approval = true
- steps array includes agent IDs in order

---

## 4. Verify All Approval-Related Agents Exist

```sql
SELECT id, name, role, model, is_active
FROM public.agents
WHERE role IN ('content_review', 'x_posting', 'reviewer')
ORDER BY role;
```

**Expected 3 rows:**
- content_review (Content Reviewer - You)
- x_posting (X Posting Agent)
- reviewer (existing Normie Reviewer Agent)

---

## 5. Check Execution History (after workflow runs)

```sql
SELECT
  id,
  schedule_id,
  issue_id,
  status,
  started_at,
  completed_at,
  error_message,
  created_at
FROM public.execution_history
ORDER BY created_at DESC
LIMIT 5;
```

**What to look for:**
- status = 'completed' (successful)
- started_at and completed_at filled
- error_message NULL (no errors)

---

## 6. Check Issue Approval Status

```sql
SELECT
  id,
  headline,
  approval_status,
  approved_at,
  approved_by,
  rejection_reason,
  status,
  created_at
FROM public.issues
WHERE approval_status IN ('pending_review', 'approved', 'rejected')
ORDER BY created_at DESC
LIMIT 10;
```

**What to look for:**
- **pending_review:** Issue waiting for approval (should disappear after approval)
- **approved:** Issue approved and sent to X posting
- **rejected:** Issue rejected with reason

---

## 7. Check X Posting Schedule (tweets queued)

```sql
SELECT
  id,
  issue_id,
  story_index,
  post_text,
  scheduled_time,
  posted_time,
  post_url,
  status,
  error_message,
  created_at
FROM public.x_posting_schedule
WHERE issue_id = '[your-issue-id]'
ORDER BY story_index;
```

**Expected 5 rows:**
- story_index: 0, 1, 2, 3, 4
- post_text: Tweet under 280 chars
- scheduled_time: Different times (2-hour gaps)
- status: 'scheduled' → 'posted' (after posting)
- posted_time: NULL → timestamp (after posting)
- post_url: NULL → Twitter URL (after posting)

---

## 8. Check Author Agent & X Credentials

```sql
SELECT
  id,
  name,
  bio,
  x_handle,
  x_credentials,
  is_active,
  created_at
FROM public.author_agents
WHERE id = 'agent-bitcoinintrigue';
```

**What to check:**
- x_handle: Should have Twitter handle
- x_credentials: Should contain bearerToken (encrypted)
- is_active: Should be true

---

## 9. Get Author's Bearer Token (for debugging - CAREFUL!)

```sql
-- THIS REVEALS SENSITIVE DATA - Only in development!
SELECT x_credentials->>'bearerToken' as bearer_token
FROM public.author_agents
WHERE id = 'agent-bitcoinintrigue';
```

**Note:** This shows your actual X API Bearer Token. Keep it secure!

---

## 10. Check Distribution Events (after posting)

```sql
SELECT
  id,
  issue_id,
  channel,
  status,
  published_at,
  url,
  created_at
FROM public.distributions
WHERE channel = 'x'
ORDER BY created_at DESC
LIMIT 10;
```

**What to look for:**
- channel: 'x'
- status: 'published'
- url: Twitter post URL
- published_at: Timestamp when posted

---

## 11. Find All Issues With Pending Approval

```sql
SELECT
  id,
  headline,
  approval_status,
  created_at
FROM public.issues
WHERE approval_status = 'pending_review'
ORDER BY created_at DESC;
```

**Use this to find issues waiting for approval in the Pipeline.**

---

## 12. Manually Approve an Issue (if UI not working)

```sql
UPDATE public.issues
SET
  approval_status = 'approved',
  approved_at = NOW(),
  approved_by = 'system'
WHERE id = '[your-issue-id]'
RETURNING id, approval_status, approved_at, approved_by;
```

---

## 13. Manually Reject an Issue

```sql
UPDATE public.issues
SET
  approval_status = 'rejected',
  rejection_reason = 'Story 2 needs fact-checking'
WHERE id = '[your-issue-id]'
RETURNING id, approval_status, rejection_reason;
```

---

## 14. Check Scheduled Distributions (if using email/other channels)

```sql
SELECT
  id,
  schedule_id,
  channel,
  is_enabled,
  created_at
FROM public.scheduled_distributions
ORDER BY created_at DESC;
```

---

## 15. Reset Test Data (to start fresh)

```sql
-- Delete execution history for a schedule
DELETE FROM public.execution_history
WHERE schedule_id = '[your-schedule-id]'
RETURNING COUNT(*);

-- Delete X posting schedule entries for an issue
DELETE FROM public.x_posting_schedule
WHERE issue_id = '[your-issue-id]'
RETURNING COUNT(*);

-- Reset issue approval status
UPDATE public.issues
SET approval_status = 'pending_review'
WHERE id = '[your-issue-id]';
```

---

## 16. View Complete Workflow Pipeline

```sql
SELECT
  w.id,
  w.name,
  w.requires_approval,
  w.approval_message,
  array_length(w.steps, 1) as step_count,
  w.steps
FROM public.workflows w
WHERE id = '[your-workflow-id]';
```

**Then expand the steps array to see agent IDs in order:**
```sql
-- Example: If steps = ["agent-scout", "agent-plan", "agent-write", "agent-review"]
-- This shows the pipeline: Scout → Plan → Write → Review → [Approval Gate] → X Posting
```

---

## 17. Get Full Issue Details (for debugging)

```sql
SELECT
  id,
  headline,
  intro,
  approval_status,
  approved_at,
  approved_by,
  rejection_reason,
  status,
  created_at,
  last_updated
FROM public.issues
WHERE id = '[your-issue-id]';
```

---

## 18. Count Stats for Current Testing Session

```sql
SELECT
  'Schedules' as metric, COUNT(*) as count FROM public.schedules
UNION ALL
SELECT 'Issues Pending Review', COUNT(*) FROM public.issues WHERE approval_status = 'pending_review'
UNION ALL
SELECT 'Issues Approved', COUNT(*) FROM public.issues WHERE approval_status = 'approved'
UNION ALL
SELECT 'Issues Rejected', COUNT(*) FROM public.issues WHERE approval_status = 'rejected'
UNION ALL
SELECT 'X Posts Scheduled', COUNT(*) FROM public.x_posting_schedule WHERE status = 'scheduled'
UNION ALL
SELECT 'X Posts Posted', COUNT(*) FROM public.x_posting_schedule WHERE status = 'posted'
UNION ALL
SELECT 'Executions Completed', COUNT(*) FROM public.execution_history WHERE status = 'completed'
UNION ALL
SELECT 'Executions Failed', COUNT(*) FROM public.execution_history WHERE status = 'failed'
ORDER BY metric;
```

---

## 19. Timeline of Events (recent)

```sql
-- Get all events in chronological order
SELECT
  'Schedule Created' as event_type,
  created_at as event_time,
  id as event_id,
  name as details
FROM public.schedules
WHERE created_at > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT
  'Workflow Executed',
  started_at,
  id,
  'Status: ' || status
FROM public.execution_history
WHERE started_at > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT
  'Issue Created',
  created_at,
  id,
  'Status: ' || approval_status
FROM public.issues
WHERE created_at > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT
  'Tweet Scheduled',
  scheduled_time,
  id,
  'Story ' || CAST(story_index as text)
FROM public.x_posting_schedule
WHERE scheduled_time > NOW() - INTERVAL '1 hour'

ORDER BY event_time DESC;
```

---

## 20. Quick Validation Checklist (SQL)

Run all these - if any return 0 rows, something is missing:

```sql
-- 1. Approval agents exist
SELECT COUNT(*) as approval_agents FROM public.agents
WHERE role IN ('content_review', 'x_posting');

-- 2. Author agent exists and active
SELECT COUNT(*) as author_agents FROM public.author_agents
WHERE is_active = true;

-- 3. Workflows have approval configuration
SELECT COUNT(*) as workflows_with_approval FROM public.workflows
WHERE requires_approval IS NOT NULL;

-- 4. Issues table has approval columns
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name = 'issues' AND column_name = 'approval_status';

-- 5. Schedules table exists and has data
SELECT COUNT(*) as schedules FROM public.schedules;

-- 6. X posting schedule table exists and has data (after approval)
SELECT COUNT(*) as x_posts FROM public.x_posting_schedule;

-- 7. Execution history table exists and has data (after workflow run)
SELECT COUNT(*) as executions FROM public.execution_history;
```

**All should return COUNT > 0 for a fully working system.**

---

## Pro Tips

1. **Use Timestamp Filtering**
   ```sql
   WHERE created_at > NOW() - INTERVAL '1 hour'
   ```
   Shows only recent activity

2. **Export Results to CSV**
   - In Supabase: Click query result → Download CSV
   - Useful for tracking approval workflow progression

3. **Monitor in Real-Time**
   - Open new tab in Supabase SQL Editor
   - Run query every 30 seconds
   - Watch data change as workflows execute

4. **Find Failing Workflows**
   ```sql
   SELECT * FROM public.execution_history WHERE status = 'failed';
   ```

5. **See Complete Tweet Content**
   ```sql
   SELECT story_index, post_text FROM x_posting_schedule
   WHERE issue_id = '[id]'
   ORDER BY story_index;
   ```

---

Good luck with testing! If any queries return unexpected results, check the troubleshooting guide in APPROVAL_WORKFLOW_TESTING.md
