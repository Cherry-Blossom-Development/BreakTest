/**
 * Base page object containing common methods for web pages
 */
export default class BasePage {
    /**
     * Opens a page by its path
     * @param path - The path to open (appended to baseUrl)
     */
    async open(path: string): Promise<void> {
        await browser.url(path);
    }

    /**
     * Waits for an element to be displayed
     * @param selector - The element selector
     * @param timeout - Optional timeout in ms
     */
    async waitForDisplayed(selector: string, timeout = 10000): Promise<void> {
        const element = await $(selector);
        await element.waitForDisplayed({ timeout });
    }

    /**
     * Waits for an element to be clickable
     * @param selector - The element selector
     * @param timeout - Optional timeout in ms
     */
    async waitForClickable(selector: string, timeout = 10000): Promise<void> {
        const element = await $(selector);
        await element.waitForClickable({ timeout });
    }

    /**
     * Gets the current page title
     */
    async getTitle(): Promise<string> {
        return browser.getTitle();
    }

    /**
     * Gets the current URL
     */
    async getUrl(): Promise<string> {
        return browser.getUrl();
    }

    /**
     * Takes a screenshot
     * @param filename - Optional filename for the screenshot
     */
    async takeScreenshot(filename?: string): Promise<string> {
        return browser.takeScreenshot();
    }
}
