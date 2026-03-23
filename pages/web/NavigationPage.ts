import BasePage from './BasePage';

/**
 * Page object for navigation tests.
 * Provides helpers to navigate to a path and assert the page loaded without
 * an unexpected redirect (e.g., to /about for unauthenticated access or
 * to /breakroom for non-admin access).
 */
class NavigationPage extends BasePage {
    /**
     * Navigate to a path and wait for the SPA router to settle.
     */
    async navigateTo(path: string): Promise<void> {
        await browser.url(path);
    }

    /**
     * Assert that the browser's current URL contains `expectedPath`.
     * Waits up to 10 s to allow the Vue router's async beforeEach guards to resolve.
     */
    async assertPageLoaded(expectedPath: string): Promise<void> {
        await browser.waitUntil(
            async () => {
                const url = await browser.getUrl();
                return url.includes(expectedPath);
            },
            {
                timeout: 10000,
                timeoutMsg: async () => {
                    const actual = await browser.getUrl();
                    return `Expected URL to contain "${expectedPath}" but got "${actual}"`;
                },
            }
        );
    }
}

export default new NavigationPage();
