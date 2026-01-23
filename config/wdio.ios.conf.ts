import path from 'path';
import dotenv from 'dotenv';
import BreakroomReporter from '../reporters/BreakroomReporter';

// Load environment variables from .env.test
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });

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
    specs: ['./test/ios/**/*.spec.ts'],
    exclude: [],

    //
    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [
        {
            platformName: 'iOS',
            'appium:deviceName': process.env.DEVICE_NAME || 'iPhone 15',
            'appium:platformVersion': process.env.PLATFORM_VERSION || '17.0',
            'appium:automationName': 'XCUITest',
            'appium:app': process.env.APP_PATH || path.resolve('./apps/breakroom.app'),
            'appium:bundleId': 'com.example.breakroom',
            'appium:noReset': false,
            'appium:fullReset': false,
            'appium:newCommandTimeout': 240,
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
    services: [
        [
            'appium',
            {
                args: {
                    address: 'localhost',
                    port: 4723,
                },
                logPath: './logs',
            },
        ],
    ],
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
