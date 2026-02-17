# Demo Recording Scripts

Automated demo recordings for App Store promotional videos.

## Overview

These scripts use Appium to control the iOS Simulator while recording the screen.
External user interactions (like receiving chat messages) are simulated via direct
database access.

## Prerequisites

1. **Xcode** with iOS Simulator
2. **Appium** with XCUITest driver:
   ```bash
   npx appium driver install xcuitest
   ```
3. **Demo App** built and placed in `apps/Breakroom-Demo.app`
4. **Database** access configured in `.env.demo`

## Setup

1. Copy environment file:
   ```bash
   cp .env.demo.example .env.demo
   # Edit .env.demo with your database credentials
   ```

2. Setup test database:
   ```bash
   npm run demo:db:setup
   ```

3. Boot iOS Simulator:
   ```bash
   xcrun simctl boot "iPhone 15 Pro"
   ```

4. Install demo app:
   ```bash
   xcrun simctl install booted ./apps/Breakroom-Demo.app
   ```

## Running Demos

Run all demos:
```bash
npm run demo:record
```

Run a specific demo:
```bash
npm run demo:record:script ./demos/scripts/01-breakroom-chat.demo.ts
```

## Demo Scripts

| Script | Description |
|--------|-------------|
| `01-breakroom-chat.demo.ts` | Login, browse Breakroom, chat with external users |

## Folder Structure

```
demos/
├── config/
│   └── wdio.demo.conf.ts    # Appium configuration
├── pages/                    # iOS Page Objects
│   ├── BasePage.ts          # Common functionality
│   ├── LoginPage.ts         # Login screen
│   ├── BreakroomPage.ts     # Home screen
│   └── ChatPage.ts          # Chat screen
├── services/
│   ├── RecordingService.ts  # Screen recording
│   └── ExternalUserService.ts # Simulate other users
├── data/
│   └── demoUsers.ts         # User credentials
├── scripts/                  # Demo scripts
│   └── 01-breakroom-chat.demo.ts
└── recordings/               # Output videos (gitignored)
```

## Output

Recordings are saved to `demos/recordings/` as MP4 files with timestamps:
```
breakroom-chat-demo_2024-01-15T10-30-00-000Z.mp4
```

## Tips

- **Natural Timing**: Scripts use `naturalPause()` and `typeSlowly()` for realistic demos
- **External Users**: Messages from other users are inserted directly into the database
- **Pull to Refresh**: After external messages, use `refreshMessages()` to show them
- **Cleanup**: Each demo clears and re-seeds chat messages for consistency

## Troubleshooting

**No booted simulator found**
```bash
xcrun simctl list devices
xcrun simctl boot "iPhone 15 Pro"
```

**App not found**
- Ensure `Breakroom-Demo.app` exists in `apps/` folder
- Check `DEMO_APP_PATH` in `.env.demo`

**Database connection failed**
- Verify credentials in `.env.demo`
- Ensure `breakroom_test` database exists

**Recording not saving**
- Check `demos/recordings/` folder exists
- Ensure simulator is booted before starting
