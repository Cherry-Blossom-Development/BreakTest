import path from 'path';
import dotenv from 'dotenv';

// Load demo environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.demo') });

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
    // Specify Demo Scripts
    // ==================
    specs: ['./demos/scripts/**/*.demo.ts'],
    exclude: [],

    //
    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [
        {
            platformName: 'iOS',
            'appium:deviceName': process.env.DEMO_DEVICE_NAME || 'iPhone 15 Pro',
            'appium:platformVersion': process.env.DEMO_PLATFORM_VERSION || '17.0',
            'appium:automationName': 'XCUITest',
            'appium:app': process.env.DEMO_APP_PATH || path.resolve('./apps/Breakroom-Demo.app'),
            'appium:bundleId': 'com.cherryblossom.breakroom',
            'appium:noReset': false,
            'appium:fullReset': false,
            'appium:newCommandTimeout': 300,
            // Demo-specific: longer timeouts for natural pacing
            'appium:wdaLaunchTimeout': 120000,
            'appium:wdaConnectionTimeout': 120000,
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
        timeout: 300000, // 5 minutes - demos are longer than tests
    },

    //
    // Reporters - minimal for demos
    // =========
    reporters: ['spec'],

    //
    // Hooks
    // =====
    beforeSession: async function () {
        console.log('Starting demo session...');
        console.log(`Device: ${process.env.DEMO_DEVICE_NAME || 'iPhone 15 Pro'}`);
        console.log(`App: ${process.env.DEMO_APP_PATH || './apps/Breakroom-Demo.app'}`);
    },

    afterSession: async function () {
        console.log('Demo session complete.');
    },
};
