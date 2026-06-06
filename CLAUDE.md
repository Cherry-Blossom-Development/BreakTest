# BreakTest — E2E Test Automation Framework

## Overview

BreakTest is the end-to-end test suite for the Prosaurus application. It covers three platforms using [WebdriverIO](https://webdriver.io/) with TypeScript:

| Platform | Driver | Config |
|----------|--------|--------|
| Web (Selenium/Chrome) | WebdriverIO + ChromeDriver | `config/wdio.web.conf.ts` |
| Android (Appium) | WebdriverIO + Appium + UiAutomator2 | `config/wdio.android.conf.ts` |
| iOS (Appium) | WebdriverIO + Appium + XCUITest | `config/wdio.ios.conf.ts` |

All three platforms test the same features against the same backend (https://www.prosaurus.com/api) using the `breakroom_test` database.

## Machine-Specific Context

This repo exists on two machines. Each machine runs a subset of the tests:

| Machine | Platform | Web | Android | iOS |
|---------|----------|-----|---------|-----|
| **Windows PC** (current) | Windows 11 | Yes | Yes | No |
| **Mac Mini** | macOS | Yes | Yes | Yes |

**iOS tests run exclusively on the Mac Mini.** iOS paths, simulator names, and folder references in the iOS config may need to be verified when working on the Mac Mini (paths to sibling repos may differ).

The sibling repos are kept up to date on both machines so you can look up app code, selectors, or API contracts from either machine.

## Project Structure

```
BreakTest/
├── config/                    # WebdriverIO configurations (one per platform)
│   ├── wdio.web.conf.ts
│   ├── wdio.android.conf.ts
│   └── wdio.ios.conf.ts
├── pages/                     # Page Object Model (POM) classes
│   ├── web/                   # Web page objects (CSS selectors, WebdriverIO browser API)
│   ├── android/               # Android page objects (UiSelector resource IDs)
│   └── ios/                   # iOS page objects (XCUITest selectors)
├── test/                      # Test specs organized by platform
│   ├── web/                   # Web .spec.ts files
│   ├── android/               # Android .spec.ts files
│   ├── ios/                   # iOS .spec.ts files
│   └── data/
│       └── testUsers.ts       # Shared test credentials
├── database/                  # DB management scripts
│   ├── setup.ts               # Creates/resets breakroom_test with seed users
│   ├── sync-schema.ts         # Syncs schema from production or dev DB
│   ├── schema.sql             # Schema file written by sync-schema.ts
│   └── .db-state.json         # Tracks last sync timestamp and source
├── reporters/
│   └── BreakroomReporter.ts   # Custom WDIO reporter — posts results to Breakroom API
├── utils/
│   ├── ensureTestEnv.ts       # Checks/starts Docker test environment
│   └── testEmailReader.ts     # Reads test email accounts (for verification flows)
├── apps/                      # Mobile app binaries (not committed)
│   ├── breakroom-dev.apk      # Android dev build
│   ├── breakroom-productionTest.apk  # Android production-test build
│   └── Breakroom.app          # iOS app bundle (Mac Mini only)
├── demos/                     # Demo recording setup
├── logs/                      # Appium server logs (generated at runtime)
├── allure-results/            # Allure reporter output (generated at runtime)
└── scripts/                   # Shell helpers for environment management
```

## Related Repositories (Sibling Folders)

| Repo | Platform | Path |
|------|----------|------|
| `../Breakroom` | Web frontend + Express backend | Vue 3 + Node.js |
| `../Android` | Native Android app | Kotlin + Jetpack |
| `../iPhone` | Native iOS app | Swift + UIKit (Mac Mini primary) |

When adding or modifying tests, check the corresponding app code for current element IDs, API contracts, and feature implementations.

## Common Commands

### Run Tests

```bash
# Web
npm run test:web                  # Web tests against local environment
npm run test:web:dev              # Web tests against dev environment
npm run test:web:production       # Web tests against production
npm run test:web:headless         # Headless Chrome (CI-friendly)
npm run test:web:fresh            # Reset DB then run web:dev tests

# Android (requires connected device or emulator + APK in ./apps/)
npm run test:android              # Android tests against dev
npm run test:android:dev          # Same as above
npm run test:android:production   # Android tests against production

# iOS (Mac Mini only — requires manual Appium start)
npm run test:ios                  # iOS tests against dev
npm run test:ios:dev
npm run test:ios:production

# All (web + android)
npm run test:all                  # Both platforms, dev
npm run test:all:production       # Both platforms, production
```

### Database

```bash
npm run db:setup                  # Drop/recreate breakroom_test + seed test users
npm run db:sync-schema            # Pull schema from dev DB into schema.sql
npm run db:sync-schema:production # Pull schema from production DB
npm run db:sync-schema:dry-run    # Preview schema changes without applying
npm run db:state                  # Show last sync timestamp and source
```

### Reporting

```bash
npm run allure:generate           # Generate Allure HTML report from allure-results/
npm run allure:open               # Open Allure report in browser
npm run allure:report             # Generate + open

npm run lint                      # TypeScript type-check (no emit)
npm run clean                     # Delete allure-results/, allure-report/, dist/, logs/
```

### iOS — Manual Appium Start (Mac Mini)

iOS does NOT auto-start Appium (unlike Android). Before running iOS tests:

```bash
npx appium --base-path / --address localhost --port 4723
```

Then in a separate terminal: `npm run test:ios`

## Testing Workflow

### Always Report Results to Production

Test results are **always** posted to `https://www.prosaurus.com` (the production Breakroom instance) regardless of which environment the tests run against. This ensures all results — whether from a dev, local, or production test run — are visible in one place at the Prosaurus admin panel (`/admin/test-results`).

The `BREAKROOM_API_URL` in each `.env.test.*` file should always point to `https://www.prosaurus.com/api/test-results`. The `TEST_ENV` variable controls *which app* is being tested; it does not affect where results are sent.

### Full Suite vs. Single-Test Iteration

**Running the full suite:**
Run all tests sequentially when doing a baseline check or after a potentially broad change. Log all passes and failures.

```bash
npm run test:web:dev
npm run test:android:dev
```

**Fixing broken tests — one at a time:**
When the full suite reveals failures, fix them one test at a time. Run only the broken spec in a tight loop — make a change, re-run that single spec, observe the result, repeat — until it passes. Do not re-run the full suite until all broken tests have been individually fixed and verified.

Run a single spec file:
```bash
# Web
wdio run config/wdio.web.conf.ts --spec test/web/login.spec.ts

# Android
wdio run config/wdio.android.conf.ts --spec test/android/login.spec.ts

# iOS (Mac Mini only)
wdio run config/wdio.ios.conf.ts --spec test/ios/login.spec.ts
```

**The rule:** If 5 out of 60 tests fail, fix test #1 completely before touching test #2. Only re-run the full suite once all 5 are individually verified green.

## Environments

The `TEST_ENV` variable selects the environment config file:

| `TEST_ENV` | Config file | Base URL | DB source |
|------------|-------------|----------|-----------|
| `local` | `.env.test.local` | https://local.prosaurus.com | (not typically synced) |
| `dev` | `.env.test.dev` | https://test.dev.prosaurus.com | breakroom_dev |
| `production` | `.env.test.production` | https://test.prosaurus.com | breakroom |

All environments target `breakroom_test` as the test database.

## Test Users

Defined in `test/data/testUsers.ts` and seeded by `database/setup.ts`:

| Role | Handle | Email | Password |
|------|--------|-------|----------|
| Admin | `testadmin` | `testadmin@test.local` | `TestPass123` |
| Standard | `testuser` | `testuser@test.local` | `TestPass123` |
| Unverified | `testunverified` | `testunverified@test.local` | `TestPass123` |
| Invalid (not seeded) | `nonexistent` | `nonexistent@test.local` | `WrongPassword!` |

Always import from `test/data/testUsers.ts` — never hardcode credentials in specs.

## Test Specs

Each feature has a spec file for each active platform. All three platforms cover the same scenarios:

| Spec file | Feature |
|-----------|---------|
| `login.spec.ts` | Login form display, invalid creds, valid login (standard + admin), navigate to signup |
| `signup.spec.ts` | User registration |
| `logout.spec.ts` | Logout flow |
| `navigation.spec.ts` | Navigation between screens |
| `chat.spec.ts` | Chat functionality |
| `chat-notifications.spec.ts` | Notification behavior (web only) |
| `forgot-password.spec.ts` | Password recovery |
| `sessions.spec.ts` | Sessions/activity feature |
| `collections.spec.ts` | Collections management (create, read, update, delete) |
| `widget.spec.ts` | Widget functionality |

## Page Object Model (POM)

Each platform has its own `BasePage` and concrete page classes in `pages/<platform>/`. Tests import singleton instances:

```typescript
import LoginPage from '../../pages/android/LoginPage';
```

### Web (`pages/web/`)
- Elements: CSS selectors via WebdriverIO `$()` / `$$()`
- Global: `browser` (WebdriverIO global)
- Base URL controlled by `baseUrl` in wdio config

### Android (`pages/android/`)
- Elements: `this.rid('resource-id')` → `UiSelector().resourceId(id)`
- The Android app sets `testTag` + `testTagsAsResourceId = true` in Compose, which maps `Modifier.testTag("foo")` directly to the resource ID `"foo"`
- Global: `driver` (Appium/WebdriverIO)
- `BasePage.dismissEulaIfPresent()` — call after login; accepts EULA if it appears for fresh users

### iOS (`pages/ios/`)
- Elements: XCUITest selectors
- Global: `driver`
- iOS test config passes launch args: `-CLEAR_AUTH_STATE YES -TEST_API_URL <url>`
- `appium:autoAcceptAlerts: true` handles OS permission dialogs automatically

## Android Test Lifecycle

Each Android spec uses this `beforeEach` pattern to reset app state:

```typescript
beforeEach(async () => {
    await driver.terminateApp('com.cherryblossomdev.breakroom');
    await driver.pause(2000); // Let ChatService and sockets fully stop
    await driver.execute('mobile: clearApp', { appId: 'com.cherryblossomdev.breakroom' });
    await driver.activateApp('com.cherryblossomdev.breakroom');
    await LoginPage.waitForScreen(90000);
});
```

`clearApp` resets runtime permissions each cycle, so the OS notification permission dialog appears on every launch. `LoginPage.waitForScreen()` grants this permission programmatically before the test runs.

## Android Capabilities

```typescript
platformName: 'Android'
appium:deviceName: 'Pixel_7_API_34'    // override with DEVICE_NAME env var
appium:platformVersion: '14'            // override with PLATFORM_VERSION env var
appium:automationName: 'UiAutomator2'
appium:app: './apps/breakroom-dev.apk'  // or breakroom-productionTest.apk for production
appium:appPackage: 'com.cherryblossomdev.breakroom'
appium:appActivity: '.MainActivity'
appium:autoGrantPermissions: true
appium:newCommandTimeout: 240
```

Appium auto-starts on port 4723 when Android tests run (via `@wdio/appium-service`).

## iOS Capabilities

```typescript
platformName: 'iOS'
appium:deviceName: 'iPhone 17 Pro'      // override with DEVICE_NAME env var
appium:platformVersion: '26.2'          // override with PLATFORM_VERSION env var
appium:automationName: 'XCUITest'
appium:app: './apps/Breakroom.app'      // override with APP_PATH env var
appium:bundleId: 'com.cherryblossomdev.Breakroom'
appium:autoAcceptAlerts: true
appium:newCommandTimeout: 240
```

Appium must be started manually before iOS tests (see above).

## Reporting

### Spec Reporter
Live terminal output during test runs.

### Allure Reporter
Writes JSON to `allure-results/`. Run `npm run allure:report` to generate and open the HTML report. Screenshots are attached automatically on test failure.

### BreakroomReporter (custom)
Posts results to the Breakroom backend after each run via `POST /api/test-results/runs/bulk`. Includes platform, environment, git branch, commit hash, and per-suite/per-test results. Configured via:

- `BREAKROOM_API_URL` — e.g. `https://www.prosaurus.com/api/test-results`
- `BREAKROOM_TEST_API_KEY` — API key for authentication

Results are visible in the Breakroom admin panel at `/admin/test-results`.

## Database Management

`breakroom_test` is an isolated copy of the production schema with seeded test data.

### setup.ts
Drops and recreates `breakroom_test` from `database/schema.sql`, inserts system data (groups, permissions, chat rooms), and seeds the three test users with SHA-256 password hashes matching the Breakroom hashing algorithm.

### sync-schema.ts
Connects to the source database (dev or production), extracts the schema, sorts tables by foreign key dependency order, and writes `database/schema.sql`. Tables excluded from sync (test infrastructure only): `test_cases`, `test_runs`, `test_suites`.

Run `db:sync-schema` whenever the production schema changes before running `db:setup`.

## TypeScript Configuration

- Target: ES2022, Module: CommonJS
- Strict mode enabled
- Source includes: `test/**`, `config/**`, `pages/**`, `database/**`
- Types: `node`, `@wdio/globals/types`, `expect-webdriverio`, `mocha`
- Run `npm run lint` to type-check without compiling

## Key Conventions

1. **Selectors live in page objects.** Never put selectors directly in spec files.
2. **Test isolation:** `beforeEach` resets app/browser state completely. Tests must not depend on prior test state.
3. **Unique identifiers:** Tests that create content (sessions, collections, etc.) use `Date.now()` in names to avoid cross-test collisions.
4. **`driver` vs `browser`:** Mobile tests use `driver`; web tests use `browser`. Both are WebdriverIO globals but refer to different sessions.
5. **Timeouts:** Web Mocha timeout is 60s; Android/iOS is 120s. `waitForDisplayed` default is 10s (web) or 30s (mobile).
6. **Platform parity:** When adding a feature test, add it to all three platforms unless the feature is platform-specific.
