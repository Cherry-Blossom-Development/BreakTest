import path from 'path';
import dotenv from 'dotenv';
import BreakroomReporter from '../reporters/BreakroomReporter';
import { ensureTestEnvironment } from '../utils/ensureTestEnv';

const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env.test
dotenv.config({ path: path.join(rootDir, '.env.test') });

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
                args: process.env.HEADLESS === 'true'
                    ? ['--headless', '--disable-gpu', '--ignore-certificate-errors']
                    : ['--ignore-certificate-errors'],
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
    baseUrl: process.env.BASE_URL || 'https://test.prosaurus.com:8443',
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

    /**
     * Gets executed once before all workers get launched.
     * Ensures the test environment is running before tests start.
     */
    onPrepare: async function () {
        await ensureTestEnvironment();
    },

    afterTest: async function (test: any, context: any, { error, passed }: { error?: Error; passed: boolean }) {
        if (!passed) {
            await browser.takeScreenshot();
        }
    },
};
