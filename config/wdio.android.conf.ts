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
    specs: ['./test/android/**/*.spec.ts'],
    exclude: [],

    //
    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [
        {
            platformName: 'Android',
            'appium:deviceName': process.env.DEVICE_NAME || 'Pixel_7_API_34',
            'appium:platformVersion': process.env.PLATFORM_VERSION || '14',
            'appium:automationName': 'UiAutomator2',
            'appium:app': process.env.APP_PATH || path.resolve('./apps/breakroom.apk'),
            'appium:appPackage': 'com.cherryblossomdev.breakroom',
            'appium:appActivity': '.MainActivity',
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
                platform: 'android',
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
