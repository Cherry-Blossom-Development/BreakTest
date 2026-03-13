/**
 * Test Email Reader Utility
 *
 * Reads verification emails written by the backend in test mode.
 * When NODE_ENV=test, the backend writes emails to files instead of sending them.
 */

import * as fs from 'fs';
import * as path from 'path';

const BREAKROOM_DIR = process.env.BREAKROOM_DIR ||
    path.resolve(__dirname, '..', '..', 'Breakroom');
// Test emails are written to backend/test-emails (inside Docker-mounted volume)
const TEST_EMAIL_DIR = path.join(BREAKROOM_DIR, 'backend', 'test-emails');

interface TestEmail {
    to: string;
    from: string;
    subject: string;
    html: string;
    verificationToken: string;
    timestamp: string;
}

/**
 * Gets a test email by email address, waiting for it to appear
 * @param email - The email address to look for
 * @param timeout - Max time to wait in ms (default 10000)
 */
export async function getTestEmail(
    email: string,
    timeout: number = 10000
): Promise<TestEmail> {
    const filePath = path.join(TEST_EMAIL_DIR, `${email}.json`);
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new Error(`Test email for ${email} not found within ${timeout}ms`);
}

/**
 * Clears a specific test email file
 * @param email - The email address to clear
 */
export function clearTestEmail(email: string): void {
    const filePath = path.join(TEST_EMAIL_DIR, `${email}.json`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

/**
 * Gets a password reset email by email address, waiting for it to appear.
 * Reset emails are written as reset-${email}.json by the backend.
 * @param email - The email address to look for
 * @param timeout - Max time to wait in ms (default 10000)
 */
export async function getResetEmail(
    email: string,
    timeout: number = 10000
): Promise<TestEmail> {
    const filePath = path.join(TEST_EMAIL_DIR, `reset-${email}.json`);
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new Error(`Reset email for ${email} not found within ${timeout}ms`);
}

/**
 * Clears a specific password reset email file
 * @param email - The email address to clear
 */
export function clearResetEmail(email: string): void {
    const filePath = path.join(TEST_EMAIL_DIR, `reset-${email}.json`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

/**
 * Clears all test email files
 */
export function clearAllTestEmails(): void {
    if (fs.existsSync(TEST_EMAIL_DIR)) {
        const files = fs.readdirSync(TEST_EMAIL_DIR);
        for (const file of files) {
            fs.unlinkSync(path.join(TEST_EMAIL_DIR, file));
        }
    }
}
