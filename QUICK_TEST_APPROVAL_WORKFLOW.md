# Quick Start: Test Approval Workflow & X Posting (5-10 minutes)

This is the fast-track version - just the essentials to see approval workflow and X posting in action.

---

## Prerequisites ✅

- [ ] App is running (localhost:3000 or deployed)
- [ ] Bitcoin Intrigue app loaded
- [ ] Command Center visible (bottom right icon)
- [ ] Browser DevTools open (F12)

---

## Step 1: Create Test Schedule (1 minute)

1. **Open Command Center** → Click "Schedules" tab
2. **Click "➕ New"**
3. Fill in:
   - Name: `Test Approval`
   - Workflow: `Bitcoin Intrigue Pipeline` (your main workflow)
   - Cron: `*/5 * * * *` (every 5 minutes - for testing)
   - Timezone: `UTC`
4. **Click Save**

✅ You should see the schedule in the left list with 🟢 Active

---

## Step 2: Enable Approval Gate (1 minute)

**Option A: Via UI (if implemented)**
1. Click "Workflows" tab
2. Click your workflow
3. Check: "Require approval before publishing"
4. Click Save

**Option B: Via Database (quick)**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Paste this:
   ```sql
   UPDATE public.workflows
   SET requires_approval = true
   WHERE name LIKE '%Intrigue%' OR name LIKE '%Bitcoin%'
   LIMIT 1;
   ```
4. Click "Run"

✅ Approval gate is now enabled

---

## Step 3: Trigger Workflow Execution (1 minute)

**In Browser Console (F12 → Console tab):**

Paste this code:
```javascript
fetch('/api/cron/run-schedule?manual=true')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Workflow executed!');
    console.log(data);
  })
  .catch(e => console.error('❌ Error:', e));
```

Press Enter.

✅ You should see: `✅ Workflow executed!` and result JSON

---

## Step 4: Check "Awaiting Approval" (1 minute)

1. Click "Pipeline" tab
2. Look at right sidebar: "Briefing Queue"
3. Look for **blue badge: "⏸ AWAITING APPROVAL"**
4. Click on it to view the briefing

✅ Briefing is displayed but read-only (awaiting your approval)

---

## Step 5: Approve the Briefing (1 minute)

In the Pipeline tab, you should see approval buttons:
- **✅ Approve & Publish** button
- **❌ Reject** button

**Click "✅ Approve & Publish"**

✅ Issue status changes to "✅ APPROVED"
✅ X Posting Agent runs (check browser console)

---

## Step 6: Verify Tweets Generated (1 minute)

**In Database (Supabase SQL Editor):**

```sql
SELECT story_index, post_text, scheduled_time
FROM public.x_posting_schedule
ORDER BY story_index;
```

Click "Run"

✅ Should show **5 tweets** (one per story)
✅ Each tweet is under 280 characters
✅ scheduled_time is staggered (2-hour gaps)

---

## Step 7: Post Tweets to X (2 minutes)

**First: Set X Bearer Token**

1. Click "Author" tab
2. Under "X API Credentials":
   - Enter your Bearer Token from [developer.twitter.com](https://developer.twitter.com)
   - Click "Save"
   - Should show: 🟢 Connected

**Then: Trigger Posting**

In Browser Console:
```javascript
fetch('/api/cron/post-to-x?manual=true')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Tweets posted!');
    console.log(data);
  })
  .catch(e => console.error('❌ Error:', e));
```

✅ You should see: `posted: 5` in the result

---

## Step 8: Verify Tweets on X (1 minute)

1. Go to [X.com](https://x.com)
2. Go to your account: [@bitcoinintrigue](https://x.com/bitcoinintrigue)
3. You should see **5 new tweets**
4. Each one is a different story from the briefing

✅ **CONGRATULATIONS!** Approval workflow + X posting is working! 🎉

---

## Common Issues & Quick Fixes

### Issue: No "Awaiting Approval" badge appears

**Fix:** Check console for errors - might need to wait for workflow to complete
```javascript
// Check execution status
fetch('/api/cron/run-schedule?debug=true')
  .then(r => r.json())
  .then(d => console.log(d));
```

### Issue: "Approve & Publish" button doesn't appear

**Fix:** The UI might not have the approval workflow implemented yet.
- Manually approve in database:
  ```sql
  UPDATE public.issues SET approval_status = 'approved'
  WHERE approval_status = 'pending_review' LIMIT 1;
  ```

### Issue: Tweets not posting to X

**Fix 1:** Check bearer token is set
```sql
SELECT x_credentials->>'bearerToken' FROM public.author_agents
WHERE id = 'agent-bitcoinintrigue';
```

**Fix 2:** Check X posting entries were created
```sql
SELECT COUNT(*) as tweets FROM public.x_posting_schedule;
-- Should return 5
```

**Fix 3:** Check for errors
```sql
SELECT post_text, error_message, status FROM x_posting_schedule
WHERE status = 'failed';
```

---

## What Just Happened (Architecture Overview)

```
Schedule Created
       ↓
Cron triggers every 5 minutes
       ↓
runWorkflow() executes: Research → Plan → Write → Image → Review
       ↓
requires_approval=true? YES
       ↓
HALT: Save issue with approval_status='pending_review'
       ↓
YOU approve in Command Center
       ↓
Resume workflow: Run X Posting Agent
       ↓
Generate 5 tweets with staggered times (8 AM, 10 AM, 12 PM, 2 PM, 4 PM UTC)
       ↓
Save to x_posting_schedule table
       ↓
Cron: post-to-x runs every minute
       ↓
Check for tweets ready to post (scheduled_time <= now)
       ↓
Post each tweet to X API
       ↓
Update status: 'scheduled' → 'posted'
       ↓
Tweets visible on X.com @bitcoinintrigue
```

---

## Next: Real-World Usage

Now that you've tested the approval workflow:

1. **Daily Execution**
   - Change cron to: `0 6 * * *` (6 AM UTC daily)
   - Briefing will auto-generate at 6 AM
   - You approve it in Command Center
   - 5 tweets post throughout the day

2. **Monitor**
   - Check Pipeline Tab daily for pending approval
   - Review content before approving
   - Track engagement on X

3. **Extend**
   - Add email distribution (same approval workflow)
   - Configure multiple schedules (daily, weekly, etc.)
   - Track metrics (likes, retweets, replies)

---

## Reference Files

- **Detailed Testing:** See `APPROVAL_WORKFLOW_TESTING.md`
- **SQL Reference:** See `SQL_TESTING_REFERENCE.md`
- **Implementation Details:**
  - `/services/agentService.ts` - runWorkflow() with approval gate
  - `/api/cron/run-schedule.ts` - Execution trigger
  - `/api/cron/post-to-x.ts` - Tweet posting handler
  - `/components/Admin/BackOffice.tsx` - Approval UI

---

## Success = ✅

- ✅ Workflow scheduled
- ✅ Briefing generated automatically
- ✅ Issue appears in "Awaiting Approval" queue
- ✅ You approve in Command Center
- ✅ X Posting Agent generates 5 tweets
- ✅ Tweets post to X at staggered times
- ✅ All visible on your X account

Done! 🚀
