import path from 'path';
import dotenv from 'dotenv';
import BreakroomReporter from '../reporters/BreakroomReporter';

const rootDir = path.resolve(__dirname, '..');

// Load environment variables — TEST_ENV selects the target environment (dev | production)
const testEnv = process.env.TEST_ENV || 'dev';
dotenv.config({ path: path.join(rootDir, `.env.test.${testEnv}`) });

export const config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            project: './tsconfig.json',
            transpileOnly: true,
        },
    },

    //
    // ==================
    // Specify Test Files
    // ==================
    specs: [
        path.join(rootDir, 'test', 'ios', '**', '*.spec.ts'),
    ],
    exclude: [],

    //
    // ============
    // Capabilities
    // ============
    // Run tests sequentially - only one spec file at a time
    // This is necessary because all tests share the same iOS simulator
    maxInstances: 1,
    maxInstancesPerCapability: 1,
    capabilities: [
        {
            platformName: 'iOS',
            'appium:deviceName': process.env.DEVICE_NAME || 'iPhone 17 Pro',
            'appium:platformVersion': process.env.PLATFORM_VERSION || '26.2',
            'appium:automationName': 'XCUITest',
            'appium:app': process.env.APP_PATH || path.resolve('./apps/Breakroom.app'),
            'appium:bundleId': 'com.cherryblossomdev.Breakroom',
            'appium:noReset': false,
            'appium:fullReset': false,
            'appium:newCommandTimeout': 240,
            // Auto-accept iOS system alerts (push notifications, location, etc.)
            'appium:autoAcceptAlerts': true,
            // Pass test configuration via launch arguments
            // Format: -KEY VALUE sets UserDefaults.standard.object(forKey: "KEY")
            'appium:processArguments': {
                args: [
                    '-TEST_API_URL',
                    process.env.TEST_API_URL || (testEnv === 'production' ? 'https://www.prosaurus.com' : 'https://dev.prosaurus.com'),
                    '-CLEAR_AUTH_STATE',
                    'YES',
                ],
            },
        },
    ],

    //
    // ===================
    // Test Configurations
    // ===================
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 30000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    //
    // Appium Service
    // ==============
    // Appium should be started manually before running tests:
    // npx appium --base-path / --address localhost --port 4723
    services: [],
    port: 4723,

    //
    // Framework
    // =========
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 120000,
    },

    //
    // Reporters
    // =========
    reporters: [
        'spec',
        [
            'allure',
            {
                outputDir: 'allure-results',
                disableWebdriverStepsReporting: true,
                disableWebdriverScreenshotsReporting: false,
            },
        ],
        [
            BreakroomReporter,
            {
                platform: 'ios',
            },
        ],
    ],

    //
    // Hooks
    // =====
    afterTest: async function (test: any, context: any, { error, passed }: { error?: Error; passed: boolean }) {
        if (!passed) {
            await driver.takeScreenshot();
        }
    },
};
