/**
 * Test Environment Manager
 *
 * Ensures the test environment is running before tests start.
 * If not running, it will automatically start the Docker containers.
 */

import { execSync, spawn } from 'child_process';
import * as https from 'https';
import * as path from 'path';

const BREAKROOM_DIR = process.env.BREAKROOM_DIR || path.resolve(__dirname, '..', '..', 'Breakroom');
const BASE_URL = process.env.BASE_URL || 'https://test.prosaurus.com:8443';
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds per attempt
const MAX_WAIT_TIME = 120000; // 2 minutes max to wait for environment
const CHECK_INTERVAL = 3000; // Check every 3 seconds

/**
 * Check if the test environment is reachable
 */
async function isEnvironmentRunning(): Promise<boolean> {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            resolve(false);
        }, HEALTH_CHECK_TIMEOUT);

        const url = new URL(BASE_URL);
        const req = https.request(
            {
                hostname: url.hostname,
                port: url.port || 443,
                path: '/',
                method: 'GET',
                rejectUnauthorized: false, // Accept self-signed certs
                timeout: HEALTH_CHECK_TIMEOUT,
            },
            (res) => {
                clearTimeout(timeout);
                // Any response means the server is running
                resolve(true);
            }
        );

        req.on('error', () => {
            clearTimeout(timeout);
            resolve(false);
        });

        req.on('timeout', () => {
            req.destroy();
            clearTimeout(timeout);
            resolve(false);
        });

        req.end();
    });
}

/**
 * Start the test environment using Docker Compose
 */
function startEnvironment(): void {
    console.log('\n[TestEnv] Starting test environment...');
    console.log(`[TestEnv] Breakroom directory: ${BREAKROOM_DIR}`);

    try {
        // Check if docker-compose.test.yml exists
        const composeFile = path.join(BREAKROOM_DIR, 'docker-compose.test.yml');

        // Start the containers
        execSync(
            `docker compose -f docker-compose.test.yml --env-file .env.test up -d`,
            {
                cwd: BREAKROOM_DIR,
                stdio: 'inherit',
            }
        );

        console.log('[TestEnv] Docker containers started');
    } catch (error: any) {
        console.error('[TestEnv] Failed to start environment:', error.message);
        throw new Error('Failed to start test environment. Make sure Docker is running.');
    }
}

/**
 * Wait for the environment to be ready
 */
async function waitForEnvironment(): Promise<void> {
    console.log(`[TestEnv] Waiting for environment to be ready at ${BASE_URL}...`);

    const startTime = Date.now();

    while (Date.now() - startTime < MAX_WAIT_TIME) {
        const isRunning = await isEnvironmentRunning();

        if (isRunning) {
            console.log('[TestEnv] Environment is ready!');
            return;
        }

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`[TestEnv] Waiting... (${elapsed}s elapsed)`);

        await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
    }

    throw new Error(
        `Test environment did not become ready within ${MAX_WAIT_TIME / 1000} seconds. ` +
            `Check Docker logs: docker compose -f docker-compose.test.yml logs`
    );
}

/**
 * Ensure the test environment is running
 * Call this from WebdriverIO's onPrepare hook
 */
export async function ensureTestEnvironment(): Promise<void> {
    console.log('\n[TestEnv] Checking test environment...');

    const isRunning = await isEnvironmentRunning();

    if (isRunning) {
        console.log('[TestEnv] Environment is already running');
        return;
    }

    console.log('[TestEnv] Environment is not running');

    // Start the environment
    startEnvironment();

    // Wait for it to be ready
    await waitForEnvironment();
}

export { isEnvironmentRunning, startEnvironment, waitForEnvironment };
