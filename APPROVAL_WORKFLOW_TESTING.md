# Approval Workflow & X Posting Agent Testing Guide

## Overview

This guide walks you through testing the complete approval workflow and X posting agent integration:

1. **Content Reviewer Agent** (representing you) - Manual approval workflow
2. **X Posting Agent** - Generates 5 tweets with staggered posting times
3. **Scheduled Workflow Execution** - Runs on cron schedule
4. **X Distribution** - Posts tweets at scheduled times

---

## Current System Status

✅ **Implemented & Ready to Test:**
- Database: schedules, x_posting_schedule, execution_history tables
- Services: schedulerService, xService, agentService with runWorkflow()
- Cron Handlers: /api/cron/run-schedule.ts and /api/cron/post-to-x.ts
- UI Components: SchedulesTab, AuthorTab with approval workflow
- Types: All approval status types defined
- Approval Gate Logic: Halts at review step if requiresApproval=true

---

## Pre-Testing Checklist

### 1. Verify Database Tables Exist

Open Supabase Dashboard → SQL Editor and run:

```sql
-- Check all new tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema='public'
AND table_name IN ('schedules', 'scheduled_distributions', 'x_posting_schedule', 'execution_history', 'author_agents')
ORDER BY table_name;

-- Should return all 5 tables
```

**Expected Output:** 5 rows (author_agents, execution_history, schedules, scheduled_distributions, x_posting_schedule)

### 2. Verify Author Agent Exists

```sql
SELECT id, name, bio, x_handle, is_active
FROM public.author_agents
WHERE id = 'agent-bitcoinintrigue';
```

**Expected Output:** Bitcoin Intrigue agent with is_active=true

### 3. Verify Workflow Approval Configuration

```sql
SELECT id, name, requires_approval, approval_message
FROM public.workflows
LIMIT 1;
```

**Expected Output:** Should show workflows with requires_approval BOOLEAN column

### 4. Verify New Agents Exist

```sql
SELECT id, name, role, is_active
FROM public.agents
WHERE role IN ('content_review', 'x_posting');
```

**Expected Output:** 2 rows
- agent-content-reviewer (role: content_review)
- agent-x-posting (role: x_posting)

---

## Test Phase 1: Create a Test Schedule

### Step 1: Navigate to Command Center

1. Open your Bitcoin Intrigue app
2. Scroll to bottom right
3. Click the Command Center icon
4. Click **"Schedules"** tab

### Step 2: Create a New Schedule

**In the "Schedules" panel:**

1. Click **"+ New"** button
2. Fill in the form:
   - **Name:** "Test Approval Workflow"
   - **Workflow:** Select your main workflow (research → plan → write → image → review)
   - **Cron Expression:** `*/5 * * * *` (every 5 minutes for testing)
   - **Timezone:** UTC
   - Click **Save**

**Expected Result:**
- Schedule appears in left panel with clock icon
- Shows "🟢 Active" status
- Can click to view/edit schedule

### Step 3: Verify Schedule Saved

**In Supabase SQL Editor:**

```sql
SELECT id, name, cron_expression, is_active
FROM public.schedules
WHERE name = 'Test Approval Workflow';
```

**Expected Output:** 1 row with your new schedule

---

## Test Phase 2: Configure Workflow for Approval

### Step 1: Edit Workflow Settings

1. In Command Center, click **"Workflows"** tab
2. Click your main workflow from the list
3. Look for **"Require approval before publishing"** checkbox

**If checkbox is present:**
- ✅ Feature implemented
- Check the box (enable approval gate)
- Click **Save**

**If checkbox is NOT present:**
- ⚠️ Feature not yet implemented in UI
- Manually enable in database for testing:
  ```sql
  UPDATE public.workflows
  SET requires_approval = true,
      approval_message = 'Please review and approve before publishing to X'
  WHERE id = '[your-workflow-id]';
  ```

### Step 2: Verify Workflow Configuration

```sql
SELECT id, name, requires_approval, approval_message
FROM public.workflows
WHERE name = '[your-workflow-name]';
```

**Expected Output:**
- requires_approval: true
- approval_message: Your message

---

## Test Phase 3: Trigger Scheduled Workflow

### Option A: Wait for Cron (5 minutes)

The workflow will execute automatically every 5 minutes.

### Option B: Manual Trigger (Recommended for Testing)

**Using Browser Developer Console:**

1. Open DevTools (F12)
2. Go to **Console** tab
3. Paste this code:

```javascript
// Manually trigger the schedule
fetch('/api/cron/run-schedule', {
  method: 'GET',
  headers: {
    'x-vercel-cron-secret': 'test-secret' // For dev testing
  }
})
.then(r => r.json())
.then(data => console.log('Schedule executed:', data))
.catch(err => console.error('Error:', err));
```

4. Press Enter
5. Check console output

**Expected Output:**
```json
{
  "success": true,
  "processed": 1,
  "succeeded": 1,
  "failed": 0,
  "timestamp": "2024-02-20T10:00:00Z"
}
```

### Step 4: Verify Execution Record Created

**In Supabase:**

```sql
SELECT id, schedule_id, status, started_at, completed_at
FROM public.execution_history
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Output:** 1 row with status='completed'

---

## Test Phase 4: Check Issue in "Awaiting Approval" Queue

### Step 1: Navigate to Pipeline Tab

1. In Command Center, click **"Pipeline"** tab
2. Look at the **"Briefing Queue"** (right sidebar)

### Step 2: Find Pending Issue

**Look for:**
- Blue badge: **"⏸ AWAITING APPROVAL"**
- Most recent issue at top of queue
- Shows headline from generated briefing

**Expected Behavior:**
- Issue appears immediately after schedule execution
- Status clearly shows "AWAITING APPROVAL"
- Story details are visible but read-only
- Cannot edit (locked for review)

### Step 3: Verify in Database

```sql
SELECT id, status, approval_status, approved_at, approved_by
FROM public.issues
WHERE approval_status = 'pending_review'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Output:**
- approval_status: 'pending_review'
- approved_at: NULL (not yet approved)
- approved_by: NULL (not yet approved)

---

## Test Phase 5: Content Review & Approval (You)

### Step 1: Review Content in Command Center

**In the Pipeline Tab:**
- Read the headline (from Writer Agent)
- Read the 5 stories generated
- Check images generated by Image Agent
- Verify content quality and accuracy

### Step 2: Approve Issue

**Click "✅ Approve & Publish" button**

**Expected Behavior:**
1. Issue status changes to "✅ APPROVED"
2. Issue moved out of "AWAITING APPROVAL" queue
3. X Posting Agent runs automatically
4. Console shows: `[Workflow] Executing agent: X Posting Agent (x_posting)`

### Step 3: Verify Approval in Database

```sql
SELECT id, approval_status, approved_at, approved_by
FROM public.issues
WHERE approval_status = 'approved'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Output:**
- approval_status: 'approved'
- approved_at: Current timestamp
- approved_by: Your user ID (if implemented) or 'system'

---

## Test Phase 6: X Posting Agent - Generate Tweets

### Step 1: Check X Posting Agent Output

**In Browser Console:**

```javascript
// Check console logs for X Posting Agent output
// Look for messages like:
// [Workflow] Executing agent: X Posting Agent (x_posting)
// [Workflow] Agent X Posting Agent: success
```

### Step 2: Verify X Posting Schedule Entries Created

**In Supabase:**

```sql
SELECT id, issue_id, story_index, post_text, scheduled_time, status
FROM public.x_posting_schedule
WHERE issue_id = '[your-issue-id]'
ORDER BY story_index;
```

**Expected Output:** 5 rows
- story_index: 0, 1, 2, 3, 4 (one per story)
- post_text: Tweet content under 280 characters
- scheduled_time: Staggered times (2-hour gaps, e.g., 8 AM, 10 AM, 12 PM, 2 PM, 4 PM UTC)
- status: 'scheduled'

**Example Output:**
```
id | issue_id | story_index | post_text | scheduled_time | status
1  | issue-123| 0 | "Bitcoin hit $X today. Here's what..." | 2024-02-20T08:00:00Z | scheduled
2  | issue-123| 1 | "🌍 Global impact: Argentina's..." | 2024-02-20T10:00:00Z | scheduled
3  | issue-123| 2 | "🔐 Privacy update: New..." | 2024-02-20T12:00:00Z | scheduled
...
```

---

## Test Phase 7: Configure X API Credentials (for Real Posting)

### Step 1: Get X API Credentials

You need:
- **X API Bearer Token** from [developer.twitter.com](https://developer.twitter.com)
- OAuth 2.0 authentication

**To get Bearer Token:**
1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create/select your app
3. Go to **Keys and tokens** section
4. Copy **Bearer Token** (from API Key & Secret)

### Step 2: Set Bearer Token in AuthorTab

1. In Command Center, click **"Author"** tab
2. Fill in author profile:
   - Name: "Bitcoin Intrigue" (read-only, auto-filled)
   - Bio: "Daily Bitcoin newsletter..." (editable)
   - X Handle: "@bitcoinintrigue" (editable)
3. **Connect X Account** section:
   - Paste Bearer Token in input field
   - Click **"Save Credentials"**
   - Should show: "🟢 Connected"

### Step 3: Verify Credentials Saved

**In Supabase:**

```sql
SELECT id, name, x_handle, x_credentials->>'bearerToken' as has_token
FROM public.author_agents
WHERE id = 'agent-bitcoinintrigue';
```

**Expected Output:**
- x_handle: "@bitcoinintrigue"
- has_token: Shows "eyJ..." (Bearer token starts with "ey")

---

## Test Phase 8: X Posting - Automatic Tweet Distribution

### Option A: Wait for Scheduled Times

The tweets will post automatically at their scheduled times (8 AM, 10 AM, 12 PM, 2 PM, 4 PM UTC).

The `/api/cron/post-to-x` handler runs every minute and checks for due posts.

### Option B: Manual Trigger X Posting (Testing)

**In Browser Console:**

```javascript
// Manually trigger X posting
fetch('/api/cron/post-to-x', {
  method: 'GET',
  headers: {
    'x-vercel-cron-secret': 'test-secret'
  }
})
.then(r => r.json())
.then(data => console.log('X posting result:', data))
.catch(err => console.error('Error:', err));
```

**Expected Output:**
```json
{
  "success": true,
  "posted": 5,
  "failed": 0,
  "skipped": 0,
  "totalProcessed": 5,
  "timestamp": "2024-02-20T10:00:00Z"
}
```

### Step 1: Check Tweets Posted

**In Supabase:**

```sql
SELECT id, story_index, post_text, posted_time, post_url, status
FROM public.x_posting_schedule
WHERE issue_id = '[your-issue-id]'
ORDER BY story_index;
```

**Expected Changes:**
- status: Changed from 'scheduled' to 'posted'
- posted_time: Filled with actual posting timestamp
- post_url: Twitter URL like "https://x.com/user/status/123456"

### Step 2: Verify on X (Twitter)

1. Go to [X.com](https://x.com)
2. Search for your account: @bitcoinintrigue
3. You should see 5 new tweets posted
4. Each tweet mentions a different story
5. Tweets are posted at 2-hour intervals

---

## Test Phase 9: Rejection Workflow (Optional)

### If You Want to Reject a Briefing:

1. In Pipeline Tab, click issue with "⏸ AWAITING APPROVAL" badge
2. Click **"❌ Reject"** button
3. Enter rejection reason: "Needs fact-checking on Story 2"
4. Click **"Confirm Rejection"**

### Verify Rejection:

**In Database:**
```sql
SELECT id, approval_status, rejection_reason, approved_at
FROM public.issues
WHERE id = '[your-issue-id]';
```

**Expected Output:**
- approval_status: 'rejected'
- rejection_reason: Your message
- approved_at: NULL (never approved)

**In Pipeline Tab:**
- Issue moves to "❌ REJECTED" section
- Not sent to X posting
- Can create new schedule run to generate new briefing

---

## Complete E2E Test Checklist

Run through the entire approval workflow in one go:

- [ ] Schedule created with requiresApproval=true
- [ ] Workflow executed (via cron or manual trigger)
- [ ] Issue appears in "AWAITING APPROVAL" queue
- [ ] Issue status is 'pending_review' in database
- [ ] Issue content displays correctly (read-only)
- [ ] Click "Approve & Publish"
- [ ] Issue status changes to "APPROVED"
- [ ] X Posting Agent runs and generates 5 tweets
- [ ] 5 entries created in x_posting_schedule table
- [ ] Each tweet is under 280 characters
- [ ] Tweets have staggered scheduled_time (2-hour gaps)
- [ ] Bearer token set for author agent
- [ ] Manually trigger /api/cron/post-to-x
- [ ] All 5 posts change status to 'posted'
- [ ] post_url filled with Twitter URL
- [ ] 5 new tweets appear on your X account

---

## Troubleshooting

### Issue: "AWAITING APPROVAL" badge doesn't appear

**Causes:**
1. requiresApproval not set to true on workflow
2. Schedule not executed yet (check cron logs)
3. Workflow failed before reaching review step

**Fix:**
```bash
# Check execution logs
curl http://localhost:3000/api/cron/run-schedule

# Check database
SELECT * FROM execution_history ORDER BY created_at DESC LIMIT 1;
```

### Issue: X Posting Agent doesn't generate tweets

**Causes:**
1. content_review agent not in workflow pipeline
2. X Posting Agent not in workflow pipeline after approval
3. Briefing data malformed

**Fix:**
```bash
# Check console logs for agent execution errors
# Verify agents in pipeline
SELECT steps FROM workflows WHERE id = '[workflow-id]';
```

### Issue: Tweets don't post to X

**Causes:**
1. Bearer token not set or invalid
2. X API rate limited
3. Tweet text exceeds 280 characters

**Fix:**
```bash
# Check credentials
SELECT x_credentials FROM author_agents WHERE id = 'agent-bitcoinintrigue';

# Check posting errors
SELECT * FROM x_posting_schedule WHERE status = 'failed' ORDER BY created_at DESC LIMIT 1;
```

---

## Success Indicators

✅ **Phase 1 Complete:**
- Schedule created and visible in Command Center

✅ **Phase 2 Complete:**
- Workflow has requiresApproval checkbox
- Approval gate configured in database

✅ **Phase 3 Complete:**
- Workflow executed and created execution_history record
- No errors in console

✅ **Phase 4 Complete:**
- Issue appears with "AWAITING APPROVAL" badge
- Issue data loaded correctly

✅ **Phase 5 Complete:**
- Issue can be approved via UI
- Approval timestamp and status updated in database

✅ **Phase 6 Complete:**
- X Posting Agent executed
- 5 tweets generated with correct format
- Scheduled times are staggered (2-hour gaps)

✅ **Phase 7 Complete:**
- Bearer token saved securely
- Author agent marked as "Connected"

✅ **Phase 8 Complete:**
- Tweets posted to X automatically
- All 5 posts have URLs and timestamps
- Visible on your X account

---

## Next Steps

Once you've successfully tested the approval workflow:

1. **Schedule Real Workflows**
   - Set cron to run at specific time (e.g., `0 6 * * *` for 6 AM daily)
   - Configure requiresApproval=true for all workflows

2. **Monitor Approval Queue**
   - Check Command Center Pipeline Tab daily
   - Review generated briefings
   - Approve & publish or reject as needed

3. **Track X Posting**
   - Monitor distribution_events table for all posts
   - Check engagement metrics (likes, retweets, replies)
   - Adjust tweet templates based on performance

4. **Extend to Email**
   - Once X posting works, add email distribution
   - Use same approval workflow for email campaigns

---

## Questions or Issues?

Check these files for implementation details:
- `/services/agentService.ts` - runWorkflow() function with approval gate
- `/api/cron/run-schedule.ts` - Workflow execution trigger
- `/api/cron/post-to-x.ts` - Tweet posting handler
- `/components/Admin/BackOffice.tsx` - UI for approval workflow
- Browser Console (F12) - Real-time logs during execution

Good luck testing! 🚀
