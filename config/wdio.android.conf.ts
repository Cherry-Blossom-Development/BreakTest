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
        path.join(rootDir, 'test', 'android', '**', '*.spec.ts'),
    ],
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
            'appium:app': process.env.APP_PATH || path.resolve(
                testEnv === 'production'
                    ? './apps/breakroom-productionTest.apk'
                    : testEnv === 'local'
                        ? './apps/breakroom-debug.apk'
                        : './apps/breakroom-dev.apk'
            ),
            'appium:appPackage': 'com.cherryblossomdev.breakroom',
            'appium:appActivity': '.MainActivity',
            'appium:noReset': false,
            'appium:fullReset': false,
            'appium:autoGrantPermissions': true,
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
                    address: '127.0.0.1',
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
