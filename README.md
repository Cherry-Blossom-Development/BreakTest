# BreakTest

End-to-end test automation framework for Breakroom application using WebdriverIO with TypeScript.

## Features

- **Web Testing**: Selenium-based browser automation
- **Android Testing**: Appium-based mobile automation
- **iOS Testing**: Appium-based mobile automation (coming soon)
- **Page Object Model**: Organized, maintainable test structure
- **Allure Reporting**: Beautiful test reports with screenshots

## Prerequisites

- Node.js 18+
- Java JDK 11+ (for Appium)
- Android SDK (for Android testing)
- Xcode (for iOS testing, macOS only)
- Chrome browser (for web testing)

### For Android Testing

1. Install Android Studio and set up an emulator
2. Set `ANDROID_HOME` environment variable
3. Install Appium drivers:
   ```bash
   npx appium driver install uiautomator2
   ```

### For iOS Testing

1. Install Xcode (macOS only)
2. Install Appium drivers:
   ```bash
   npx appium driver install xcuitest
   ```

## Installation

```bash
npm install
```

## Project Structure

```
BreakTest/
├── config/                 # WebdriverIO configuration files
│   ├── wdio.web.conf.ts   # Web/Selenium config
│   ├── wdio.android.conf.ts # Android/Appium config
│   └── wdio.ios.conf.ts   # iOS/Appium config
├── pages/                  # Page Object classes
│   ├── web/               # Web page objects
│   ├── android/           # Android page objects
│   └── ios/               # iOS page objects
├── test/                   # Test specifications
│   ├── web/               # Web tests
│   ├── android/           # Android tests
│   └── ios/               # iOS tests
├── apps/                   # Mobile app binaries (APK/IPA)
└── logs/                   # Appium logs
```

## Running Tests

### Web Tests

```bash
# Run web tests with browser visible
npm run test:web

# Run web tests headless
npm run test:web:headless
```

### Android Tests

1. Place your APK file in `apps/breakroom.apk`
2. Start an Android emulator or connect a device
3. Run tests:
   ```bash
   npm run test:android
   ```

### iOS Tests

1. Place your .app file in `apps/breakroom.app`
2. Start an iOS simulator
3. Run tests:
   ```bash
   npm run test:ios
   ```

### Run All Tests

```bash
npm run test:all
```

## Test Reports

Generate and view Allure reports:

```bash
# Generate report from results
npm run allure:generate

# Open report in browser
npm run allure:open

# Generate and open in one command
npm run allure:report
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Web app base URL | `https://local.prosaurus.com` |
| `HEADLESS` | Run browser headless | `false` |
| `DEVICE_NAME` | Android/iOS device name | `Pixel_7_API_34` |
| `PLATFORM_VERSION` | Mobile OS version | `14` |
| `APP_PATH` | Path to mobile app | `./apps/breakroom.apk` |
| `TEST_USERNAME` | Test user email | - |
| `TEST_PASSWORD` | Test user password | - |

## Writing Tests

### Web Test Example

```typescript
import LoginPage from '../../pages/web/LoginPage';

describe('Login', () => {
    it('should login successfully', async () => {
        await LoginPage.open();
        await LoginPage.login('user@example.com', 'password');
        expect(await browser.getUrl()).not.toContain('login');
    });
});
```

### Android Test Example

```typescript
import LoginPage from '../../pages/android/LoginPage';

describe('Login', () => {
    it('should login successfully', async () => {
        await LoginPage.waitForScreen();
        await LoginPage.login('user@example.com', 'password');
        expect(await LoginPage.isDisplayed()).toBe(false);
    });
});
```

## Contributing

1. Create a new branch for your feature/fix
2. Write tests following the Page Object Model pattern
3. Ensure all tests pass before submitting PR

## License

ISC
