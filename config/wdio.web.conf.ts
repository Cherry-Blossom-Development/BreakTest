import type { Options } from '@wdio/types';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');

export const config: Options.Testrunner = {
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
    ],

    //
    // Hooks
    // =====
    afterTest: async function (test, context, { error, passed }) {
        if (!passed) {
            await browser.takeScreenshot();
        }
    },
};
