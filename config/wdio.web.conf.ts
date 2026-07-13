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
            project: path.join(rootDir, 'tsconfig.json'),
            transpileOnly: true,
        },
    },

    //
    // ==================
    // Specify Test Files
    // ==================
    specs: [
        path.join(rootDir, 'test', 'web', '**', '*.spec.ts'),
    ],
    exclude: [],

    //
    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [
        {
            browserName: 'chrome',
            'goog:chromeOptions': {
                // Fake mic flags let live-recording tests (Sessions) call getUserMedia
                // without a real device or an OS permission prompt blocking the run.
                args: process.env.HEADLESS === 'true'
                    ? ['--headless', '--disable-gpu', '--ignore-certificate-errors', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']
                    : ['--ignore-certificate-errors', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
            },
            acceptInsecureCerts: true,
        },
    ],

    //
    // ===================
    // Test Configurations
    // ===================
    logLevel: 'info',
    bail: 0,
    baseUrl: process.env.BASE_URL || 'https://dev.prosaurus.com',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,

    //
    // Framework
    // =========
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
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
                platform: 'web',
            },
        ],
    ],

    //
    // Hooks
    // =====

    afterTest: async function (test: any, context: any, { error, passed }: { error?: Error; passed: boolean }) {
        if (!passed) {
            await browser.takeScreenshot();
        }
    },
};
