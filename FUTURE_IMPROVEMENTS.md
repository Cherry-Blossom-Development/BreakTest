# Future Improvements

## Admin-Triggered Test Runs (Pull Model)

**What we want:** An "Run Tests" button in the Breakroom admin page
(`/admin/test-results`) that triggers the test suite and streams results back
to whichever environment you're running from (dev or production).

**Why the obvious approach doesn't work:**
The natural implementation would be to install BreakTest on the EC2 server and
have the backend spawn it when triggered. This works for web tests (Chrome is
installable on Linux), but breaks down for mobile:
- Android tests require Android Studio / an Android emulator
- iOS tests require Xcode, which is macOS-only and can never run on EC2

**The right architecture — self-hosted runner / pull model:**

Each dev machine runs a lightweight polling agent (a simple Node.js script) as
a background process. The agent polls the Breakroom API every ~30 seconds for
pending test jobs. When it finds one, it runs the tests locally and posts
results back via the existing reporter.

```
Admin page (dev or prod)
  → POST /api/test-results/trigger  { platform: 'web' }
  → Creates a pending job in the DB

PC agent (polls every 30s)
  → GET /api/test-results/trigger/pending
  → Sees the job, claims it
  → Runs: npm run test:web:headless
  → Results flow through BreakroomReporter → same API → DB
  → Job marked complete

Mac Mini agent (polls every 30s)
  → Same pattern, handles ios + android
```

**Environment-awareness is automatic:**
The admin page on `dev.prosaurus.com` posts to the dev API. The agent picks up
the job and runs tests with `BREAKROOM_API_URL=https://dev.prosaurus.com/api/test-results`,
so results land in `breakroom_dev` and appear on the dev admin page. Same
pattern for production.

**What needs to be built:**

1. **Backend** — new endpoints in `test-results.js`:
   - `POST /api/test-results/trigger` (admin auth) — inserts a pending job row
     into a new `test_trigger_jobs` table
   - `GET /api/test-results/trigger/pending` (agent auth via API key) — returns
     the oldest unclaimed job and marks it as claimed
   - `POST /api/test-results/trigger/:jobId/complete` (agent auth) — marks job
     done/failed
   - `GET /api/test-results/trigger/status` (admin auth) — returns recent jobs
     and their statuses for the UI

2. **Database** — new `test_trigger_jobs` table:
   ```sql
   CREATE TABLE test_trigger_jobs (
     id INT AUTO_INCREMENT PRIMARY KEY,
     platform ENUM('web', 'android', 'ios') NOT NULL,
     environment VARCHAR(32) NOT NULL,
     status ENUM('pending', 'claimed', 'completed', 'failed') DEFAULT 'pending',
     requested_by_api_url VARCHAR(255),  -- which environment triggered it
     claimed_at TIMESTAMP NULL,
     completed_at TIMESTAMP NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```
   Needs to be created in both `breakroom` and `breakroom_dev`.

3. **Agent script** (`BreakTest/agent/runner-agent.ts`):
   - Polls `GET /api/test-results/trigger/pending` with an API key header
   - On receiving a job: sets `BREAKROOM_API_URL` from `requested_by_api_url`,
     spawns the appropriate wdio config, waits for exit, marks job complete
   - Run with: `npx ts-node agent/runner-agent.ts`
   - Can be set up as a system service (launchd on Mac, Task Scheduler on Windows)

4. **Frontend** — augment `AdminTestResults.vue`:
   - "Run Tests" section with platform buttons (Web, Android, iOS)
   - Polls `GET /api/test-results/trigger/status` while a job is pending/claimed
   - Shows job status and auto-refreshes the results table on completion

**Notes:**
- This is exactly how GitHub Actions self-hosted runners work
- The agent machines (PC + Mac Mini) need to be powered on and running the
  agent for triggered runs to work — same constraint as today's manual runs
- The API key for agent auth should be set in `.env.test` as
  `BREAKROOM_TEST_API_KEY` and in the Breakroom backend `.env` as `TEST_API_KEY`
