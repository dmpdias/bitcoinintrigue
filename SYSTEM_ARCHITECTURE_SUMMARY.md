# Bitcoin Intrigue: Complete System Architecture

## Executive Summary

Bitcoin Intrigue has evolved from a manual on-demand content generation system to a **fully automated scheduling and distribution platform** with approval workflows and social media integration.

**Key Capabilities:**
- ✅ Automated scheduled content generation (cron-based)
- ✅ Approval gate for quality control (Content Reviewer Agent representing you)
- ✅ Automatic X (Twitter) posting with staggered times (5 tweets per briefing)
- ✅ Complete audit trail of all operations
- ✅ Database persistence for all schedules, approvals, and posts

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                               │
│  Bitcoin Intrigue UI + Command Center                          │
│  ├─ Schedules Tab (schedule CRUD)                             │
│  ├─ Workflows Tab (approval gate config)                      │
│  ├─ Pipeline Tab (approval workflow + manual review)          │
│  └─ Author Tab (X credentials)                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                          │
│  ├─ agentService.runWorkflow() - Pipeline execution            │
│  ├─ storageService - Database CRUD operations                 │
│  ├─ schedulerService - Cron parsing & scheduling              │
│  └─ xService - X API integration                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATION LAYER                              │
│  Vercel Cron Handlers                                           │
│  ├─ /api/cron/run-schedule.ts (every 5 minutes)               │
│  │  └─ Checks schedules → Executes workflows → Halts at      │
│  │     approval if required → Saves issues                    │
│  │                                                             │
│  └─ /api/cron/post-to-x.ts (every 1 minute)                  │
│     └─ Checks queued tweets → Posts to X → Tracks events    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE LAYER                        │
│  Supabase PostgreSQL Database                                   │
│  ├─ schedules - Cron configurations                            │
│  ├─ scheduled_distributions - Channel configs                  │
│  ├─ x_posting_schedule - Queued tweets                         │
│  ├─ execution_history - Workflow run logs                      │
│  ├─ author_agents - Author profiles & X credentials           │
│  └─ issues - Generated briefings + approval status             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Complete Lifecycle

### 1. Schedule Creation → Workflow Execution → Approval

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   User      │     │  Vercel     │     │  Workflow    │
│  Creates    │────→│   Cron      │────→│  Executes    │
│ Schedule    │     │(every 5min) │     │(agents pipe) │
└─────────────┘     └─────────────┘     └──────────────┘
                                              │
                                              ↓
                        ┌─────────────────────────────────┐
                        │  requires_approval = true?      │
                        │  ┌──────────────┐ ┌──────────┐ │
                        │  │   YES ✓      │ │   NO    │ │
                        │  └──────────────┘ └──────────┘ │
                        └─────────────┬───────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
          ┌──────────────────┐            ┌──────────────────┐
          │  Save Issue with  │            │  Continue to     │
          │approval_status=   │            │ x_posting agent  │
          │'pending_review'   │            │ (auto-publish)   │
          │   [HALT]          │            │                  │
          └──────────────────┘            └──────────────────┘
                    │                              │
                    ↓                              ↓
          ┌──────────────────┐            ┌──────────────────┐
          │  Issue appears   │            │ X Posting Agent  │
          │ in Pipeline Tab  │            │ generates tweets │
          │ "AWAITING        │            │ Saves to db      │
          │  APPROVAL"       │            │                  │
          └──────────────────┘            └──────────────────┘
```

### 2. Manual Approval → X Posting Agent → Tweet Posting

```
┌──────────────────┐
│  User clicks     │
│ "Approve &       │
│  Publish"        │
└────────┬─────────┘
         ↓
┌──────────────────────────────┐
│ Update issue:                │
│ approval_status='approved'   │
│ approved_at=NOW()            │
│ approved_by=USER             │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ Resume workflow:             │
│ Run remaining agents         │
│ (x_posting if in pipeline)   │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ X Posting Agent (AI)         │
│ ├─ Read briefing (5 stories) │
│ ├─ Generate 5 tweets         │
│ ├─ Each < 280 chars          │
│ ├─ Add emoji & hashtags      │
│ └─ Stagger times (2-hr gaps) │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ Save to x_posting_schedule:  │
│ [5 entries, one per story]   │
│ ├─ story_index: 0-4          │
│ ├─ post_text: Tweet content  │
│ ├─ scheduled_time: Staggered │
│ └─ status: 'scheduled'       │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ Cron: /api/cron/post-to-x    │
│ Runs every 1 minute          │
│ Checks for scheduled_time ≤ │
│ now() AND status='scheduled' │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ For each due tweet:          │
│ ├─ Get author X credentials  │
│ ├─ Call X API v2: POST tweet │
│ ├─ Get back: {id, url}       │
│ └─ Update status='posted'    │
└────────┬─────────────────────┘
         ↓
┌──────────────────────────────┐
│ Tweets posted on X.com!      │
│ Visible on @bitcoinintrigue  │
│ All 5 stories distributed    │
└──────────────────────────────┘
```

---

## Core Components

### 1. Frontend Components

#### `/components/Admin/SchedulesTab.tsx`
**Purpose:** Manage scheduled workflows
```
├─ Left Panel: Schedule List
│  ├─ "+ New" button
│  ├─ List of all schedules
│  └─ Toggle active/inactive
│
├─ Center Panel: Schedule Editor/Details
│  ├─ Name, description
│  ├─ Workflow selection
│  ├─ Cron expression builder
│  ├─ Timezone selector
│  └─ Save/Delete buttons
│
└─ Right Panel: Info
   ├─ Schedule counts
   ├─ Workflow available
   └─ Cron format help
```

**Data:** `Schedule` interface
- id, workflowId, name, cronExpression, timezone, isActive, createdBy, createdAt

#### `/components/Admin/BackOffice.tsx` - Enhanced
**Purpose:** Command Center hub with approval workflow
```
├─ Workflows Tab
│  ├─ requires_approval checkbox ✓ NEW
│  ├─ approval_message textarea ✓ NEW
│  └─ ... existing workflow editor
│
├─ Pipeline Tab ✓ ENHANCED
│  ├─ Briefing Queue
│  │  ├─ "⏸ AWAITING APPROVAL" badge (new status)
│  │  ├─ "✅ Approve & Publish" button
│  │  ├─ "❌ Reject" button + reason textarea
│  │  └─ ... existing approvals UI
│  └─ Story editors
│
├─ Schedules Tab ✓ NEW
│  └─ SchedulesTab component
│
└─ Author Tab ✓ NEW
   ├─ Author profile display
   ├─ X handle input
   ├─ X bearer token input
   └─ Connection status indicator
```

**Key Handlers:**
- `handleApproveIssue(issueId)` - Approve and resume workflow
- `handleRejectIssue(issueId, reason)` - Reject and halt
- Both update issue approval fields and trigger remaining agents

#### `/components/Admin/AuthorTab.tsx` (NEW)
**Purpose:** Author profile and X API credential management
```
├─ Author Profile
│  ├─ Name (read-only): "Bitcoin Intrigue"
│  ├─ Bio (editable)
│  └─ X Handle (editable): "@bitcoinintrigue"
│
└─ X API Credentials
   ├─ Bearer Token input
   ├─ Save button
   └─ Connection status (🟢 Connected / 🔴 Not Connected)
```

---

### 2. Service Layer

#### `/services/schedulerService.ts` (NEW)
**Purpose:** Cron expression parsing and schedule management

**Functions:**
```typescript
parseSchedule(cronExpr, timezone) → CronExpression
  Parses cron string to CRON object

getNextExecutionTime(cron, timezone) → Date
  Calculates next scheduled execution time

listSchedules() → Schedule[]
  Fetch all schedules from database

createSchedule(params) → Schedule
  Insert new schedule

updateSchedule(id, updates) → Schedule
  Update existing schedule

deleteSchedule(id) → void
  Remove schedule and cascade dependencies

getScheduleExecutionHistory(scheduleId) → ExecutionRecord[]
  Get all execution logs for a schedule

enableSchedule(id) → void
disableSchedule(id) → void
  Toggle schedule active status
```

**Dependency:** `cron-parser` npm package for parsing

#### `/services/agentService.ts` (ENHANCED)
**Purpose:** Execute agents and workflows

**New Function:**
```typescript
runWorkflow(
  workflowId: string,
  steps: string[], // agent IDs in order
  agentsMap: Map<string, AgentDefinition>,
  requiresApproval: boolean
) → {
  success: boolean;
  issue: BriefingData | null;
  executionLogs: Array<{agent: string; status: string; error?: string}>;
  halted?: boolean; // true if stopped at approval gate
}
```

**Logic:**
1. Execute each agent sequentially
2. Pipe output as context to next agent
3. Handle content_review and x_posting roles
4. Check `requiresApproval` flag
5. If true: Save issue with `approvalStatus='pending_review'` and halt
6. If false: Continue to remaining agents

#### `/services/storageService.ts` (ENHANCED)
**Purpose:** Database CRUD operations

**New Functions (Schedule Management):**
```typescript
getSchedules() → Schedule[]
getSchedule(id) → Schedule | null
saveSchedule(schedule) → Schedule
deleteSchedule(id) → void
```

**New Functions (X Posting):**
```typescript
getXPostingScheduleEntries(filters?) → XPostingScheduleEntry[]
getXPostingScheduleEntriesDue() → XPostingScheduleEntry[]
  // Returns entries where scheduled_time <= now AND status='scheduled'

saveXPostingScheduleEntry(entry) → XPostingScheduleEntry
updateXPostingScheduleEntry(id, updates) → XPostingScheduleEntry
```

**New Functions (Execution History):**
```typescript
getExecutionHistory(scheduleId, limit) → ExecutionRecord[]
createExecutionRecord(record) → ExecutionRecord
updateExecutionRecord(id, updates) → ExecutionRecord
```

**New Functions (Author Agent):**
```typescript
getAuthorAgent(agentId) → AuthorAgent | null
saveAuthorAgent(agent) → AuthorAgent
```

**Type Mapping:** All functions handle snake_case ↔ camelCase conversion

#### `/services/xService.ts` (NEW)
**Purpose:** X API v2 integration for posting tweets

**Functions:**
```typescript
postTweet(text: string, bearerToken: string) → {
  id: string;
  text: string;
  url: string;
}
  Posts a single tweet to X API

getPostMetrics(postId: string, bearerToken: string) → {
  likes: number;
  retweets: number;
  replies: number;
}
  (Future) Get engagement metrics
```

**API Details:**
- Endpoint: `POST https://api.twitter.com/2/tweets`
- Auth: Bearer token (OAuth 2.0)
- Error Handling:
  - 401: Credentials invalid
  - 429: Rate limited (retry next cycle)
  - 4xx/5xx: Log and mark as failed

**Only Called By:** `/api/cron/post-to-x.ts`
- Agents only generate tweet JSON, don't post directly
- Cron handler posts at scheduled times

---

### 3. Cron Handlers

#### `/api/cron/run-schedule.ts` (NEW)
**Purpose:** Execute scheduled workflows on cron trigger

**Vercel Configuration:**
```json
{
  "crons": [{
    "path": "/api/cron/run-schedule",
    "schedule": "*/5 * * * *"  // Every 5 minutes
  }]
}
```

**Execution Flow:**
```
1. Get all active schedules from DB
2. For each schedule:
   a. Get next execution time using schedulerService
   b. Check if current time matches (within 5-minute window)
   c. If match:
      - Get workflow definition
      - Check workflow.requiresApproval
      - Call agentService.runWorkflow()
      - Save result to execution_history
      - If requiresApproval=true: Issue halts at approval_status='pending_review'
      - If requiresApproval=false: Continues and saves as approved
3. Return {processed, succeeded, failed, errors}
```

**Error Handling:**
- Never throws (always returns 200)
- Per-schedule error tracking
- Detailed execution logs in DB

#### `/api/cron/post-to-x.ts` (NEW)
**Purpose:** Post queued tweets to X at scheduled times

**Vercel Configuration:**
```json
{
  "crons": [{
    "path": "/api/cron/post-to-x",
    "schedule": "* * * * *"  // Every minute
  }]
}
```

**Execution Flow:**
```
1. Get X posting schedule entries due:
   WHERE scheduled_time <= now() AND status='scheduled'
2. For each due posting:
   a. Get author X credentials from author_agents table
   b. Call xService.postTweet(text, bearerToken)
   c. If success:
      - Update x_posting_schedule: status='posted', post_url, posted_time
      - Create distribution_events entry
   d. If rate limited: Stop processing, resume next cycle
   e. If auth failed: Mark as failed, stop processing
   f. If other error: Mark as failed, continue to next
3. Return {posted, failed, skipped, errors}
```

**Error Handling:**
- 401 (Auth): Stop processing, all remaining skipped
- 429 (Rate limit): Stop processing, resume next cycle
- Other errors: Mark failed, continue processing

---

## Database Schema

### New Tables

#### `schedules`
```sql
id TEXT PRIMARY KEY
workflow_id TEXT REFERENCES workflows(id)
name TEXT NOT NULL
description TEXT
cron_expression TEXT NOT NULL -- "0 6 * * *"
timezone TEXT DEFAULT 'UTC'
is_active BOOLEAN DEFAULT true
created_by TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

Indexes: workflow_id, is_active
```

#### `x_posting_schedule`
```sql
id TEXT PRIMARY KEY
distribution_id TEXT REFERENCES scheduled_distributions(id)
issue_id TEXT REFERENCES issues(id)
story_index INT CHECK (0-4) -- Which of 5 stories
post_text TEXT NOT NULL
scheduled_time TIMESTAMPTZ
posted_time TIMESTAMPTZ
post_url TEXT
status TEXT IN ('scheduled', 'posted', 'failed')
error_message TEXT
created_at TIMESTAMPTZ

Indexes: issue_id, status, scheduled_time
```

#### `execution_history`
```sql
id TEXT PRIMARY KEY
schedule_id TEXT REFERENCES schedules(id)
issue_id TEXT REFERENCES issues(id)
status TEXT IN ('pending', 'in_progress', 'completed', 'failed')
started_at TIMESTAMPTZ
completed_at TIMESTAMPTZ
error_message TEXT
execution_logs JSONB -- [{agent, status, error?}, ...]
created_at TIMESTAMPTZ

Indexes: schedule_id, status
```

#### `scheduled_distributions`
```sql
id TEXT PRIMARY KEY
schedule_id TEXT REFERENCES schedules(id)
channel TEXT IN ('email', 'x', 'x_staggered')
recipient_filter JSONB
post_template JSONB
is_enabled BOOLEAN
created_at TIMESTAMPTZ

Indexes: schedule_id
```

#### `author_agents`
```sql
id TEXT PRIMARY KEY
name TEXT UNIQUE
bio TEXT
x_handle TEXT
x_credentials JSONB -- {bearerToken, refreshToken, ...}
is_active BOOLEAN
created_at TIMESTAMPTZ
```

### Modified Tables

#### `workflows`
```sql
+ requires_approval BOOLEAN DEFAULT true
+ approval_message TEXT
```

#### `issues`
```sql
+ approval_status TEXT IN ('pending_review', 'approved', 'rejected') DEFAULT 'pending_review'
+ approved_at TIMESTAMPTZ
+ approved_by TEXT
+ rejection_reason TEXT
+ scheduled_for TEXT -- schedule_id
```

#### `distributions`
```sql
+ scheduled_time TIMESTAMPTZ
+ author_agent_id TEXT REFERENCES author_agents(id)
```

---

## Type Definitions

```typescript
interface Schedule {
  id: string;
  workflowId: string;
  name: string;
  description?: string;
  cronExpression: string;
  timezone: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface XPostingScheduleEntry {
  id: string;
  distributionId?: string;
  issueId: string;
  storyIndex: number; // 0-4
  postText: string;
  scheduledTime: string;
  postedTime?: string;
  postUrl?: string;
  status: 'scheduled' | 'posted' | 'failed';
  errorMessage?: string;
  createdAt: string;
}

interface ExecutionRecord {
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

interface AuthorAgent {
  id: string;
  name: string;
  bio?: string;
  xHandle?: string;
  xCredentials?: {
    bearerToken: string;
    refreshToken?: string;
  };
  isActive: boolean;
  createdAt: string;
}

// Extended types
interface WorkflowDefinition {
  // ... existing fields
  requiresApproval?: boolean;
  approvalMessage?: string;
}

interface BriefingData {
  // ... existing fields
  approvalStatus?: 'pending_review' | 'approved' | 'rejected';
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  scheduledFor?: string;
}

type AgentRole = '...' | 'content_review' | 'x_posting';
```

---

## Configuration

### `/vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/run-schedule",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/post-to-x",
      "schedule": "* * * * *"
    }
  ]
}
```

### Environment Variables Required
```
CRON_SECRET=your-secret-for-vercel-validation
API_KEY=google-ai-api-key
X_BEARER_TOKEN=your-x-api-bearer-token (or manage via author_agents table)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
```

---

## Workflow: Scheduled Content to X Distribution

```
Day 1 - 6:00 AM UTC (Scheduled Time)
├─ Cron triggers: /api/cron/run-schedule
├─ Workflow executes:
│  ├─ Scout Agent: Research 5 stories
│  ├─ Planner Agent: Plan briefing structure
│  ├─ Writer Agent: Write 5 stories
│  ├─ Image Agent: Generate 5 images
│  └─ Reviewer Agent: Polish content
├─ Check: requires_approval=true?
│  └─ YES → Save issue with approval_status='pending_review'
│           Issue appears in Pipeline Tab as "AWAITING APPROVAL"
│           Workflow halts here
├─ YOU review in Command Center
│  ├─ Read headline and 5 stories
│  ├─ View images
│  └─ Click "✅ Approve & Publish"
├─ Resume workflow:
│  └─ X Posting Agent: Generate 5 tweets
│     ├─ Story 1 tweet (scheduled 8 AM UTC)
│     ├─ Story 2 tweet (scheduled 10 AM UTC)
│     ├─ Story 3 tweet (scheduled 12 PM UTC)
│     ├─ Story 4 tweet (scheduled 2 PM UTC)
│     └─ Story 5 tweet (scheduled 4 PM UTC)
├─ Save to x_posting_schedule table (5 entries, status='scheduled')
├─ Update issue: approval_status='approved', approved_at=NOW()
│
Day 1 - 8:00 AM UTC (First Tweet)
├─ Cron triggers: /api/cron/post-to-x (every minute)
├─ Find x_posting_schedule entries due
├─ Post Story 1 tweet to X API
├─ Update: status='posted', post_url='https://x.com/...', posted_time=NOW()
├─ Create distribution_events entry
│
Day 1 - 10:00 AM, 12 PM, 2 PM, 4 PM UTC
├─ Cron repeats
├─ Posts remaining tweets at scheduled times
├─ All 5 stories visible on X.com @bitcoinintrigue
```

---

## Monitoring & Debugging

### Check Execution History
```sql
SELECT * FROM execution_history
WHERE schedule_id = '[schedule-id]'
ORDER BY created_at DESC;
```

### Monitor X Posting
```sql
SELECT issue_id, story_index, post_text, status, posted_time, post_url
FROM x_posting_schedule
ORDER BY scheduled_time DESC;
```

### Check Approval Status
```sql
SELECT id, headline, approval_status, approved_at, approved_by
FROM issues
WHERE approval_status IN ('pending_review', 'approved', 'rejected')
ORDER BY created_at DESC;
```

---

## Testing

See these files for comprehensive testing:
- `QUICK_TEST_APPROVAL_WORKFLOW.md` - 5-10 min fast track
- `APPROVAL_WORKFLOW_TESTING.md` - Full 9-phase testing
- `SQL_TESTING_REFERENCE.md` - 20+ SQL verification queries

---

## Future Enhancements

### Phase 2: Email Distribution
- Similar approval workflow
- Use Resend API for email sending
- Scheduled email campaigns

### Phase 3: Analytics
- Track X engagement (likes, retweets, replies)
- Email open rates and click tracking
- Dashboard with metrics

### Phase 4: Multiple Authors
- Multiple author_agents with different credentials
- Author-specific signing
- Team collaboration workflows

### Phase 5: Advanced Scheduling
- Time zone-aware scheduling
- Skip weekends/holidays
- Dynamic adjustment based on engagement

---

## Summary

**Bitcoin Intrigue is now a complete marketing automation platform** with:

✅ Scheduled content generation
✅ Quality control via approval workflow
✅ Automatic X distribution (5 tweets with staggered times)
✅ Author credential management
✅ Complete audit trail
✅ Database persistence
✅ Cron-based automation
✅ Error handling and recovery

All components are **integrated, tested, and ready for production use**.
