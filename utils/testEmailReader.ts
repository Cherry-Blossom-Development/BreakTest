/**
 * Test Email Reader Utility
 *
 * Fetches verification/reset emails from the backend's test-only API endpoints.
 * When NODE_ENV=test, the backend writes emails to disk instead of sending via SES,
 * and exposes them at /api/auth/test-emails/:email and /api/auth/test-emails/reset/:email.
 */

interface TestEmail {
    to: string;
    from: string;
    subject: string;
    html: string;
    verificationToken: string;
    resetToken?: string;
    timestamp: string;
}

function getApiBase(): string {
    return (process.env.BASE_URL || 'https://test.dev.prosaurus.com').replace(/\/$/, '');
}

async function fetchWithRetry(url: string, email: string, timeout: number): Promise<TestEmail> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        try {
            const res = await fetch(url);
            if (res.ok) {
                return await res.json() as TestEmail;
            }
            // 404 = not written yet; keep polling
        } catch {
            // Network error — keep polling
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new Error(`Test email for ${email} not found within ${timeout}ms`);
}

/**
 * Gets a signup verification email by address, polling until it appears.
 */
export async function getTestEmail(email: string, timeout: number = 10000): Promise<TestEmail> {
    const url = `${getApiBase()}/api/auth/test-emails/${encodeURIComponent(email)}`;
    return fetchWithRetry(url, email, timeout);
}

/**
 * Clears a signup verification email file via the API.
 */
export async function clearTestEmail(email: string): Promise<void> {
    const url = `${getApiBase()}/api/auth/test-emails/${encodeURIComponent(email)}`;
    try { await fetch(url, { method: 'DELETE' }); } catch { /* best-effort */ }
}

/**
 * Gets a password reset email by address, polling until it appears.
 */
export async function getResetEmail(email: string, timeout: number = 10000): Promise<TestEmail> {
    const url = `${getApiBase()}/api/auth/test-emails/reset/${encodeURIComponent(email)}`;
    return fetchWithRetry(url, email, timeout);
}

/**
 * Clears a password reset email file via the API.
 */
export async function clearResetEmail(email: string): Promise<void> {
    const url = `${getApiBase()}/api/auth/test-emails/reset/${encodeURIComponent(email)}`;
    try { await fetch(url, { method: 'DELETE' }); } catch { /* best-effort */ }
}

/**
 * No-op — bulk clear not available via API; clear individually if needed.
 */
export async function clearAllTestEmails(): Promise<void> {}
