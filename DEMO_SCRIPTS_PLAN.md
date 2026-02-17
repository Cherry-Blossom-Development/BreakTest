# App Store Demo Scripts Implementation Plan

## Overview

This document outlines the plan for creating automated demo scripts that will record iOS app interactions for App Store promotional videos. The system uses Appium to control the iOS Simulator while coordinating with external systems to simulate realistic multi-user scenarios.

## Goals

1. Create repeatable, scripted demos that showcase key app features
2. Simulate multi-user interactions (e.g., receiving chat messages from other users)
3. Use isolated test data that doesn't depend on production state
4. Record high-quality videos suitable for App Store submission

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Demo Recording System                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐ │
│  │   Appium     │────▶│ iOS Simulator │────▶│  Screen Recording   │ │
│  │   Driver     │     │  (iPhone 15)  │     │  (xcrun simctl)     │ │
│  └──────────────┘     └──────────────┘     └──────────────────────┘ │
│         │                    │                                       │
│         │                    ▼                                       │
│         │            ┌──────────────┐                               │
│         │            │  Breakroom   │                               │
│         │            │   iOS App    │                               │
│         │            └──────────────┘                               │
│         │                    │                                       │
│         │                    ▼                                       │
│         │            ┌──────────────┐     ┌──────────────────────┐ │
│         │            │  Demo API    │────▶│  breakroom_test DB   │ │
│         │            │  (localhost) │     │  (isolated data)     │ │
│         │            └──────────────┘     └──────────────────────┘ │
│         │                    ▲                                       │
│         │                    │                                       │
│         ▼                    │                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              External User Simulator Service                  │  │
│  │  (API calls or direct DB inserts to simulate other users)    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Demo Scripts Folder Structure

```
BreakTest/
├── demos/                          # NEW - Demo scripts (separate from tests)
│   ├── config/
│   │   └── wdio.demo.conf.ts      # Demo-specific WebdriverIO config
│   ├── pages/                      # iOS page objects for demos
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── BreakroomPage.ts
│   │   └── ChatPage.ts
│   ├── services/
│   │   ├── ExternalUserService.ts  # Simulates other users via API
│   │   ├── DatabaseService.ts      # Direct DB manipulation if needed
│   │   └── RecordingService.ts     # Screen recording control
│   ├── data/
│   │   ├── demoUsers.ts           # Demo user credentials
│   │   └── demoContent.ts         # Pre-scripted messages, etc.
│   ├── scripts/
│   │   ├── 01-breakroom-navigation.demo.ts
│   │   ├── 02-chat-conversation.demo.ts
│   │   ├── 03-lyric-lab-usage.demo.ts
│   │   └── ...
│   ├── recordings/                 # Output folder for recordings
│   └── README.md
├── test/                           # Existing functional tests
└── ...
```

### 2. Test Database (`breakroom_test`)

**Purpose**: Isolated, repeatable data for demos

**Advantages**:
- No interference from production data changes
- Can reset to known state before each demo
- Predictable user accounts, chat rooms, messages

**Setup**:
- Already exists via `npm run db:setup` (uses existing schema.sql and seed-data.sql)
- Will extend seed-data.sql with demo-specific data

**Demo-Specific Seed Data Needed**:
```sql
-- Demo users (in addition to test users)
-- Primary demo user (the one being recorded)
INSERT INTO users (handle, first_name, last_name, email, email_verified, hash, salt)
VALUES ('DemoUser', 'Demo', 'User', 'demo@test.local', 1, 'HASH', 'SALT');

-- External users for simulating interactions
INSERT INTO users (handle, first_name, last_name, email, email_verified, hash, salt)
VALUES
  ('Sarah', 'Sarah', 'Johnson', 'sarah@test.local', 1, 'HASH', 'SALT'),
  ('Mike', 'Mike', 'Chen', 'mike@test.local', 1, 'HASH', 'SALT');

-- Demo chat room
INSERT INTO chat_rooms (name, description, owner_id)
VALUES ('Team Chat', 'Team discussion room', NULL);

-- Add demo users to chat room
INSERT INTO users_rooms (user_id, room_id, accepted, role)
SELECT u.id, cr.id, 1, 'member'
FROM users u, chat_rooms cr
WHERE u.handle IN ('DemoUser', 'Sarah', 'Mike') AND cr.name = 'Team Chat';

-- Breakroom blocks for demo user
INSERT INTO breakroom_blocks (user_id, block_type, content_id, title, x, y, w, h)
SELECT u.id, 'chat', cr.id, 'Team Chat', 0, 0, 2, 2
FROM users u, chat_rooms cr
WHERE u.handle = 'DemoUser' AND cr.name = 'Team Chat';

INSERT INTO breakroom_blocks (user_id, block_type, title, x, y, w, h)
SELECT u.id, 'updates', 'Updates', 2, 0, 2, 2
FROM users u WHERE u.handle = 'DemoUser';
```

### 3. Demo API Server

**Option A: Separate Docker Container (Recommended)**
- Run the Breakroom backend in a separate container
- Point it at `breakroom_test` database
- Expose on a different port (e.g., 3001)

**Option B: Environment Variable Switch**
- Modify backend to accept `DB_NAME` override
- Start backend with `DB_NAME=breakroom_test npm run dev`

**Implementation**:

Create `docker-compose.demo.yml`:
```yaml
version: '3.8'
services:
  demo-api:
    build:
      context: ../Breakroom/backend
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    environment:
      NODE_ENV: development
      DB_HOST: ${DB_HOST}
      DB_PORT: ${DB_PORT}
      DB_USER: ${DB_USER}
      DB_PASS: ${DB_PASS}
      DB_NAME: breakroom_test  # Key difference!
      SECRET_KEY: demo-secret-key
      CORS_ORIGIN: "*"
    networks:
      - demo-network

networks:
  demo-network:
```

### 4. iOS App Configuration for Demos

**Challenge**: The iOS app has a hardcoded API URL or uses environment-based config.

**Solutions**:

**Option A: Build Variant (Recommended)**
- Create a "Demo" build scheme in Xcode
- Set `API_BASE_URL` to `http://localhost:3001` for demo builds
- Build the app with: `xcodebuild -scheme "Breakroom-Demo" ...`

**Option B: Runtime Configuration**
- Add a hidden settings screen or launch argument
- Pass `--api-url http://localhost:3001` when launching via Appium

**Option C: Local Network Proxy**
- Use a local proxy to redirect API calls
- More complex but doesn't require app changes

**Implementation for Option A**:

1. In Xcode, duplicate the "Breakroom" scheme as "Breakroom-Demo"
2. Add build setting: `API_BASE_URL = http://localhost:3001`
3. Update `APIClient.swift` to use this:
```swift
struct APIConfig {
    #if DEMO
    static let baseURL = "http://localhost:3001"
    #else
    static let baseURL = "https://www.prosaurus.com"
    #endif
}
```

### 5. External User Simulator Service

**Purpose**: Simulate actions from other users during demos (e.g., receiving chat messages)

**Implementation** (`demos/services/ExternalUserService.ts`):

```typescript
import mysql from 'mysql2/promise';

interface DemoUser {
    id: number;
    handle: string;
    authToken?: string;
}

export class ExternalUserService {
    private db: mysql.Connection;
    private apiBaseUrl: string;
    private users: Map<string, DemoUser> = new Map();

    constructor(apiBaseUrl: string = 'http://localhost:3001') {
        this.apiBaseUrl = apiBaseUrl;
    }

    async connect(): Promise<void> {
        this.db = await mysql.createConnection({
            host: process.env.TEST_DB_HOST,
            port: parseInt(process.env.TEST_DB_PORT || '3306'),
            user: process.env.TEST_DB_USER,
            password: process.env.TEST_DB_PASS,
            database: 'breakroom_test'
        });
    }

    async disconnect(): Promise<void> {
        await this.db.end();
    }

    /**
     * Send a chat message as an external user
     * Uses direct DB insert for reliability (no auth needed)
     */
    async sendChatMessage(
        fromUserHandle: string,
        roomName: string,
        message: string
    ): Promise<void> {
        const [users] = await this.db.query(
            'SELECT id FROM users WHERE handle = ?',
            [fromUserHandle]
        );
        const userId = (users as any[])[0].id;

        const [rooms] = await this.db.query(
            'SELECT id FROM chat_rooms WHERE name = ?',
            [roomName]
        );
        const roomId = (rooms as any[])[0].id;

        await this.db.query(
            'INSERT INTO chat_messages (room_id, user_id, message) VALUES (?, ?, ?)',
            [roomId, userId, message]
        );
    }

    /**
     * Send message via API (requires Socket.IO for real-time)
     * More realistic but more complex
     */
    async sendChatMessageViaApi(
        userHandle: string,
        roomId: number,
        message: string
    ): Promise<void> {
        // Would need to authenticate as user and use Socket.IO
        // More complex - use DB insert for simplicity
    }
}
```

### 6. Screen Recording Service

**Implementation** (`demos/services/RecordingService.ts`):

```typescript
import { execSync, spawn, ChildProcess } from 'child_process';
import path from 'path';

export class RecordingService {
    private recordingProcess: ChildProcess | null = null;
    private outputPath: string;

    constructor(outputDir: string = './demos/recordings') {
        this.outputPath = outputDir;
    }

    /**
     * Get the booted simulator UDID
     */
    private getSimulatorUDID(): string {
        const result = execSync(
            'xcrun simctl list devices booted -j',
            { encoding: 'utf8' }
        );
        const data = JSON.parse(result);

        for (const runtime of Object.values(data.devices) as any[]) {
            for (const device of runtime) {
                if (device.state === 'Booted') {
                    return device.udid;
                }
            }
        }
        throw new Error('No booted simulator found');
    }

    /**
     * Start recording the simulator screen
     */
    startRecording(filename: string): void {
        const udid = this.getSimulatorUDID();
        const outputFile = path.join(this.outputPath, `${filename}.mp4`);

        console.log(`Starting recording: ${outputFile}`);

        this.recordingProcess = spawn('xcrun', [
            'simctl', 'io', udid, 'recordVideo',
            '--codec=h264',
            '--force',
            outputFile
        ]);

        this.recordingProcess.stderr?.on('data', (data) => {
            console.log(`Recording: ${data}`);
        });
    }

    /**
     * Stop the current recording
     */
    stopRecording(): void {
        if (this.recordingProcess) {
            console.log('Stopping recording...');
            this.recordingProcess.kill('SIGINT');
            this.recordingProcess = null;

            // Give it time to finalize the video
            execSync('sleep 2');
        }
    }
}
```

---

## Demo Script Example

### Demo 1: Breakroom Navigation + Chat

**File**: `demos/scripts/01-breakroom-chat.demo.ts`

```typescript
import { RecordingService } from '../services/RecordingService';
import { ExternalUserService } from '../services/ExternalUserService';
import LoginPage from '../pages/LoginPage';
import BreakroomPage from '../pages/BreakroomPage';
import ChatPage from '../pages/ChatPage';
import { DEMO_USERS } from '../data/demoUsers';

describe('Demo: Breakroom Navigation and Chat', () => {
    const recorder = new RecordingService();
    const externalUser = new ExternalUserService();

    before(async () => {
        await externalUser.connect();
    });

    after(async () => {
        await externalUser.disconnect();
    });

    it('records breakroom and chat demo', async () => {
        // Start recording
        recorder.startRecording('01-breakroom-chat');

        try {
            // 1. Login
            await LoginPage.waitForScreen();
            await browser.pause(1000); // Let user see login screen
            await LoginPage.login(DEMO_USERS.primary.handle, DEMO_USERS.primary.password);
            await browser.pause(2000);

            // 2. Show Breakroom page
            await BreakroomPage.waitForScreen();
            await browser.pause(2000);

            // 3. Scroll through blocks
            await BreakroomPage.scrollDown();
            await browser.pause(1500);
            await BreakroomPage.scrollUp();
            await browser.pause(1500);

            // 4. Tap on Chat block to expand
            await BreakroomPage.tapChatBlock();
            await browser.pause(2000);

            // 5. Navigate to full Chat view
            await BreakroomPage.openFullChat();
            await browser.pause(2000);

            // 6. Simulate receiving a message from external user
            await externalUser.sendChatMessage(
                'Sarah',
                'Team Chat',
                'Hey! How is the project going?'
            );
            await browser.pause(3000); // Wait for message to appear

            // 7. Type and send a reply
            await ChatPage.typeMessage('Going great! Just finishing up the demo.');
            await browser.pause(1000);
            await ChatPage.sendMessage();
            await browser.pause(2000);

            // 8. Receive another message
            await externalUser.sendChatMessage(
                'Mike',
                'Team Chat',
                'Awesome! Can\'t wait to see it.'
            );
            await browser.pause(3000);

            // 9. Navigate back to Breakroom
            await ChatPage.goBack();
            await browser.pause(2000);

        } finally {
            // Always stop recording
            recorder.stopRecording();
        }
    });
});
```

---

## Implementation Phases

### Phase 1: Infrastructure Setup (Day 1)
- [ ] Create `demos/` folder structure
- [ ] Create `docker-compose.demo.yml` for demo API
- [ ] Extend `database/seed-data.sql` with demo users and data
- [ ] Create `.env.demo` configuration file
- [ ] Create npm scripts for demo environment

### Phase 2: iOS App Demo Build (Day 1-2)
- [ ] Create "Breakroom-Demo" scheme in Xcode
- [ ] Configure demo build to use localhost API
- [ ] Build demo .app and place in `apps/` folder
- [ ] Test app connects to demo API

### Phase 3: Core Services (Day 2)
- [ ] Implement `RecordingService.ts`
- [ ] Implement `ExternalUserService.ts`
- [ ] Implement `DatabaseService.ts` for data reset
- [ ] Create demo WebdriverIO config (`wdio.demo.conf.ts`)

### Phase 4: Page Objects (Day 2-3)
- [ ] Create iOS page objects for demo flows
  - [ ] `LoginPage.ts`
  - [ ] `BreakroomPage.ts`
  - [ ] `ChatPage.ts`
  - [ ] `LyricLabPage.ts` (if needed)

### Phase 5: First Demo Script (Day 3)
- [ ] Implement `01-breakroom-chat.demo.ts`
- [ ] Test full flow with recording
- [ ] Refine timing and interactions

### Phase 6: Additional Demos (Day 4+)
- [ ] Create additional demo scripts as needed
- [ ] Fine-tune for App Store requirements

---

## npm Scripts to Add

Add to `package.json`:

```json
{
  "scripts": {
    "demo:db:setup": "ts-node database/setup.ts --demo",
    "demo:api:start": "docker-compose -f docker-compose.demo.yml up -d",
    "demo:api:stop": "docker-compose -f docker-compose.demo.yml down",
    "demo:record": "wdio run ./demos/config/wdio.demo.conf.ts",
    "demo:all": "npm run demo:db:setup && npm run demo:api:start && npm run demo:record"
  }
}
```

---

## Requirements Checklist

### Software Requirements
- [ ] Xcode 15+ with iOS 17 Simulator
- [ ] Appium 3.x with XCUITest driver
- [ ] Docker (for demo API)
- [ ] Node.js 18+

### Environment Variables (`.env.demo`)
```
# Demo Database (same server, different database)
TEST_DB_HOST=44.225.148.34
TEST_DB_PORT=3306
TEST_DB_USER=DCAdminUser
TEST_DB_PASS=<password>
TEST_DB_NAME=breakroom_test

# Demo API
DEMO_API_URL=http://localhost:3001

# iOS Simulator
DEVICE_NAME=iPhone 15 Pro
PLATFORM_VERSION=17.0

# Demo App Path
APP_PATH=./apps/Breakroom-Demo.app
```

### Pre-Demo Checklist
1. [ ] Demo database reset (`npm run demo:db:setup`)
2. [ ] Demo API running (`npm run demo:api:start`)
3. [ ] iOS Simulator booted with correct device
4. [ ] Demo app installed on simulator
5. [ ] Screen recording permissions granted

---

## Notes and Considerations

### Real-time Chat Updates
The current approach uses direct database inserts for external user messages. This works but the iOS app needs to poll or refresh to see new messages. Options:
1. **Polling**: App periodically checks for new messages (simpler)
2. **Socket.IO**: Connect external user service via WebSocket (more realistic)
3. **Pull-to-refresh**: Demo script triggers refresh after inserting messages

### Video Quality
- Simulator recordings are high quality by default
- Consider recording at 60fps for smooth playback
- App Store requires specific resolutions - may need to resize

### Timing
- Add generous pauses between actions for viewers to follow
- Real users don't click instantly - simulate natural timing
- Consider adding visual indicators (like typing animation) before actions

### Multiple Devices
For App Store, may need recordings from multiple device sizes:
- iPhone 6.7" (iPhone 15 Pro Max)
- iPhone 6.1" (iPhone 15 Pro)
- iPad 12.9"
- iPad 11"

---

## Questions to Resolve

1. **API Authentication**: Does the demo API need to bypass any rate limiting or security?
2. **Socket.IO**: Should external messages use WebSocket for real-time updates?
3. **App Store Requirements**: What exact video formats/resolutions are needed?
4. **Additional Demos**: What other features should be demonstrated?

---

## Appendix: Useful Commands

```bash
# List available simulators
xcrun simctl list devices

# Boot a simulator
xcrun simctl boot "iPhone 15 Pro"

# Install app on simulator
xcrun simctl install booted ./apps/Breakroom-Demo.app

# Record simulator screen manually
xcrun simctl io booted recordVideo output.mp4

# Take screenshot
xcrun simctl io booted screenshot screenshot.png
```
